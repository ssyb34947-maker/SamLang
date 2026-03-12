"""
chat api
"""

from fastapi import APIRouter, HTTPException, Request
from src.schemas.chat import ChatRequest, ChatResponse
from loguru import logger

router = APIRouter(tags=["chat"])

@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """
    Chat endpoint - send a message and get AI response
    
    Args:
        request: ChatRequest containing user message
        
    Returns:
        ChatResponse with AI reply
    """
    logger.info(f"Received request: {request}")
    try:
        # Get user message
        user_message = request.message.strip()
        logger.info(f"Received message: {user_message}")
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Get AI response using the agent
        agent = req.app.state.agent
        #logger.info(f"Agent: {agent}")
        ai_response = agent.chat(user_message)
        logger.info(f"AI Response: {ai_response}")
        
        return {
            "success": True,
            "message": ai_response,
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
