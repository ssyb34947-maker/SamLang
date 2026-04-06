from fastapi import APIRouter, Request, HTTPException, Depends
from src.auth.middleware import get_current_active_user

router = APIRouter()


@router.get("/test")
def test_endpoint():
    return {"message": "Test endpoint working"}


@router.get("/test/chat")
def test_chat_endpoint(req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    测试聊天接口 - 使用工厂模式获取 Agent
    """
    agent_factory = req.app.state.agent_factory
    if not agent_factory:
        raise HTTPException(status_code=500, detail="Agent factory not initialized")
    
    try:
        # 使用工厂获取 Agent（创建临时对话用于测试）
        import uuid
        test_conversation_id = f"test_{uuid.uuid4().hex[:8]}"
        
        agent = agent_factory.get_agent(
            user_id=str(current_user['id']),
            conversation_id=test_conversation_id,
            use_react=True,
            verbose=False,
            stream=False
        )
        
        user_message = "你好"
        ai_response = agent.chat(user_message)
        
        return {
            "success": True,
            "message": "Chat endpoint working",
            "user_message": user_message,
            "ai_response": ai_response,
            "conversation_id": test_conversation_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat endpoint error: {str(e)}")


@router.get("/test/factory-stats")
def test_factory_stats(req: Request, current_user: dict = Depends(get_current_active_user)):
    """
    获取 Agent 工厂统计信息
    """
    agent_factory = req.app.state.agent_factory
    if not agent_factory:
        raise HTTPException(status_code=500, detail="Agent factory not initialized")
    
    return {
        "success": True,
        "stats": agent_factory.get_stats()
    }
