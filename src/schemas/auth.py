"""
认证相关的请求和响应模型
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """用户基础模型"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱地址")


class UserCreate(UserBase):
    """用户创建模型"""
    password: str = Field(..., min_length=6, description="密码")


class UserLogin(BaseModel):
    """用户登录模型"""
    email: Optional[EmailStr] = Field(None, description="邮箱地址")
    username: Optional[str] = Field(None, description="用户名")
    password: str = Field(..., min_length=6, description="密码")
    
    @field_validator('email', 'username')
    def validate_email_or_username(cls, v, info):
        if info.field_name == 'email' and info.data.get('username') is None and v is None:
            raise ValueError('必须提供邮箱或用户名')
        return v


class User(UserBase):
    """用户响应模型"""
    id: int
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token响应模型"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token数据模型"""
    user_id: Optional[int] = None


class UserProfile(BaseModel):
    """用户画像模型"""
    learning_level: str = Field(default="beginner", description="学习水平")
    interests: list[str] = Field(default_factory=list, description="兴趣爱好")
    learning_goals: list[str] = Field(default_factory=list, description="学习目标")
    strengths: list[str] = Field(default_factory=list, description="优势")
    weaknesses: list[str] = Field(default_factory=list, description="弱点")


class UserWithProfile(User):
    """带画像的用户响应模型"""
    profile: Optional[UserProfile] = None