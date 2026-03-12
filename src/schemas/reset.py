from pydantic import BaseModel, Field

class ResetRequest(BaseModel):
    """
    Request schema for reset endpoint (optional body)
    """
    pass


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