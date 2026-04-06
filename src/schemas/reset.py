from pydantic import BaseModel, Field
from typing import Optional

class ResetRequest(BaseModel):
    """
    Request schema for reset endpoint
    """
    conversation_id: Optional[str] = Field(
        None, 
        description="要重置的对话ID，如果不提供则重置该用户的所有对话"
    )


class ResetResponse(BaseModel):
    """
    Response schema for reset endpoint
    """
    success: bool = Field(..., description="Whether the reset was successful")
    message: str = Field(..., description="Confirmation message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Chat history has been reset"
            }
        }
