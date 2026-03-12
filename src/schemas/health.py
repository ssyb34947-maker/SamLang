from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """
    Response schema for health check endpoints
    """
    status: str = Field(..., description="Service status")
    message: str = Field(..., description="Status message")
    version: str = Field(..., description="API version")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "message": "API is running",
                "version": "0.1.0"
            }
        }
