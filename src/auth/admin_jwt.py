"""
管理员JWT Token 生成和验证
与普通用户JWT隔离，使用不同的密钥前缀
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# JWT配置
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ADMIN_SECRET_KEY = f"{SECRET_KEY}-admin"
ALGORITHM = "HS256"
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES = 120  # 管理员token有效期2小时
ADMIN_REFRESH_TOKEN_EXPIRE_DAYS = 1      # 管理员refresh token有效期1天


def create_admin_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """创建管理员访问令牌"""
    to_encode = data.copy()
    to_encode.update({"type": "admin_access"})

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, ADMIN_SECRET_KEY, algorithm=ALGORITHM
    )
    return encoded_jwt


def create_admin_refresh_token(data: Dict[str, Any]) -> str:
    """创建管理员刷新令牌"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ADMIN_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "type": "admin_refresh"
    })
    encoded_jwt = jwt.encode(
        to_encode, ADMIN_SECRET_KEY, algorithm=ALGORITHM
    )
    return encoded_jwt


def decode_admin_token(token: str) -> Optional[Dict[str, Any]]:
    """解码并验证管理员令牌"""
    try:
        payload = jwt.decode(
            token, ADMIN_SECRET_KEY, algorithms=[ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        return None


def validate_admin_access_token(token: str) -> Optional[Dict[str, Any]]:
    """验证管理员访问令牌"""
    payload = decode_admin_token(token)
    if not payload:
        return None

    # 检查token类型
    token_type = payload.get("type")
    if token_type != "admin_access":
        return None

    return payload


def validate_admin_refresh_token(token: str) -> Optional[int]:
    """验证管理员刷新令牌并返回管理员ID"""
    payload = decode_admin_token(token)
    if not payload:
        return None

    # 检查token类型
    token_type = payload.get("type")
    if token_type != "admin_refresh":
        return None

    admin_id = payload.get("sub")
    if admin_id:
        return int(admin_id)
    return None
