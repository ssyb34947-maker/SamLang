"""
认证相关API
"""

import os
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from src.schemas.auth import UserCreate, UserLogin, User, Token, UserWithProfile, UserUpdate
from src.db.user import create_user, authenticate_user, get_user_by_id, get_user_profile, update_user_info
from src.auth.jwt import create_access_token, create_refresh_token
from src.auth.middleware import get_current_active_user

router = APIRouter(tags=["auth"])

# 头像上传目录
AVATAR_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "avatars")
os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)


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
    # 验证用户（支持用户名或邮箱）
    user = authenticate_user(user_data.email or user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误",
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
        uuid=current_user["uuid"],
        username=current_user["username"],
        email=current_user["email"],
        avatar=current_user["avatar"],
        bio=current_user.get("bio"),
        is_active=current_user["is_active"],
        created_at=current_user["created_at"]
    )
    
    return UserWithProfile(
        **user_response.model_dump(),
        profile=profile
    )


@router.put("/api/auth/me", response_model=User)
async def update_current_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """
    更新当前用户信息
    """
    user_id = current_user["id"]
    
    try:
        # 构建更新数据
        update_data = user_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="没有提供要更新的字段"
            )
        
        # 更新用户信息
        success = update_user_info(user_id, update_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="更新失败，用户可能不存在"
            )
        
        # 获取更新后的用户信息
        updated_user = get_user_by_id(user_id)

        return User(
            id=updated_user["id"],
            uuid=updated_user["uuid"],
            username=updated_user["username"],
            email=updated_user["email"],
            avatar=updated_user["avatar"],
            bio=updated_user.get("bio"),
            is_active=updated_user["is_active"],
            created_at=updated_user["created_at"]
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新失败: {str(e)}"
        )


@router.post("/api/auth/avatar", response_model=User)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user)
):
    """
    上传用户头像
    """
    user_id = current_user["id"]
    
    try:
        # 验证文件类型
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不支持的文件类型。只允许: {', '.join(allowed_types)}"
            )
        
        # 验证文件大小（最大 5MB）
        max_size = 5 * 1024 * 1024  # 5MB
        contents = await file.read()
        if len(contents) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="文件大小超过限制（最大 5MB）"
            )
        
        # 生成唯一文件名
        file_ext = os.path.splitext(file.filename)[1].lower()
        if not file_ext:
            # 根据 content_type 推断扩展名
            ext_map = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/gif": ".gif",
                "image/webp": ".webp"
            }
            file_ext = ext_map.get(file.content_type, ".jpg")
        
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(AVATAR_UPLOAD_DIR, unique_filename)
        
        # 保存文件
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # 构建头像 URL
        avatar_url = f"/api/avatars/{unique_filename}"
        
        # 更新用户头像
        success = update_user_info(user_id, {"avatar": avatar_url})
        
        if not success:
            # 删除已上传的文件
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="更新头像失败"
            )
        
        # 获取更新后的用户信息
        updated_user = get_user_by_id(user_id)

        return User(
            id=updated_user["id"],
            uuid=updated_user["uuid"],
            username=updated_user["username"],
            email=updated_user["email"],
            avatar=updated_user["avatar"],
            bio=updated_user.get("bio"),
            is_active=updated_user["is_active"],
            created_at=updated_user["created_at"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"上传头像失败: {str(e)}"
        )