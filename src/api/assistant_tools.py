"""
助教 Agent 工具 API
提供数据库管理和知识库管理功能
"""

from typing import Optional, List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from loguru import logger

from src.api.auth import get_current_active_user
from src.db.conversation import (
    get_user_conversations as db_get_user_conversations,
    get_conversation as db_get_conversation,
    delete_conversation as db_delete_conversation,
    update_conversation as db_update_conversation,
)
from src.db.message import get_conversation_messages
from src.agent.rag import get_rag_manager

router = APIRouter(prefix="/api/assistant", tags=["assistant_tools"])


# ==================== 请求/响应模型 ====================

class ConversationListResponse(BaseModel):
    """对话列表响应"""
    conversation_id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int
    total_tokens: int


class ConversationDetailResponse(BaseModel):
    """对话详情响应"""
    conversation_id: str
    title: str
    user_id: int
    created_at: str
    updated_at: str
    messages: List[dict]
    total_tokens: int


class DeleteConversationRequest(BaseModel):
    """删除对话请求"""
    conversation_id: str
    confirm: bool = Field(..., description="是否确认删除")


class UpdateConversationRequest(BaseModel):
    """更新对话请求"""
    conversation_id: str
    title: Optional[str] = Field(None, description="新标题")
    confirm: bool = Field(..., description="是否确认修改")


class DocumentListResponse(BaseModel):
    """知识库文档列表响应"""
    doc_id