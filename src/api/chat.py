"""
chat api
提供聊天功能，支持流式响应和消息持久化
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
from src.db.tools import get_user_username
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
    支持对话持久化：
    - 如果 conversation_id 为空，AI回复完成后创建新对话
    - 如果 conversation_id 存在，追加消息到现有对话
    """
    logger.info(f"[CHAT_STREAM] Received streaming request from user {current_user['id']}: message_length={len(request.message)}, conversation_id={request.conversation_id}")

    conversation_id = request.conversation_id
    user_message = request.message.strip()
    
    logger.info(f"[CHAT_STREAM] Processing request: user_id={current_user['id']}, conversation_id={conversation_id}, is_new={not conversation_id}")
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # 验证对话存在且属于当前用户（如果提供了conversation_id）
    if conversation_id:
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权访问此对话")

    try:
        agent = req.app.state.agent
        username = get_user_username(current_user['id'])

        async def event_generator():
            """Generate SSE events for streaming response"""
            event_queue = queue.Queue()
            full_response = ""
            is_new_conversation = not conversation_id
            # 使用列表作为可变引用，避免 nonlocal 问题
            conversation_id_ref = [conversation_id]

            def thinking_callback(event_type: str, data: dict):
                event_queue.put({"type": event_type, "data": data})

            def run_agent():
                try:
                    response = agent.chat(
                        user_message,
                        user_name=username,
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
                    logger.error(f"Error in agent chat: {e}")
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

                    elif event_type in ["thinking_step", "tool_call"]:
                        yield f"data: {json.dumps(event)}\n\n"

                    elif event_type == "final_response":
                        full_response = data.get("content", full_response)
                        logger.info(f"[CHAT_STREAM] AI response completed, length={len(full_response)}, is_new_conversation={is_new_conversation}")
                        
                        # AI回复完成后，保存消息到数据库
                        try:
                            logger.info(f"[CHAT_STREAM] Starting to save chat completion...")
                            # 使用可变对象来存储 conversation_id
                            result = await save_chat_completion(
                                user_id=current_user['id'],
                                conversation_id=conversation_id_ref[0],
                                user_message=user_message,
                                ai_response=full_response,
                                is_new_conversation=is_new_conversation
                            )
                            conversation_id_ref[0] = result
                            logger.info(f"[CHAT_STREAM] Chat saved successfully, conversation_id={result}")
                            
                            # 在最终响应中包含conversation_id
                            data['conversation_id'] = result
                            data['is_new_conversation'] = is_new_conversation
                        except Exception as e:
                            logger.error(f"[CHAT_STREAM] Error saving chat: {e}")
                            import traceback
                            logger.error(traceback.format_exc())
                        
                        yield f"data: {json.dumps({'type': 'final_response', 'data': data})}\n\n"
                        break

                    elif event_type == "error":
                        yield f"data: {json.dumps(event)}\n\n"
                        break

                except asyncio.TimeoutError:
                    yield f"data: {json.dumps({'type': 'error', 'data': {'message': 'Stream timed out'}})}\n\n"
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
        logger.error(f"Error in chat stream endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get AI response: {str(e)}")


async def save_chat_completion(
    user_id: int,
    conversation_id: Optional[str],
    user_message: str,
    ai_response: str,
    is_new_conversation: bool
) -> str:
    """
    保存聊天完成结果到数据库
    
    Returns:
        conversation_id: 对话ID（新建或现有）
    """
    logger.info(f"[SAVE_CHAT] Starting save_chat_completion: user_id={user_id}, is_new_conversation={is_new_conversation}, existing_conversation_id={conversation_id}")
    
    # 如果是新对话，先创建对话元数据
    if is_new_conversation:
        new_conversation_id = str(uuid.uuid4())
        # 使用用户的第一条消息作为标题（截取前50字符）
        title = user_message[:50] + "..." if len(user_message) > 50 else user_message
        
        logger.info(f"[SAVE_CHAT] Creating new conversation: id={new_conversation_id}, title={title}")
        
        create_conversation(
            user_id=user_id,
            conversation_id=new_conversation_id,
            title=title
        )
        conversation_id = new_conversation_id
        logger.info(f"[SAVE_CHAT] Created new conversation {conversation_id} with title: {title}")
    else:
        logger.info(f"[SAVE_CHAT] Using existing conversation: {conversation_id}")
    
    # 保存用户消息
    user_message_id = str(uuid.uuid4())
    logger.info(f"[SAVE_CHAT] Saving user message: id={user_message_id}, conversation_id={conversation_id}, content_length={len(user_message)}")
    
    create_message(
        conversation_id=conversation_id,
        message_id=user_message_id,
        role='user',
        content=user_message
    )
    logger.info(f"[SAVE_CHAT] Saved user message: {user_message_id}")
    
    # 保存AI回复
    ai_message_id = str(uuid.uuid4())
    logger.info(f"[SAVE_CHAT] Saving AI message: id={ai_message_id}, conversation_id={conversation_id}, content_length={len(ai_response)}")
    
    create_message(
        conversation_id=conversation_id,
        message_id=ai_message_id,
        role='assistant',
        content=ai_response
    )
    logger.info(f"[SAVE_CHAT] Saved AI message: {ai_message_id}")
    
    # 更新对话最后消息信息
    last_msg_preview = ai_response[:100] + "..." if len(ai_response) > 100 else ai_response
    logger.info(f"[SAVE_CHAT] Updating conversation last_message: conversation_id={conversation_id}, preview={last_msg_preview[:50]}...")
    
    update_conversation_last_message(
        conversation_id=conversation_id,
        last_message=last_msg_preview,
        increment_count=True
    )
    
    logger.info(f"[SAVE_CHAT] Completed save_chat_completion for conversation {conversation_id}")
    return conversation_id


@router.post("/api/chat", response_model=dict)
async def chat(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    非流式聊天接口
    """
    logger.info(f"Received request from user {current_user['id']}: {request}")
    
    conversation_id = request.conversation_id
    user_message = request.message.strip()
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # 验证对话存在且属于当前用户
    if conversation_id:
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权访问此对话")

    try:
        agent = req.app.state.agent
        username = get_user_username(current_user['id'])
        is_new_conversation = not conversation_id

        # 获取AI响应
        ai_response = agent.chat(user_message, user_name=username)

        # 保存到数据库
        conv_id = await save_chat_completion(
            user_id=current_user['id'],
            conversation_id=conversation_id,
            user_message=user_message,
            ai_response=ai_response,
            is_new_conversation=is_new_conversation
        )

        return {
            "success": True,
            "message": ai_response,
            "conversation_id": conv_id,
            "is_new_conversation": is_new_conversation,
            "timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get AI response: {str(e)}")
