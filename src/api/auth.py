"""
认证相关API
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from src.schemas.auth import UserCreate, UserLogin, User, Token, UserWithProfile
from src.db.user import create_user, authenticate_user, get_user_by_id, get_user_profile
from src.auth.jwt import create_access_token, create_refresh_token
from src.auth.middleware import get_current_active_user

router = APIRouter(tags=["auth"])


@router.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """
    用户注册
    """
    try:
        # 创建用户
        user_id = create_user(user_data.username, user_data.email, user_data.password)
        
        # 生成token
        access_token = create_access_token(data={"sub": str(user_id)})
        refresh_token = create_refresh_token(data={"sub": str(user_id)})
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注册失败: {str(e)}"
        )


@router.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    用户登录
    """
    # 验证用户
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 检查用户是否激活
    if not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户账号未激活"
        )
    
    # 生成token
    access_token = create_access_token(data={"sub": str(user["id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["id"])})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/api/auth/login/form", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2兼容的登录端点
    """
    # OAuth2PasswordRequestForm使用username字段，但我们用email登录
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user["id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["id"])})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/api/auth/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """
    刷新访问令牌
    """
    from src.auth.jwt import decode_token
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = int(payload.get("sub"))
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 生成新的访问令牌
    new_access_token = create_access_token(data={"sub": str(user_id)})
    
    return Token(
        access_token=new_access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/api/auth/logout")
async def logout(current_user: dict = Depends(get_current_active_user)):
    """
    用户登出
    """
    # JWT是无状态的，登出主要在客户端处理
    # 这里可以添加token黑名单逻辑
    return {"message": "登出成功"}


@router.get("/api/auth/me", response_model=UserWithProfile)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """
    获取当前用户信息
    """
    user_id = current_user["id"]
    
    # 获取用户画像
    profile = get_user_profile(user_id)
    
    # 构建响应
    user_response = User(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        avatar=current_user["avatar"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"]
    )
    
    return UserWithProfile(
        **user_response.model_dump(),
        profile=profile
    )