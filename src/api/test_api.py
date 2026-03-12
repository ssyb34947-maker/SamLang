from fastapi import APIRouter, Request, HTTPException

router = APIRouter()


@router.get("/test")
def test_endpoint():
    return {"message": "Test endpoint working"}


@router.get("/test/chat")
def test_chat_endpoint(req: Request):
    agent = req.app.state.agent
    if not agent:
        raise HTTPException(status_code=500, detail="Chat agent not initialized")
    try:
        user_message = "你好"
        ai_response = agent.chat(user_message)
        return {
            "success": True,
            "message": "Chat endpoint working",
            "user_message": user_message,
            "ai_response": ai_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat endpoint error: {str(e)}")