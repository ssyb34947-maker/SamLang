"""
chat api
提供聊天功能，支持流式响应和消息持久化
使用 Agent 工厂实现用户隔离和对话隔离
支持多种Agent类型：1=教授, 2=助教, 3=管理员AI
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

# Agent类型常量
AGENT_TYPE_PROFESSOR = 1  # 教授
AGENT_TYPE_ASSISTANT = 2  # 助教
AGENT_TYPE_ADMIN = 3      # 管理员AI

AGENT_TYPE_NAMES = {
    AGENT_TYPE_PROFESSOR: "教授",
    AGENT_TYPE_ASSISTANT: "助教",
    AGENT_TYPE_ADMIN: "管理员AI"
}


async def handle_chat_stream(
    request: ChatRequest,
    req: Request,
    current_user: dict,
    agent_type: int = AGENT_TYPE_PROFESSOR
):
    """
    处理流式聊天的通用逻辑
    
    Args:
        request: 聊天请求
        req: FastAPI请求对象
        current_user: 当前用户
        agent_type: Agent类型（1=教授, 2=助教, 3=管理员AI）
    """
    conversation_id = request.conversation_id
    user_message = request.message.strip()
    agent_name = AGENT_TYPE_NAMES.get(agent_type, "教授")
    
    logger.info(f"[{agent_name}_CHAT_STREAM] 收到流式请求: user_id={current_user['id']}, conversation_id={conversation_id}")
    
    if not user_message:
        raise HTTPException(status_code=400, detail="消息不能为空")

    # 验证对话存在且属于当前用户
    if conversation_id:
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权访问此对话")
        # 验证对话的agent_type是否匹配
        if conversation.get('agent_type', 1) != agent_type:
            expected_name = AGENT_TYPE_NAMES.get(agent_type, "未知")
            actual_name = AGENT_TYPE_NAMES.get(conversation.get('agent_type', 1), "未知")
            raise HTTPException(
                status_code=400, 
                detail=f"对话类型不匹配：该对话是{actual_name}类型，但请求的是{expected_name}类型"
            )

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
                title=title,
                agent_type=agent_type
            )
            logger.info(f"[{agent_name}_CHAT_STREAM] 创建新对话: {conversation_id}, agent_type={agent_type}")
        
        # 获取或创建 Agent（关键：每个 user+conversation+agent_type 组合有独立 Agent）
        agent = agent_factory.get_agent(
            user_id=str(current_user['id']),
            conversation_id=conversation_id,
            use_react=True,
            verbose=False,
            stream=True,
            agent_type=agent_type
        )
        
        logger.info(f"[{agent_name}_CHAT_STREAM] Agent 准备就绪: user_id={current_user['id']}, conversation_id={conversation_id}")

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
                    logger.error(f"{agent_name} Agent chat 错误: {e}")
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

                    event_type_inner = event.get("type")
                    data = event.get("data")

                    if event_type_inner == "token":
                        full_response += data.get("content", "")
                        yield f"data: {json.dumps(event)}\n\n"

                    elif event_type_inner in ["thinking_step", "tool_call", "tool_result"]:
                        yield f"data: {json.dumps(event)}\n\n"

                    elif event_type_inner == "final_response":
                        full_response = data.get("content", full_response)
                        logger.info(f"[{agent_name}_CHAT_STREAM] AI 回复完成, 长度={len(full_response)}")

                        # 保存消息到数据库
                        try:
                            await save_chat_completion(
                                user_id=current_user['id'],
                                conversation_id=conversation_id,
                                user_message=user_message,
                                ai_response=full_response,
                                is_new_conversation=False
                            )
                            logger.info(f"[{agent_name}_CHAT_STREAM] 消息已保存")

                            # 在最终响应中包含 conversation_id
                            data['conversation_id'] = conversation_id
                            data['is_new_conversation'] = is_new_conversation
                            data['agent_type'] = agent_type
                        except Exception as e:
                            logger.error(f"[{agent_name}_CHAT_STREAM] 保存消息失败: {e}")

                        yield f"data: {json.dumps({'type': 'final_response', 'data': data})}\n\n"

                        # 发送 token 统计（在流最后）
                        try:
                            from src.db.conversation import get_conversation_by_id
                            conv = get_conversation_by_id(conversation_id)
                            if conv:
                                token_stats = {
                                    'type': 'end',
                                    'data': {
                                        'conversation_id': conversation_id,
                                        'prompt_tokens': conv.get('prompt_tokens', 0),
                                        'completion_tokens': conv.get('completion_tokens', 0),
                                        'total_tokens': conv.get('total_tokens', 0),
                                        'agent_type': agent_type,
                                        'timestamp': datetime.now().isoformat()
                                    }
                                }
                                yield f"data: {json.dumps(token_stats)}\n\n"
                                logger.info(f"[{agent_name}_CHAT_STREAM] Token统计已发送: {token_stats['data']}")
                        except Exception as e:
                            logger.warning(f"[{agent_name}_CHAT_STREAM] 获取Token统计失败: {e}")

                        break

                    elif event_type_inner == "error":
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
        logger.error(f"[{agent_name}_CHAT_STREAM] 错误: {e}")
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
    
    # 估算token
    from src.utils.token_estimator import estimate_tokens
    user_tokens = estimate_tokens(user_message)
    ai_tokens = estimate_tokens(ai_response)
    
    # 保存用户消息
    user_message_id = str(uuid.uuid4())
    create_message(
        conversation_id=conversation_id,
        message_id=user_message_id,
        role='user',
        content=user_message,
        prompt_tokens=user_tokens,
        completion_tokens=0,
        total_tokens=user_tokens
    )
    
    # 保存 AI 回复
    ai_message_id = str(uuid.uuid4())
    create_message(
        conversation_id=conversation_id,
        message_id=ai_message_id,
        role='assistant',
        content=ai_response,
        prompt_tokens=0,
        completion_tokens=ai_tokens,
        total_tokens=ai_tokens
    )
    
    # 更新对话最后消息信息
    last_msg_preview = ai_response[:100] + "..." if len(ai_response) > 100 else ai_response
    update_conversation_last_message(
        conversation_id=conversation_id,
        last_message=last_msg_preview,
        increment_count=True
    )
    
    return conversation_id


# ==================== 教授 Agent API ====================

@router.post("/api/chat/stream")
async def chat_stream(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    教授Agent流式聊天接口（默认）
    """
    return await handle_chat_stream(request, req, current_user, AGENT_TYPE_PROFESSOR)


