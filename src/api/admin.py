"""
管理员相关API
"""

from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from src.db.admin import (
    authenticate_admin,
    get_admin_by_id,
    create_admin as db_create_admin,
    list_admins,
    update_admin_status,
    update_admin_password,
    delete_admin
)
from src.auth.admin_jwt import (
    create_admin_access_token,
    create_admin_refresh_token,
    validate_admin_access_token,
    validate_admin_refresh_token
)

router = APIRouter(tags=["admin"])
security = HTTPBearer()


# ============ 请求/响应模型 ============

class AdminLoginRequest(BaseModel):
    """管理员登录请求"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=50)


class AdminCreateRequest(BaseModel):
    """创建管理员请求"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=50)
    nickname: Optional[str] = Field(None, max_length=50)
    role: str = Field(default="admin")


class AdminResponse(BaseModel):
    """管理员信息响应"""
    id: int
    uuid: str
    username: str
    nickname: Optional[str] = None
    role: str
    status: str = "active"
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class AdminLoginResponse(BaseModel):
    """管理员登录响应"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    admin: AdminResponse


class AdminMeResponse(BaseModel):
    """当前管理员信息响应"""
    id: int
    uuid: str
    username: str
    nickname: Optional[str]
    role: str


class AdminListResponse(BaseModel):
    """管理员列表响应"""
    total: int
    items: List[AdminResponse]


class UpdateStatusRequest(BaseModel):
    """更新状态请求"""
    status: str = Field(..., pattern="^(active|disabled)$")


class UpdatePasswordRequest(BaseModel):
    """更新密码请求"""
    new_password: str = Field(..., min_length=6, max_length=50)


# ============ 依赖函数 ============

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """获取当前登录的管理员"""
    token = credentials.credentials
    payload = validate_admin_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin_id = int(payload.get("sub"))
    admin = get_admin_by_id(admin_id)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="管理员不存在"
        )

    if admin["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已禁用"
        )

    return admin


async def get_super_admin(
    current_admin: dict = Depends(get_current_admin)
) -> dict:
    """验证当前管理员是否为超级管理员"""
    if current_admin["role"] != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要超级管理员权限"
        )
    return current_admin


# ============ API路由 ============

@router.post("/api/admin/login", response_model=AdminLoginResponse)
async def admin_login(login_data: AdminLoginRequest):
    """
    管理员登录
    """
    try:
        admin = authenticate_admin(
            login_data.username,
            login_data.password
        )

        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="账号或密码错误"
            )

        # 生成token
        access_token = create_admin_access_token(
            data={"sub": str(admin["id"]), "role": admin["role"]}
        )
        refresh_token = create_admin_refresh_token(
            data={"sub": str(admin["id"])}
        )

        return AdminLoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            admin=AdminResponse(**admin)
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"登录失败: {str(e)}"
        )


@router.post("/api/admin/refresh")
async def admin_refresh_token(refresh_token: str):
    """
    刷新管理员访问令牌
    """
    admin_id = validate_admin_refresh_token(refresh_token)

    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新令牌"
        )

    admin = get_admin_by_id(admin_id)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="管理员不存在"
        )

    if admin["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已禁用"
        )

    # 生成新的访问令牌
    new_access_token = create_admin_access_token(
        data={"sub": str(admin_id), "role": admin["role"]}
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.get("/api/admin/me", response_model=AdminMeResponse)
async def get_admin_me(current_admin: dict = Depends(get_current_admin)):
    """
    获取当前管理员信息
    """
    return AdminMeResponse(
        id=current_admin["id"],
        uuid=current_admin["uuid"],
        username=current_admin["username"],
        nickname=current_admin.get("nickname"),
        role=current_admin["role"]
    )


@router.post("/api/admin/logout")
async def admin_logout(current_admin: dict = Depends(get_current_admin)):
    """
    管理员登出
    JWT无状态，主要在客户端处理
    """
    return {"message": "登出成功"}


@router.post(
    "/api/admin/create",
    response_model=AdminResponse,
    dependencies=[Depends(get_super_admin)]
)
async def create_admin(request: AdminCreateRequest):
    """
    创建新管理员（仅超级管理员）
    """
    try:
        admin_id = db_create_admin(
            username=request.username,
            password=request.password,
            nickname=request.nickname,
            role=request.role
        )

        admin = get_admin_by_id(admin_id)
        return AdminResponse(**admin)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建管理员失败: {str(e)}"
        )


@router.get(
    "/api/admin/list",
    response_model=AdminListResponse,
    dependencies=[Depends(get_current_admin)]
)
async def get_admin_list(limit: int = 100, offset: int = 0):
    """
    获取管理员列表
    """
    try:
        admins = list_admins(limit=limit, offset=offset)
        return AdminListResponse(
            total=len(admins),
            items=[AdminResponse(**admin) for admin in admins]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取列表失败: {str(e)}"
        )


@router.put(
    "/api/admin/{admin_id}/status",
    dependencies=[Depends(get_super_admin)]
)
async def change_admin_status(admin_id: int, request: UpdateStatusRequest):
    """
    更新管理员状态（仅超级管理员）
    """
    try:
        success = update_admin_status(admin_id, request.status)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="管理员不存在"
            )
        return {"message": "状态更新成功"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新失败: {str(e)}"
        )


@router.put(
    "/api/admin/{admin_id}/password",
    dependencies=[Depends(get_super_admin)]
)
async def reset_admin_password(
    admin_id: int,
    request: UpdatePasswordRequest
):
    """
    重置管理员密码（仅超级管理员）
    """
    try:
        success = update_admin_password(admin_id, request.new_password)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="管理员不存在"
            )
        return {"message": "密码重置成功"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"重置失败: {str(e)}"
        )


@router.delete(
    "/api/admin/{admin_id}",
    dependencies=[Depends(get_super_admin)]
)
async def remove_admin(admin_id: int):
    """
    删除管理员（仅超级管理员）
    """
    try:
        success = delete_admin(admin_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="管理员不存在"
            )
        return {"message": "删除成功"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除失败: {str(e)}"
        )
