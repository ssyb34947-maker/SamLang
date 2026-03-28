"""
chat api
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from src.schemas.chat import ChatRequest
from loguru import logger
import asyncio
import json
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
        StreamingResponse with AI reply tokens and thinking process
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
            # Create a queue to receive streaming events
            import queue
            event_queue = queue.Queue()
            
            def stream_callback(event_type, data):
                event_queue.put((event_type, data))
            
            # Run agent.chat in a separate thread to avoid blocking
            import threading
            def run_chat():
                try:
                    # Get the thinking process step by step
                    from src.agent.core.react import ReACTAgentWithFunctionCalling
                    
                    # Create a custom callback to capture thinking steps
                    def thinking_callback(step_type, step_data):
                        stream_callback(step_type, step_data)
                    
                    # Call agent with callback
                    ai_response = agent.chat(user_message, user_name=username, thinking_callback=thinking_callback)
                    
                    # Send final response
                    stream_callback("final_response", {"content": ai_response})
                    
                except Exception as e:
                    logger.error(f"Error in chat stream: {e}")
                    stream_callback("error", {"message": str(e)})
            
            # Start the chat in a separate thread
            thread = threading.Thread(target=run_chat)
            thread.start()
            
            # Stream events to the client
            while True:
                try:
                    event = event_queue.get(timeout=30)  # 30 second timeout
                    if event is None:
                        break  # End of stream
                    
                    event_type, data = event
                    
                    if event_type == "thinking_step":
                        # Send thinking step
                        json_str = json.dumps({"type": "thinking_step", "data": data})
                        yield f"data: {json_str}\n\n"
                    elif event_type == "tool_call":
                        # Send tool call
                        json_str = json.dumps({"type": "tool_call", "data": data})
                        yield f"data: {json_str}\n\n"
                    elif event_type == "tool_result":
                        # Send tool result
                        json_str = json.dumps({"type": "tool_result", "data": data})
                        yield f"data: {json_str}\n\n"
                    elif event_type == "final_response":
                        # Send final response
                        json_str = json.dumps({"type": "final_response", "data": data})
                        yield f"data: {json_str}\n\n"
                    elif event_type == "error":
                        # Send error
                        json_str = json.dumps({"type": "error", "data": data})
                        yield f"data: {json_str}\n\n"
                        break
                except queue.Empty:
                    json_str = json.dumps({"type": "error", "data": {"message": "Stream timed out"}})
                    yield f"data: {json_str}\n\n"
                    break
        
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream"
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