@router.post("/api/chat")
async def chat(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    教授Agent非流式聊天接口（默认）
    """
    return await handle_chat_non_stream(request, req, current_user, AGENT_TYPE_PROFESSOR)


# ==================== 助教 Agent API ====================

@router.post("/api/chat/assistant/stream")
async def assistant_chat_stream(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    助教Agent流式聊天接口
    """
    return await handle_chat_stream(request, req, current_user, AGENT_TYPE_ASSISTANT)


@router.post("/api/chat/assistant")
async def assistant_chat(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    助教Agent非流式聊天接口
    """
    return await handle_chat_non_stream(request, req, current_user, AGENT_TYPE_ASSISTANT)


# ==================== 管理员AI API ====================

@router.post("/api/chat/admin-ai/stream")
async def admin_ai_chat_stream(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    管理员AI流式聊天接口
    """
    return await handle_chat_stream(request, req, current_user, AGENT_TYPE_ADMIN)


@router.post("/api/chat/admin-ai")
async def admin_ai_chat(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    管理员AI非流式聊天接口
    """
    return await handle_chat_non_stream(request, req, current_user, AGENT_TYPE_ADMIN)


# ==================== 通用非流式处理函数 ====================

async def handle_chat_non_stream(
    request: ChatRequest,
    req: Request,
    current_user: dict,
    agent_type: int = AGENT_TYPE_PROFESSOR
):
    """
    处理非流式聊天的通用逻辑
    
    Args:
        request: 聊天请求
        req: FastAPI请求对象
        current_user: 当前用户
        agent_type: Agent类型（1=教授, 2=助教, 3=管理员AI）
    """
    conversation_id = request.conversation_id
    user_message = request.message.strip()
    agent_name = AGENT_TYPE_NAMES.get(agent_type, "教授")
    
    logger.info(f"[{agent_name}_CHAT] 收到请求: user_id={current_user['id']}, conversation_id={conversation_id}")
    
    if not user_message:
        raise HTTPException(status_code=400, detail="消息不能为空")

    # 验证对话存在且属于当前用户
    if conversation_id:
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权访问此对话")
        # 验证对话的agent_type是否匹配
        if conversation.get('agent_type', 1) != agent_type:
            expected_name = AGENT_TYPE_NAMES.get(agent_type, "未知")
            actual_name = AGENT_TYPE_NAMES.get(conversation.get('agent_type', 1), "未知")
            raise HTTPException(
                status_code=400,
                detail=f"对话类型不匹配：该对话是{actual_name}类型，但请求的是{expected_name}类型"
            )

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
                title=title,
                agent_type=agent_type
            )
            logger.info(f"[{agent_name}_CHAT] 创建新对话: {conversation_id}, agent_type={agent_type}")
        
        # 获取 Agent
        agent = agent_factory.get_agent(
            user_id=str(current_user['id']),
            conversation_id=conversation_id,
            use_react=True,
            verbose=False,
            stream=False,
            agent_type=agent_type
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
            "agent_type": agent_type,
            "timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{agent_name}_CHAT] 错误: {e}")
        raise HTTPException(status_code=500, detail=f"AI 响应失败: {str(e)}")
