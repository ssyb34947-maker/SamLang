"""
Chat Test API
提供无需鉴权的Agent对话测试接口
用于测试Agent的对话能力，完全隔离的上下文，不共享任何记忆
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from loguru import logger
import asyncio
import json
import queue
import threading
import uuid

router = APIRouter(tags=["chat-test"])


class ChatTestRequest(BaseModel):
    """
    Chat测试请求模型
    """
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="用户消息"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="测试会话ID，用于保持同一测试会话的上下文。为空则创建新会话"
    )
    use_react: Optional[bool] = Field(
        default=True,
        description="是否使用ReACT模式"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "你好，介绍一下你自己",
                "session_id": None,
                "use_react": True
            }
        }


class ChatTestResponse(BaseModel):
    """
    Chat测试响应模型
    """
    success: bool = Field(..., description="请求是否成功")
    message: str = Field(..., description="AI回复消息")
    session_id: str = Field(..., description="测试会话ID")
    is_new_session: bool = Field(..., description="是否为新创建的会话")
    timestamp: datetime = Field(..., description="响应时间戳")


# 测试Agent管理器类
class TestAgentManager:
    """
    测试Agent管理器
    管理完全隔离的测试Agent实例，不与其他Agent共享任何记忆
    """

    def __init__(self):
        self._agents: dict = {}
        logger.info("[TestAgentManager] 测试Agent管理器已初始化")

    def get_or_create_agent(self, session_id: str, config, use_react: bool = True):
        """
        获取或创建测试Agent
        每个session_id对应一个完全独立的Agent实例
        """
        from src.agent import ConversationAgent

        if session_id not in self._agents:
            logger.info(f"[TestAgentManager] 创建新的测试Agent: session_id={session_id}")
            agent = ConversationAgent(
                user_id=f"test_{session_id}",
                conversation_id=session_id,
                role="student",
                config=config,
                use_react=use_react,
                verbose=False,
                stream=True
            )
            self._agents[session_id] = agent
        else:
            logger.debug(f"[TestAgentManager] 复用现有测试Agent: session_id={session_id}")

        return self._agents[session_id]

    def clear_session(self, session_id: str) -> bool:
        """清除指定会话的Agent"""
        if session_id in self._agents:
            del self._agents[session_id]
            logger.info(f"[TestAgentManager] 已清除测试会话: {session_id}")
            return True
        return False

    def clear_all(self) -> int:
        """清除所有测试Agent"""
        count = len(self._agents)
        self._agents.clear()
        logger.info(f"[TestAgentManager] 已清除所有 {count} 个测试Agent")
        return count

    def get_stats(self) -> dict:
        """获取测试Agent统计信息"""
        return {
            "total_test_agents": len(self._agents),
            "sessions": list(self._agents.keys())
        }


# 全局测试Agent管理器实例
test_agent_manager = TestAgentManager()


def get_test_agent_manager() -> TestAgentManager:
    """获取测试Agent管理器实例"""
    return test_agent_manager


@router.post("/api/chat-test/stream")
async def chat_test_stream(request: ChatTestRequest, req: Request):
    """
    测试聊天接口 - 流式响应
    无需鉴权，完全隔离的上下文，用于测试Agent对话能力

    特点：
    - 无需登录/鉴权
    - 每个session_id有独立的上下文和记忆
    - 不与其他Agent共享任何记忆
    - 不持久化到数据库
    """
    logger.info(f"[CHAT_TEST_STREAM] 收到测试请求: session_id={request.session_id}")

    user_message = request.message.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="消息不能为空")

    # 生成或使用现有的session_id
    is_new_session = not request.session_id
    session_id = request.session_id or f"test_{uuid.uuid4().hex[:12]}"

    try:
        # 获取配置
        from src.config import get_config
        config = get_config()

        # 获取或创建测试Agent（完全隔离的上下文）
        agent = test_agent_manager.get_or_create_agent(
            session_id=session_id,
            config=config,
            use_react=request.use_react
        )

        logger.info(f"[CHAT_TEST_STREAM] 测试Agent准备就绪: session_id={session_id}")

        async def event_generator():
            """生成SSE事件"""
            event_queue = queue.Queue()
            full_response = ""

            def thinking_callback(event_type: str, data: dict):
                event_queue.put({"type": event_type, "data": data})

            def token_callback(token: str):
                event_queue.put({
                    "type": "token",
                    "data": {"content": token}
                })

            def run_agent():
                try:
                    response = agent.chat(
                        user_message,
                        thinking_callback=thinking_callback,
                        token_callback=token_callback
                    )
                    event_queue.put({
                        "type": "final_response",
                        "data": {"content": response}
                    })
                except Exception as e:
                    logger.error(f"[CHAT_TEST_STREAM] Agent错误: {e}")
                    event_queue.put({"type": "error", "data": {"message": str(e)}})

            # 启动AI处理线程
            thread = threading.Thread(target=run_agent)
            thread.start()

            # 流式发送事件
            while True:
                try:
                    event = await asyncio.wait_for(
                        asyncio.to_thread(event_queue.get, timeout=0.01),
                        timeout=60.0
                    )

                    event_type = event.get("type")
                    data = event.get("data")

                    if event_type == "token":
                        full_response += data.get("content", "")
                        yield f"data: {json.dumps(event)}\n\n"

                    elif event_type in ["thinking_step", "tool_call", "tool_result"]:
                        yield f"data: {json.dumps(event)}\n\n"

                    elif event_type == "final_response":
                        full_response = data.get("content", full_response)
                        logger.info(f"[CHAT_TEST_STREAM] AI回复完成, 长度={len(full_response)}")

                        # 在最终响应中包含session_id
                        data['session_id'] = session_id
                        data['is_new_session'] = is_new_session

                        yield f"data: {json.dumps({'type': 'final_response', 'data': data})}\n\n"
                        break

                    elif event_type == "error":
                        yield f"data: {json.dumps(event)}\n\n"
                        break

                except asyncio.TimeoutError:
                    yield f"data: {json.dumps({'type': 'error', 'data': {'message': '流式响应超时'}})}\n\n"
                    break
                except queue.Empty:
                    await asyncio.sleep(0.001)
                    continue

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )

    except Exception as e:
        logger.error(f"[CHAT_TEST_STREAM] 错误: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"AI响应失败: {str(e)}")


@router.post("/api/chat-test", response_model=ChatTestResponse)
async def chat_test(request: ChatTestRequest):
    """
    测试聊天接口 - 非流式响应
    无需鉴权，完全隔离的上下文，用于测试Agent对话能力

    特点：
    - 无需登录/鉴权
    - 每个session_id有独立的上下文和记忆
    - 不与其他Agent共享任何记忆
    - 不持久化到数据库
    """
    logger.info(f"[CHAT_TEST] 收到测试请求: session_id={request.session_id}")

    user_message = request.message.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="消息不能为空")

    # 生成或使用现有的session_id
    is_new_session = not request.session_id
    session_id = request.session_id or f"test_{uuid.uuid4().hex[:12]}"

    try:
        # 获取配置
        from src.config import get_config
        config = get_config()

        # 获取或创建测试Agent（完全隔离的上下文）
        agent = test_agent_manager.get_or_create_agent(
            session_id=session_id,
            config=config,
            use_react=request.use_react
        )

        # 获取AI响应
        ai_response = agent.chat(user_message)

        logger.info(f"[CHAT_TEST] AI回复完成, 长度={len(ai_response)}")

        return ChatTestResponse(
            success=True,
            message=ai_response,
            session_id=session_id,
            is_new_session=is_new_session,
            timestamp=datetime.now()
        )

    except Exception as e:
        logger.error(f"[CHAT_TEST] 错误: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"AI响应失败: {str(e)}")


@router.post("/api/chat-test/{session_id}/reset")
async def reset_chat_test_session(session_id: str):
    """
    重置指定的测试会话
    清除该会话的Agent和记忆
    """
    success = test_agent_manager.clear_session(session_id)
    if success:
        return {
            "success": True,
            "message": f"测试会话 {session_id} 已重置",
            "timestamp": datetime.now().isoformat()
        }
    else:
        raise HTTPException(status_code=404, detail="会话不存在或已过期")


@router.get("/api/chat-test/stats")
async def get_chat_test_stats():
    """
    获取测试Agent统计信息
    无需鉴权
    """
    return {
        "success": True,
        "stats": test_agent_manager.get_stats(),
        "timestamp": datetime.now().isoformat()
    }


@router.post("/api/chat-test/clear-all")
async def clear_all_chat_test_sessions():
    """
    清除所有测试会话
    用于清理内存，无需鉴权
    """
    count = test_agent_manager.clear_all()
    return {
        "success": True,
        "message": f"已清除 {count} 个测试会话",
        "timestamp": datetime.now().isoformat()
    }
