"""
对话管理 API
提供对话的增删改查和消息管理功能
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from loguru import logger
import uuid
from datetime import datetime

from src.auth.middleware import get_current_active_user
from src.schemas.conversation import (
    CreateConversationRequest,
    UpdateConversationRequest,
    ConversationResponse,
    ConversationListResponse,
    MessageListResponse,
    MessageResponse,
    ConversationStatsResponse,
    MessageStatsResponse,
    DeleteConversationResponse,
    RestoreConversationResponse,
    SearchResultResponse,
    SearchMessagesResponse
)
from src.db.conversation import (
    create_conversation,
    get_conversation_by_id,
    get_user_conversations,
    update_conversation,
    update_conversation_last_message,
    delete_conversation,
    restore_conversation,
    get_user_conversation_stats
)
from src.db.message import (
    create_message,
    get_conversation_messages,
    get_conversation_message_count,
    get_conversation_stats,
    search_messages,
    delete_conversation_messages
)

router = APIRouter(tags=["conversation"])


@router.post("/api/conversations", response_model=ConversationResponse)
async def create_new_conversation(
    request: CreateConversationRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    创建新对话
    """
    try:
        conversation_id = str(uuid.uuid4())
        db_id = create_conversation(
            user_id=current_user['id'],
            conversation_id=conversation_id,
            title=request.title or "新对话",
            model_config=request.config
        )
        
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=500, detail="创建对话失败")
        
        logger.info(f"User {current_user['id']} created conversation {conversation_id}")
        return ConversationResponse(**conversation)
        
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail=f"创建对话失败: {str(e)}")


@router.get("/api/conversations", response_model=ConversationListResponse)
async def list_conversations(
    include_archived: bool = Query(default=False, description="是否包含已归档对话"),
    agent_type: Optional[int] = Query(default=None, description="Agent类型过滤（1=教授, 2=助教, 3=管理员AI）"),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取用户的对话列表
    按置顶状态和更新时间排序
    """
    try:
        conversations = get_user_conversations(
            user_id=current_user['id'],
            include_archived=include_archived,
            agent_type=agent_type,
            limit=limit,
            offset=offset
        )
        
        total = len(conversations)  # 实际应该查询总数，这里简化处理
        
        return ConversationListResponse(
            conversations=[ConversationResponse(**conv) for conv in conversations],
            total=total
        )
        
    except Exception as e:
        logger.error(f"Error listing conversations: {e}")
        raise HTTPException(status_code=500, detail=f"获取对话列表失败: {str(e)}")


@router.get("/api/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取单个对话详情
    """
    try:
        conversation = get_conversation_by_id(conversation_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        
        # 验证用户权限
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权访问此对话")
        
        return ConversationResponse(**conversation)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {e}")
        raise HTTPException(status_code=500, detail=f"获取对话失败: {str(e)}")


@router.put("/api/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation_info(
    conversation_id: str,
    request: UpdateConversationRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    更新对话信息（标题、置顶、归档等）
    """
    try:
        # 验证对话存在且属于当前用户
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权修改此对话")
        
        # 构建更新数据
        update_data = {}
        if request.title is not None:
            update_data['title'] = request.title
        if request.is_pinned is not None:
            update_data['is_pinned'] = request.is_pinned
        if request.is_archived is not None:
            update_data['is_archived'] = request.is_archived
        
        if not update_data:
            raise HTTPException(status_code=400, detail="没有提供要更新的字段")
        
        success = update_conversation(conversation_id, update_data)
        if not success:
            raise HTTPException(status_code=500, detail="更新对话失败")
        
        # 返回更新后的对话
        updated_conversation = get_conversation_by_id(conversation_id)
        logger.info(f"User {current_user['id']} updated conversation {conversation_id}")
        return ConversationResponse(**updated_conversation)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating conversation: {e}")
        raise HTTPException(status_code=500, detail=f"更新对话失败: {str(e)}")


@router.delete("/api/conversations/{conversation_id}", response_model=DeleteConversationResponse)
async def delete_conversation_endpoint(
    conversation_id: str,
    permanent: bool = Query(default=False, description="是否永久删除"),
    current_user: dict = Depends(get_current_active_user)
):
    """
    删除对话（软删除或永久删除）
    """
    try:
        # 验证对话存在且属于当前用户
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权删除此对话")
        
        success = delete_conversation(conversation_id, soft_delete=not permanent)
        if not success:
            raise HTTPException(status_code=500, detail="删除对话失败")
        
        logger.info(f"User {current_user['id']} deleted conversation {conversation_id} (permanent={permanent})")
        return DeleteConversationResponse(
            success=True,
            conversation_id=conversation_id,
            message="对话已删除" if not permanent else "对话已永久删除"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail=f"删除对话失败: {str(e)}")


@router.post("/api/conversations/{conversation_id}/restore", response_model=RestoreConversationResponse)
async def restore_conversation_endpoint(
    conversation_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    恢复已软删除的对话
    """
    try:
        success = restore_conversation(conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="对话不存在或未被删除")
        
        logger.info(f"User {current_user['id']} restored conversation {conversation_id}")
        return RestoreConversationResponse(
            success=True,
            conversation_id=conversation_id,
            message="对话已恢复"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring conversation: {e}")
        raise HTTPException(status_code=500, detail=f"恢复对话失败: {str(e)}")


# ==================== 消息相关接口 ====================

@router.get("/api/conversations/{conversation_id}/messages", response_model=MessageListResponse)
async def get_messages(
    conversation_id: str,
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取对话的消息列表
    """
    try:
        # 验证对话存在且属于当前用户
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权访问此对话")
        
        messages = get_conversation_messages(
            conversation_id=conversation_id,
            limit=limit,
            offset=offset,
            order='asc'
        )
        
        total = get_conversation_message_count(conversation_id)
        
        return MessageListResponse(
            conversation_id=conversation_id,
            messages=[MessageResponse(**msg) for msg in messages],
            total=total
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail=f"获取消息失败: {str(e)}")


@router.get("/api/conversations/{conversation_id}/stats", response_model=MessageStatsResponse)
async def get_conversation_statistics(
    conversation_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取对话的消息统计
    """
    try:
        # 验证对话存在且属于当前用户
        conversation = get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
        
        if conversation['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="无权访问此对话")
        
        stats = get_conversation_stats(conversation_id)
        return MessageStatsResponse(**stats)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation stats: {e}")
        raise HTTPException(status_code=500, detail=f"获取统计失败: {str(e)}")


# ==================== 搜索接口 ====================

@router.get("/api/conversations/search", response_model=SearchResultResponse)
async def search_conversations(
    keyword: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(default=20, ge=1, le=50),
    current_user: dict = Depends(get_current_active_user)
):
    """
    搜索用户的消息内容
    """
    try:
        results = search_messages(
            user_id=current_user['id'],
            keyword=keyword,
            limit=limit
        )
        
        return SearchResultResponse(
            results=[SearchMessagesResponse(**result) for result in results],
            total=len(results),
            keyword=keyword
        )
        
    except Exception as e:
        logger.error(f"Error searching messages: {e}")
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")


# ==================== 统计接口 ====================

@router.get("/api/conversations/stats/overview", response_model=ConversationStatsResponse)
async def get_user_conversation_overview(
    current_user: dict = Depends(get_current_active_user)
):
    """
    获取用户的对话统计概览
    """
    try:
        stats = get_user_conversation_stats(current_user['id'])
        return ConversationStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Error getting conversation overview: {e}")
        raise HTTPException(status_code=500, detail=f"获取统计失败: {str(e)}")
