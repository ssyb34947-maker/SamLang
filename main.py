"""
这是基于fastapi的服务器入口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import io

from src.schemas import HealthResponse
from src.service import create_chat_agent
from src.config.config import get_config
from loguru import logger

from src.api import reset_router, chat_router, test_router, auth_router


# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Initialize chat agent on startup
    """
    
    # Startup: Initialize the chat agent
    logger.info("Starting up Sam Lang Backend...")
    
    # 初始化数据库
    from src.db.user import init_db
    init_db()
    logger.info("Database initialized")
    
    app.state.agent = create_chat_agent()
    app.state.config = get_config()
    logger.info(f"ConversationAgent 已创建" if app.state.agent else "ConversationAgent 创建失败")
    logger.info(f"使用模型: {app.state.config.llm.model_name}")
    logger.info(f"API 地址: {app.state.config.llm.base_url}")
    logger.info(f"ReACT 模式: {'启用' if app.state.agent.use_react else '禁用'}")
    logger.info(f"最大迭代次数: {app.state.config.agent.react_max_iterations}\n")
        
    yield
    
    # Shutdown: cleanup if needed
    logger.info("Shutting down Pixel Chatbot Backend...")


# Create FastAPI application
app = FastAPI(
    title="Sam Lang",
    description="Backend API for Sam Lang with ReACT agent",
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
    return {
        "status": "healthy",
        "message": "API is running",
        "version": "0.1.0"
    }

# Include routers
app.include_router(reset_router)
app.include_router(chat_router)
app.include_router(test_router)
app.include_router(auth_router)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
