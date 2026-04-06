"""
chat api
提供聊天功能，支持流式响应和消息持久化
使用 Agent 工厂实现用户隔离和对话隔离
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from src.schemas.chat import ChatRequest
from loguru import logger
import asyncio
import json
import queue
import threading
import uuid
from datetime import datetime
from typing import Optional
from src.auth.middleware import get_current_active_user
from src.db.conversation import (
    create_conversation,
    get_conversation_by_id,
    update_conversation_last_message
)
from src.db.message import (
    create_message,
    get_conversation_messages_for_agent
)

router = APIRouter(tags=["chat"])


@router.post("/api/chat/stream")
async def chat_stream(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    Chat endpoint with server-sent events (SSE) for streaming responses
    支持对话持久化和记忆隔离：
    - 每个 (user_id, conversation_id) 有独立的 Agent 和记忆
    - 使用滑动窗口保留最近 n 轮对话
    """
    logger.info(f"[CHAT_STREAM] 收到流式请求: user_id={current_user['id']}, conversation_id={request.conversation_id}")

    conversation_id = request.conversation_id
    user_message = request.message.strip()
    
    if not user_message:
        raise HTTPException(status_code=400, detail="消息不能为空")

    # 验证对话存在且属于当前用户
    if conversation_id:
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权访问此对话")

    try:
        # 使用工厂获取 Agent（实现隔离）
        agent_factory = req.app.state.agent_factory
        
        # 如果是新对话，先创建对话ID
        is_new_conversation = not conversation_id
        if is_new_conversation:
            conversation_id = str(uuid.uuid4())
            title = user_message[:50] + "..." if len(user_message) > 50 else user_message
            create_conversation(
                user_id=current_user['id'],
                conversation_id=conversation_id,
                title=title
            )
            logger.info(f"[CHAT_STREAM] 创建新对话: {conversation_id}")
        
        # 获取或创建 Agent（关键：每个 user+conversation 组合有独立 Agent）
        agent = agent_factory.get_agent(
            user_id=str(current_user['id']),
            conversation_id=conversation_id,
            use_react=True,
            verbose=False,  # 生产环境关闭详细日志
            stream=True
        )
        
        logger.info(f"[CHAT_STREAM] Agent 准备就绪: user_id={current_user['id']}, conversation_id={conversation_id}")

        async def event_generator():
            """生成 SSE 事件"""
            event_queue = queue.Queue()
            full_response = ""

            def thinking_callback(event_type: str, data: dict):
                event_queue.put({"type": event_type, "data": data})

            def run_agent():
                try:
                    response = agent.chat(
                        user_message,
                        thinking_callback=thinking_callback,
                        token_callback=lambda token: event_queue.put({
                            "type": "token",
                            "data": {"content": token}
                        })
                    )
                    event_queue.put({
                        "type": "final_response",
                        "data": {"content": response}
                    })
                except Exception as e:
                    logger.error(f"Agent chat 错误: {e}")
                    event_queue.put({"type": "error", "data": {"message": str(e)}})

            # 启动 AI 处理线程
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
                        logger.info(f"[CHAT_STREAM] AI 回复完成, 长度={len(full_response)}")
                        
                        # 保存消息到数据库
                        try:
                            await save_chat_completion(
                                user_id=current_user['id'],
                                conversation_id=conversation_id,
                                user_message=user_message,
                                ai_response=full_response,
                                is_new_conversation=False  # 已经创建过了
                            )
                            logger.info(f"[CHAT_STREAM] 消息已保存")
                            
                            # 在最终响应中包含 conversation_id
                            data['conversation_id'] = conversation_id
                            data['is_new_conversation'] = is_new_conversation
                        except Exception as e:
                            logger.error(f"[CHAT_STREAM] 保存消息失败: {e}")
                        
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

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CHAT_STREAM] 错误: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"AI 响应失败: {str(e)}")


async def save_chat_completion(
    user_id: int,
    conversation_id: str,
    user_message: str,
    ai_response: str,
    is_new_conversation: bool
) -> str:
    """
    保存聊天完成结果到数据库
    """
    logger.debug(f"[SAVE_CHAT] 保存消息: conversation_id={conversation_id}")
    
    # 保存用户消息
    user_message_id = str(uuid.uuid4())
    create_message(
        conversation_id=conversation_id,
        message_id=user_message_id,
        role='user',
        content=user_message
    )
    
    # 保存 AI 回复
    ai_message_id = str(uuid.uuid4())
    create_message(
        conversation_id=conversation_id,
        message_id=ai_message_id,
        role='assistant',
        content=ai_response
    )
    
    # 更新对话最后消息信息
    last_msg_preview = ai_response[:100] + "..." if len(ai_response) > 100 else ai_response
    update_conversation_last_message(
        conversation_id=conversation_id,
        last_message=last_msg_preview,
        increment_count=True
    )
    
    return conversation_id


@router.post("/api/chat", response_model=dict)
async def chat(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    非流式聊天接口
    """
    logger.info(f"[CHAT] 收到请求: user_id={current_user['id']}, conversation_id={request.conversation_id}")
    
    conversation_id = request.conversation_id
    user_message = request.message.strip()
    
    if not user_message:
        raise HTTPException(status_code=400, detail="消息不能为空")

    # 验证对话存在且属于当前用户
    if conversation_id:
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权访问此对话")

    try:
        agent_factory = req.app.state.agent_factory
        
        # 如果是新对话，先创建
        is_new_conversation = not conversation_id
        if is_new_conversation:
            conversation_id = str(uuid.uuid4())
            title = user_message[:50] + "..." if len(user_message) > 50 else user_message
            create_conversation(
                user_id=current_user['id'],
                conversation_id=conversation_id,
                title=title
            )
        
        # 获取 Agent
        agent = agent_factory.get_agent(
            user_id=str(current_user['id']),
            conversation_id=conversation_id,
            use_react=True,
            verbose=False,
            stream=False  # 非流式
        )

        # 获取 AI 响应
        ai_response = agent.chat(user_message)

        # 保存到数据库
        await save_chat_completion(
            user_id=current_user['id'],
            conversation_id=conversation_id,
            user_message=user_message,
            ai_response=ai_response,
            is_new_conversation=False
        )

        return {
            "success": True,
            "message": ai_response,
            "conversation_id": conversation_id,
            "is_new_conversation": is_new_conversation,
            "timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CHAT] 错误: {e}")
        raise HTTPException(status_code=500, detail=f"AI 响应失败: {str(e)}")
