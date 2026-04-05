"""
chat api
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from src.schemas.chat import ChatRequest
from loguru import logger
import asyncio
import json
import queue
import threading
from src.auth.middleware import get_current_active_user
from src.db.tools import get_user_username

router = APIRouter(tags=["chat"])


@router.post("/api/chat/stream")
async def chat_stream(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    Chat endpoint with server-sent events (SSE) for streaming responses

    Args:
        request: ChatRequest containing user message
        current_user: Current authenticated user

    Returns:
        StreamingResponse with AI reply streamed in real-time
    """
    logger.info(f"Received streaming request from user {current_user['id']}: {request}")

    try:
        # Get user message
        user_message = request.message.strip()
        logger.info(f"Received message from user {current_user['id']}: {user_message}")

        if not user_message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Get AI response using the agent
        agent = req.app.state.agent

        # Get username from database
        username = get_user_username(current_user['id'])

        async def event_generator():
            """Generate SSE events for streaming response"""
            # 使用同步队列（线程安全）
            event_queue = queue.Queue()

            def thinking_callback(event_type: str, data: dict):
                """Callback function to receive events from agent"""
                # 将事件放入同步队列
                event_queue.put({
                    "type": event_type,
                    "data": data
                })

            # Run the agent in a separate thread to avoid blocking
            agent_response = {"content": ""}

            def run_agent():
                try:
                    # Use the agent's chat method with thinking and token callbacks
                    response = agent.chat(
                        user_message,
                        user_name=username,
                        thinking_callback=thinking_callback,
                        token_callback=lambda token: event_queue.put({
                            "type": "token",
                            "data": {"content": token}
                        })
                    )
                    agent_response["content"] = response
                    # Signal completion
                    event_queue.put({
                        "type": "final_response",
                        "data": {"content": response}
                    })
                except Exception as e:
                    logger.error(f"Error in agent chat: {e}")
                    event_queue.put({
                        "type": "error",
                        "data": {"message": str(e)}
                    })

            # Start agent in background thread
            thread = threading.Thread(target=run_agent)
            thread.start()

            # Stream events to client
            while True:
                try:
                    # 使用 asyncio.to_thread 在异步环境中等待同步队列
                    # 减少超时时间，让token更快地被发送
                    event = await asyncio.wait_for(
                        asyncio.to_thread(event_queue.get, timeout=0.01),
                        timeout=60.0
                    )

                    event_type = event.get("type")
                    data = event.get("data")

                    if event_type == "thinking_step":
                        # Send thinking step to client
                        json_str = json.dumps({"type": "thinking_step", "data": data})
                        yield f"data: {json_str}\n\n"

                    elif event_type == "tool_call":
                        # Send tool call to client
                        json_str = json.dumps({"type": "tool_call", "data": data})
                        yield f"data: {json_str}\n\n"

                    elif event_type == "token":
                        # Send token to client for real-time streaming
                        json_str = json.dumps({"type": "token", "data": data})
                        yield f"data: {json_str}\n\n"

                    elif event_type == "final_response":
                        # Send final response
                        json_str = json.dumps({"type": "final_response", "data": data})
                        yield f"data: {json_str}\n\n"
                        break

                    elif event_type == "error":
                        # Send error
                        json_str = json.dumps({"type": "error", "data": data})
                        yield f"data: {json_str}\n\n"
                        break

                except asyncio.TimeoutError:
                    logger.error("Stream timeout")
                    json_str = json.dumps({"type": "error", "data": {"message": "Stream timed out"}})
                    yield f"data: {json_str}\n\n"
                    break
                except queue.Empty:
                    # 队列为空，继续等待，减少等待时间以实现更实时的效果
                    await asyncio.sleep(0.001)
                    continue

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # 禁用Nginx缓冲
            }
        )

    except HTTPException as e:
        logger.error(f"HTTP Exception in chat stream endpoint: {e}")
        raise
    except Exception as e:
        logger.error(f"Error in chat stream endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get AI response: {str(e)}"
        )


@router.post("/api/chat", response_model=dict)
async def chat(request: ChatRequest, req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    Chat endpoint - send a message and get AI response

    Args:
        request: ChatRequest containing user message
        current_user: Current authenticated user

    Returns:
        ChatResponse with AI reply and thinking process
    """
    logger.info(f"Received request from user {current_user['id']}: {request}")
    try:
        # Get user message
        user_message = request.message.strip()
        logger.info(f"Received message from user {current_user['id']}: {user_message}")

        if not user_message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Get AI response using the agent
        agent = req.app.state.agent

        # Get username from database
        username = get_user_username(current_user['id'])

        # Get AI response using the agent
        ai_response = agent.chat(user_message, user_name=username)

        # Simulate thinking process for demonstration
        thinking_steps = [
            {
                "thought": "用户想要学习英语，我需要提供一些学习建议",
                "tool_call": {
                    "tool_name": "get_user_profile",
                    "arguments": "{\"user_id\": " + str(current_user['id']) + "}",
                    "result": "用户是初学者，学习目标是通过四级考试"
                }
            },
            {
                "thought": "根据用户的学习水平和目标，我应该推荐适合的学习方法和资源"
            }
        ]

        logger.info(f"AI Response for user {current_user['id']}: {ai_response}")
        logger.info(f"Thinking steps generated: {len(thinking_steps)} steps")

        return {
            "success": True,
            "message": ai_response,
            "thinking_steps": thinking_steps,
            "timestamp": None  # Will be set by FastAPI
        }

    except HTTPException as e:
        logger.error(f"HTTP Exception in chat endpoint: {e}")
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get AI response: {str(e)}"
        )
