"""
对话相关的 Pydantic Schema
用于请求验证和响应序列化
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ==================== 基础模型 ====================

class ConversationBase(BaseModel):
    """对话基础模型"""
    title: str = Field(default="新对话", min_length=1, max_length=200, description="对话标题")


class MessageBase(BaseModel):
    """消息基础模型"""
    role: str = Field(..., pattern="^(user|assistant|system)$", description="消息角色")
    content: str = Field(..., min_length=1, max_length=50000, description="消息内容")


# ==================== 请求模型 ====================

class CreateConversationRequest(BaseModel):
    """创建对话请求"""
    title: Optional[str] = Field(default="新对话", max_length=200, description="对话标题")
    config: Optional[Dict[str, Any]] = Field(default=None, description="模型配置")


class UpdateConversationRequest(BaseModel):
    """更新对话请求"""
    title: Optional[str] = Field(default=None, max_length=200, description="对话标题")
    is_pinned: Optional[bool] = Field(default=None, description="是否置顶")
    is_archived: Optional[bool] = Field(default=None, description="是否归档")


class CreateMessageRequest(BaseModel):
    """创建消息请求"""
    role: str = Field(..., pattern="^(user|assistant|system)$", description="消息角色")
    content: str = Field(..., min_length=1, max_length=50000, description="消息内容")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="消息元数据")


class SendMessageRequest(BaseModel):
    """发送消息请求（用户发送消息并获取AI回复）"""
    message: str = Field(..., min_length=1, max_length=5000, description="用户消息内容")
    conversation_id: Optional[str] = Field(default=None, description="对话ID，为空则创建新对话")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "你好，请介绍一下自己",
                "conversation_id": None
            }
        }


class UpdateMessageRequest(BaseModel):
    """更新消息请求"""
    content: Optional[str] = Field(default=None, max_length=50000, description="消息内容")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="消息元数据")


# ==================== 响应模型 ====================

class ConversationResponse(BaseModel):
    """对话响应模型"""
    id: int = Field(..., description="数据库ID")
    conversation_id: str = Field(..., description="对话唯一标识")
    title: str = Field(..., description="对话标题")
    is_pinned: bool = Field(default=False, description="是否置顶")
    is_archived: bool = Field(default=False, description="是否归档")
    message_count: int = Field(default=0, description="消息数量")
    last_message: Optional[str] = Field(default=None, description="最后一条消息")
    last_message_time: Optional[datetime] = Field(default=None, description="最后消息时间")
    total_tokens: int = Field(default=0, description="总Token消耗")
    prompt_tokens: int = Field(default=0, description="输入Token数")
    completion_tokens: int = Field(default=0, description="输出Token数")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """对话列表响应"""
    conversations: List[ConversationResponse] = Field(..., description="对话列表")
    total: int = Field(..., description="总数")


class MessageResponse(BaseModel):
    """消息响应模型"""
    id: int = Field(..., description="数据库ID")
    message_id: str = Field(..., description="消息唯一标识")
    role: str = Field(..., description="消息角色")
    content: str = Field(..., description="消息内容")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="消息元数据")
    created_at: datetime = Field(..., description="创建时间")
    
    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """消息列表响应"""
    conversation_id: str = Field(..., description="对话ID")
    messages: List[MessageResponse] = Field(..., description="消息列表")
    total: int = Field(..., description="总数")


class ConversationWithMessagesResponse(BaseModel):
    """对话及其消息响应"""
    conversation: ConversationResponse = Field(..., description="对话信息")
    messages: List[MessageResponse] = Field(..., description="消息列表")


# ==================== 流式响应模型 ====================

class StreamMessageResponse(BaseModel):
    """流式消息响应（SSE事件）"""
    type: str = Field(..., description="事件类型: token, thinking_step, tool_call, final_response, error")
    data: Dict[str, Any] = Field(..., description="事件数据")


# ==================== 统计模型 ====================

class ConversationStatsResponse(BaseModel):
    """对话统计响应"""
    total_conversations: int = Field(..., description="总对话数")
    pinned_conversations: int = Field(..., description="置顶对话数")
    archived_conversations: int = Field(..., description="归档对话数")
    total_messages: int = Field(..., description="总消息数")


class MessageStatsResponse(BaseModel):
    """消息统计响应"""
    total_messages: int = Field(..., description="总消息数")
    user_messages: int = Field(..., description="用户消息数")
    assistant_messages: int = Field(..., description="AI消息数")
    first_message_time: Optional[datetime] = Field(default=None, description="第一条消息时间")
    last_message_time: Optional[datetime] = Field(default=None, description="最后一条消息时间")


# ==================== 搜索模型 ====================

class SearchMessagesResponse(BaseModel):
    """搜索消息响应"""
    id: int = Field(..., description="数据库ID")
    message_id: str = Field(..., description="消息唯一标识")
    conversation_id: str = Field(..., description="对话ID")
    conversation_title: str = Field(..., description="对话标题")
    role: str = Field(..., description="消息角色")
    content: str = Field(..., description="消息内容")
    created_at: datetime = Field(..., description="创建时间")


class SearchResultResponse(BaseModel):
    """搜索结果响应"""
    results: List[SearchMessagesResponse] = Field(..., description="搜索结果列表")
    total: int = Field(..., description="总数")
    keyword: str = Field(..., description="搜索关键词")


# ==================== 删除/恢复模型 ====================

class DeleteConversationResponse(BaseModel):
    """删除对话响应"""
    success: bool = Field(..., description="是否成功")
    conversation_id: str = Field(..., description="对话ID")
    message: str = Field(..., description="操作结果消息")


class RestoreConversationResponse(BaseModel):
    """恢复对话响应"""
    success: bool = Field(..., description="是否成功")
    conversation_id: str = Field(..., description="对话ID")
    message: str = Field(..., description="操作结果消息")
