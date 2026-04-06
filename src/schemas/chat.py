from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Tool(BaseModel):
    """
    工具类
    """
    name: str = Field(..., description="工具名称")
    arguments: str = Field(..., description="工具内容")

class AgentRequest(BaseModel):
    """
    完整的Agent ReAct响应情况
    """
    result: str = Field(...,min_length=1,max_length=5000, description="Agent ReAct响应结果")
    tools: list[Tool] = Field(..., description="使用的工具列表")

class ChatRequest(BaseModel):
    """
    Request schema for chat endpoint
    """
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User message to send to AI"
    )
    conversation_id: Optional[str] = Field(
        default=None,
        description="对话ID，为空则创建新对话"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "你好，介绍一下你自己",
                "conversation_id": None
            }
        }


class ChatResponse(BaseModel):
    """
    Response schema for chat endpoint
    """
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="AI response message")
    timestamp: Optional[datetime] = Field(
        default=None,
        description="Response timestamp"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "你好！我是你的 AI 助手，很高兴帮助你学习英语。",
                "timestamp": "2026-03-09T12:00:00"
            }
        }