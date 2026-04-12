"""
这是基于fastapi的服务器入口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import sys
import io
import os

from src.schemas import HealthResponse
from src.agent import get_agent_factory
from src.config.config import get_config
from loguru import logger

from src.api import reset_router, chat_router, test_router, auth_router, rag_router, conversation_router, cold_start_router, admin_router, chat_test_router, token_stats_router, assistant_conversations_router, video_router
from src.api.rag.pipeline import IngestionPipeline, RetrievalPipeline

# 头像上传目录
AVATAR_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "data", "avatars")
os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)

# 视频存储目录
VIDEO_STORAGE_DIR = os.path.join(os.path.dirname(__file__), "temp", "videos")
os.makedirs(VIDEO_STORAGE_DIR, exist_ok=True)


# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Initialize chat agent factory on startup
    """

    # Startup: Initialize the chat agent factory
    logger.info("Starting up Sam Lang Backend...")

    # 初始化数据库
    from src.db import init_db
    init_db()
    logger.info("Database initialized")

    # 初始化 Agent 工厂（替代原来的单例 Agent）
    config = get_config()
    app.state.agent_factory = get_agent_factory(config)
    logger.info("Agent Factory 已初始化")
    logger.info(f"使用模型: {config.llm.model_name}")
    logger.info(f"API 地址: {config.llm.base_url}")
    logger.info(f"ReACT 最大迭代次数: {config.agent.react_max_iterations}")
    logger.info(f"记忆窗口大小: {config.agent.max_history} 轮\n")

    # 初始化冷启动预测模型
    try:
        from src.code_start import StudentScorePredictor

        app.state.cold_start_predictor = StudentScorePredictor().load()
        logger.info("冷启动预测模型加载成功")
    except Exception as e:
        logger.error(f"冷启动预测模型加载失败: {e}")
        app.state.cold_start_predictor = None
        logger.warning("冷启动功能将不可用\n")

    # 初始化 RAG Pipeline
    try:
        from src.rag.rag import RAG
        from src.ocr import get_ocr_client

        ocr_client = get_ocr_client()

        rag = RAG.from_config(
            rag_config=config.rag,
            embedding_config=config.embedding,
            rerank_config=config.rerank,
            ocr_client=ocr_client
        )

        app.state.ingestion_pipeline = IngestionPipeline(rag)
        app.state.retrieval_pipeline = RetrievalPipeline(rag)

        logger.info("=" * 50)
        logger.info("RAG Pipeline 初始化成功")
        logger.info("=" * 50)
        logger.info(f"Milvus Collection: {config.rag.collection_name}")
        logger.info(f"  - Vector dim: {config.rag.vector_dim}")
        logger.info(f"  - Milvus Server: {config.rag.milvus.host}:{config.rag.milvus.port}")
        logger.info(f"  - Top K: {config.rag.top_k}")
        logger.info(f"  - Rerank: {'启用' if config.rag.use_rerank else '禁用'}")
        logger.info("=" * 50)
        logger.info("")
    except Exception as e:
        logger.error(f"RAG Pipeline 初始化失败: {e}")
        logger.warning("RAG 功能将不可用\n")

    # 初始化 PPIO 沙箱连接
    try:
        if config.tool.ppio_sandbox.enabled:
            from src.agent.mcp.tools.ppio_sandbox import (
                PPIOSandboxClient,
                create_storage,
                RemotionExecutor
            )
            
            logger.info("正在初始化 PPIO 沙箱连接...")
            
            # 创建 PPIO 客户端
            ppio_client = PPIOSandboxClient(
                api_key=config.tool.ppio_sandbox.api_key,
                base_url=config.tool.ppio_sandbox.base_url 
                    if config.tool.ppio_sandbox.base_url != "https://api.ppio.cloud" 
                    else None
            )
            
            # 测试连接
            test_sandbox = ppio_client.create_sandbox()
            ppio_client.kill_sandbox(test_sandbox.sandbox_id)
            
            # 创建存储实例
            storage = create_storage({
                "type": config.tool.ppio_sandbox.video_storage.type,
                "local_path": config.tool.ppio_sandbox.video_storage.local_path,
                "local_url": config.tool.ppio_sandbox.video_storage.local_url,
            })
            
            # 创建 Remotion 执行器
            app.state.ppio_executor = RemotionExecutor(
                client=ppio_client,
                storage=storage,
                config={}
            )
            
            logger.info("✓ PPIO 沙箱连接成功")
            logger.info(f"  - API 地址: {config.tool.ppio_sandbox.base_url}")
            logger.info(f"  - 存储类型: {config.tool.ppio_sandbox.video_storage.type}")
            logger.info(f"  - Remotion 超时: {config.tool.ppio_sandbox.remotion.timeout}秒")
            logger.info("")
        else:
            logger.info("PPIO 沙箱已禁用（在 config.yaml 中设置 enabled: true 启用）")
            app.state.ppio_executor = None
    except Exception as e:
        logger.error(f"PPIO 沙箱初始化失败: {e}")
        app.state.ppio_executor = None
        logger.warning("PPIO 功能将不可用\n")

    yield

    # Shutdown: cleanup if needed
    logger.info("Shutting down Pixel Chatbot Backend...")

    # 关闭 RAG 资源
    if hasattr(app.state, "ingestion_pipeline"):
        try:
            app.state.ingestion_pipeline.rag.close()
            logger.info("RAG 资源已释放")
        except Exception as e:
            logger.error(f"关闭 RAG 资源失败: {e}")

    # 清理 PPIO 资源
    if hasattr(app.state, "ppio_executor") and app.state.ppio_executor:
        try:
            # PPIO 沙箱是按需创建和销毁的，这里不需要特别清理
            # 但如果有持久化的连接可以在这里关闭
            logger.info("PPIO 资源已释放")
        except Exception as e:
            logger.error(f"关闭 PPIO 资源失败: {e}")


# Create FastAPI application
app = FastAPI(
    title="Sam College",
    description="Backend API for Sam College",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthResponse)
async def root():
    """
    Root endpoint - health check
    """
    return {
        "status": "healthy",
        "message": "Welcome to Pixel Chatbot API",
        "version": "0.1.0"
    }

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    """
    # 获取工厂统计信息
    factory_stats = {}
    if hasattr(app.state, "agent_factory"):
        factory_stats = app.state.agent_factory.get_stats()
    
    # 获取 PPIO 状态
    ppio_status = "disabled"
    if hasattr(app.state, "ppio_executor") and app.state.ppio_executor:
        ppio_status = "connected"
    elif hasattr(app.state, "ppio_executor"):
        ppio_status = "disconnected"
    
    return {
        "status": "healthy",
        "message": "API is running",
        "version": "0.1.0",
        "agent_factory": factory_stats,
        "ppio_sandbox": ppio_status
    }

# Include routers
app.include_router(reset_router)
app.include_router(chat_router)
app.include_router(test_router)
app.include_router(auth_router)
app.include_router(rag_router)
app.include_router(conversation_router)
app.include_router(cold_start_router)
app.include_router(admin_router)
app.include_router(chat_test_router)
app.include_router(token_stats_router)
app.include_router(assistant_conversations_router)
app.include_router(video_router)

# 挂载头像静态文件服务
app.mount("/api/avatars", StaticFiles(directory=AVATAR_UPLOAD_DIR), name="avatars")

# 挂载视频静态文件服务（本地存储模式）
app.mount("/videos", StaticFiles(directory=VIDEO_STORAGE_DIR), name="videos")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
