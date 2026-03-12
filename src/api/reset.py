"""
Reset endpoint - reset the chat agent
"""

from fastapi import APIRouter, HTTPException, Request
from src.schemas.reset import ResetRequest, ResetResponse
from loguru import logger

router = APIRouter(tags=["reset"])

@router.post("/api/reset", response_model=ResetResponse)
async def reset_chat(request: ResetRequest = None, req: Request = None):
    """
    Reset chat history
    
    Args:
        request: Optional ResetRequest (can be empty)
        
    Returns:
        ResetResponse confirming reset
    """
    try:
        # Reset the agent's conversation history
        agent = req.app.state.agent
        agent.reset()
        logger.info("Chat history has been reset")
        
        return {
            "success": True,
            "message": "Chat history has been reset"
        }
        
    except Exception as e:
        logger.error(f"Error in reset endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset chat: {str(e)}"
        )