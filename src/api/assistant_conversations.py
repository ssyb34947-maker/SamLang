"""
助教对话API路由
提供助教Agent对话的CRUD接口
"""

from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from typing import List, Optional

from src.auth.middleware import get_current_active_user
from src.db.assistant_conversation import (
    init_assistant_conversation_tables,
    get_user_assistant_conversations,
    get_assistant_conversation_messages,
    get_assistant_conversation_by_id,
    create_assistant_conversation,
    delete_assistant_conversation,
    update_assistant_conversation_title
)

router = APIRouter(tags=["Assistant Conversations"])


@router.on_event("startup")
async def startup():
    """初始化数据库表"""
    init_assistant_conversation_tables()


@router.get("/api/assistant/conversations")
async def list_conversations(
    limit: int = 50,
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取当前用户的所有助教对话列表
    
    Returns:
        {
            "conversations": [
                {
                    "conversation_id": "uuid",
                    "title": "对话标题",
                    "message_count": 10,
                    "last_message": "最后消息",
                    "updated_at": "2024-01-15 10:30:00"
                }
            ]
        }
    """
    try:
        conversations = get_user_assistant_conversations(
            user_id=current_user['id'],
            limit=limit
        )
        
        return {
            "success": True,
            "conversations": conversations
        }
        
    except Exception as e:
        logger.error(f"[Assistant API] 获取对话列表失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取对话列表失败: {str(e)}"
        )


@router.get("/api/assistant/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    limit: int = 100,
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取指定助教对话的所有消息
    
    Args:
        conversation_id: 对话ID
        limit: 最大消息数量
        
    Returns:
        {
            "conversation_id": "uuid",
            "title": "对话标题",
            "messages": [
                {
                    "message_id": "uuid",
                    "role": "user/assistant",
                    "content": "消息内容",
                    "created_at": "2024-01-15 10:30:00"
                }
            ]
        }
    """
    try:
        # 验证对话存在且属于当前用户
        conv = get_assistant_conversation_by_id(conversation_id)
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="对话不存在"
            )
        
        # 获取消息
        messages = get_assistant_conversation_messages(
            conversation_id=conversation_id,
            limit=limit
        )
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "title": conv['title'],
            "messages": messages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Assistant API] 获取对话消息失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取对话消息失败: {str(e)}"
        )


@router.delete("/api/assistant/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    删除指定的助教对话
    
    Args:
        conversation_id: 对话ID
        
    Returns:
        {
            "success": True,
            "message": "删除成功"
        }
    """
    try:
        # 验证对话存在且属于当前用户
        conv = get_assistant_conversation_by_id(conversation_id)
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="对话不存在"
            )
        
        # 软删除
        success = delete_assistant_conversation(
            conversation_id=conversation_id,
            soft_delete=True
        )
        
        if success:
            return {
                "success": True,
                "message": "对话已删除"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="删除失败"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Assistant API] 删除对话失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除对话失败: {str(e)}"
        )


@router.patch("/api/assistant/conversations/{conversation_id}/title")
async def update_conversation_title(
    conversation_id: str,
    title: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    更新助教对话标题
    
    Args:
        conversation_id: 对话ID
        title: 新标题
        
    Returns:
        {
            "success": True,
            "title": "新标题"
        }
    """
    try:
        # 验证对话存在且属于当前用户
        conv = get_assistant_conversation_by_id(conversation_id)
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="对话不存在"
            )
        
        # 更新标题
        success = update_assistant_conversation_title(
            conversation_id=conversation_id,
            title=title
        )
        
        if success:
            return {
                "success": True,
                "title": title
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="更新失败"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Assistant API] 更新标题失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新标题失败: {str(e)}"
        )
