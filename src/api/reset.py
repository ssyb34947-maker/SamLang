"""
Reset endpoint - reset the chat agent
支持重置指定对话的 Agent 记忆
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from src.schemas.reset import ResetRequest, ResetResponse
from src.auth.middleware import get_current_active_user
from loguru import logger

router = APIRouter(tags=["reset"])

@router.post("/api/reset", response_model=ResetResponse)
async def reset_chat(
    request: ResetRequest = None,
    req: Request = None,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Reset chat history for a specific conversation
    
    Args:
        request: Optional ResetRequest with conversation_id
        
    Returns:
        ResetResponse confirming reset
    """
    try:
        agent_factory = req.app.state.agent_factory
        
        # 如果提供了 conversation_id，只重置该对话
        if request and request.conversation_id:
            conversation_id = request.conversation_id
            
            # 从工厂中移除该 Agent（下次会重新创建）
            removed = agent_factory.remove_agent(
                user_id=str(current_user['id']),
                conversation_id=conversation_id
            )
            
            if removed:
                logger.info(f"[RESET] 对话 {conversation_id} 的 Agent 已重置")
                return {
                    "success": True,
                    "message": f"对话 {conversation_id} 的记忆已重置"
                }
            else:
                # Agent 不在内存中，无需重置
                return {
                    "success": True,
                    "message": f"对话 {conversation_id} 当前未激活，无需重置"
                }
        else:
            # 重置该用户的所有对话
            count = agent_factory.remove_user_agents(str(current_user['id']))
            logger.info(f"[RESET] 用户 {current_user['id']} 的 {count} 个 Agent 已重置")
            
            return {
                "success": True,
                "message": f"已重置 {count} 个对话的记忆"
            }
        
    except Exception as e:
        logger.error(f"[RESET] 错误: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"重置失败: {str(e)}"
        )
