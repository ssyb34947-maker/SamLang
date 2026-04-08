"""
管理员数据库模型和操作
"""

import sqlite3
import hashlib
import uuid
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from src.db.user import DB_PATH


# 安全常量
MAX_LOGIN_FAILS = 5
LOCK_DURATION_MINUTES = 30


def init_admin_tables():
    """初始化管理员相关数据库表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 创建管理员表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nickname TEXT DEFAULT NULL,
        role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
        permissions TEXT DEFAULT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
        last_login_at TIMESTAMP DEFAULT NULL,
        login_fail_count INTEGER DEFAULT 0,
        locked_until TIMESTAMP DEFAULT NULL,
        created_by INTEGER DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 创建索引
    cursor.execute('''
    CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_uuid ON admins(uuid)
    ''')
    cursor.execute('''
    CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_username ON admins(username)
    ''')
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status)
    ''')
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role)
    ''')

    conn.commit()
    conn.close()


def hash_password(password: str) -> str:
    """哈希密码"""
    return hashlib.sha256(password.encode()).hexdigest()


def is_account_locked(locked_until: Optional[str]) -> bool:
    """检查账号是否处于锁定状态"""
    if not locked_until:
        return False
    lock_time = datetime.fromisoformat(locked_until.replace('Z', '+00:00'))
    return datetime.now() > lock_time


def create_admin(
    username: str,
    password: str,
    nickname: Optional[str] = None,
    role: str = 'admin',
    created_by: Optional[int] = None
) -> int:
    """创建新管理员账号"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        admin_uuid = str(uuid.uuid4())
        password_hash = hash_password(password)

        cursor.execute('''
        INSERT INTO admins (uuid, username, password_hash, nickname, role, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (admin_uuid, username, password_hash, nickname, role, created_by))

        admin_id = cursor.lastrowid
        conn.commit()
        return admin_id

    except sqlite3.IntegrityError as e:
        conn.rollback()
        if 'username' in str(e):
            raise ValueError("管理员账号已存在")
        raise ValueError(f"创建管理员失败: {str(e)}")
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def authenticate_admin(username: str, password: str) -> Optional[Dict[str, Any]]:
    """验证管理员登录"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('''
        SELECT id, uuid, username, nickname, role, status, password_hash,
               login_fail_count, locked_until
        FROM admins WHERE username = ?
        ''', (username,))

        row = cursor.fetchone()
        if not row:
            return None

        admin = {
            'id': row[0],
            'uuid': row[1],
            'username': row[2],
            'nickname': row[3],
            'role': row[4],
            'status': row[5],
            'password_hash': row[6],
            'login_fail_count': row[7],
            'locked_until': row[8]
        }

        # 检查账号状态
        if admin['status'] != 'active':
            raise ValueError("账号已禁用")

        # 检查是否被锁定
        if admin['locked_until'] and not is_account_locked(admin['locked_until']):
            lock_time = datetime.fromisoformat(admin['locked_until'].replace('Z', '+00:00'))
            remaining = (lock_time - datetime.now()).total_seconds() // 60
            raise ValueError(f"账号已锁定，请 {int(remaining)} 分钟后重试")

        # 验证密码
        password_hash = hash_password(password)
        if password_hash != admin['password_hash']:
            _handle_login_failure(cursor, conn, admin['id'], admin['login_fail_count'])
            return None

        # 登录成功，更新登录信息
        _handle_login_success(cursor, conn, admin['id'])

        return {
            'id': admin['id'],
            'uuid': admin['uuid'],
            'username': admin['username'],
            'nickname': admin['nickname'],
            'role': admin['role'],
            'status': admin['status'],
            'last_login_at': admin.get('last_login_at'),
            'created_at': admin.get('created_at')
        }

    except ValueError:
        raise
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def _handle_login_failure(cursor, conn, admin_id: int, current_fails: int):
    """处理登录失败"""
    new_fail_count = current_fails + 1

    if new_fail_count >= MAX_LOGIN_FAILS:
        locked_until = datetime.now() + timedelta(minutes=LOCK_DURATION_MINUTES)
        cursor.execute('''
        UPDATE admins SET login_fail_count = ?, locked_until = ?
        WHERE id = ?
        ''', (new_fail_count, locked_until.isoformat(), admin_id))
    else:
        cursor.execute('''
        UPDATE admins SET login_fail_count = ? WHERE id = ?
        ''', (new_fail_count, admin_id))

    conn.commit()


def _handle_login_success(cursor, conn, admin_id: int):
    """处理登录成功"""
    cursor.execute('''
    UPDATE admins SET last_login_at = CURRENT_TIMESTAMP,
                      login_fail_count = 0,
                      locked_until = NULL
    WHERE id = ?
    ''', (admin_id,))
    conn.commit()


def get_admin_by_id(admin_id: int) -> Optional[Dict[str, Any]]:
    """根据ID获取管理员信息"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('''
        SELECT id, uuid, username, nickname, role, status,
               last_login_at, created_at, updated_at
        FROM admins WHERE id = ?
        ''', (admin_id,))

        row = cursor.fetchone()
        if not row:
            return None

        return {
            'id': row[0],
            'uuid': row[1],
            'username': row[2],
            'nickname': row[3],
            'role': row[4],
            'status': row[5],
            'last_login_at': row[6],
            'created_at': row[7],
            'updated_at': row[8]
        }

    finally:
        conn.close()


def get_admin_by_uuid(admin_uuid: str) -> Optional[Dict[str, Any]]:
    """根据UUID获取管理员信息"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('''
        SELECT id, uuid, username, nickname, role, status,
               last_login_at, created_at, updated_at
        FROM admins WHERE uuid = ?
        ''', (admin_uuid,))

        row = cursor.fetchone()
        if not row:
            return None

        return {
            'id': row[0],
            'uuid': row[1],
            'username': row[2],
            'nickname': row[3],
            'role': row[4],
            'status': row[5],
            'last_login_at': row[6],
            'created_at': row[7],
            'updated_at': row[8]
        }

    finally:
        conn.close()


def list_admins(limit: int = 100, offset: int = 0) -> list:
    """获取管理员列表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('''
        SELECT id, uuid, username, nickname, role, status,
               last_login_at, created_at
        FROM admins
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        ''', (limit, offset))

        rows = cursor.fetchall()
        return [
            {
                'id': row[0],
                'uuid': row[1],
                'username': row[2],
                'nickname': row[3],
                'role': row[4],
                'status': row[5],
                'last_login_at': row[6],
                'created_at': row[7]
            }
            for row in rows
        ]

    finally:
        conn.close()


def update_admin_status(admin_id: int, status: str) -> bool:
    """更新管理员状态"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('''
        UPDATE admins SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        ''', (status, admin_id))

        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def update_admin_password(admin_id: int, new_password: str) -> bool:
    """更新管理员密码"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        password_hash = hash_password(new_password)
        cursor.execute('''
        UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        ''', (password_hash, admin_id))

        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_admin(admin_id: int) -> bool:
    """删除管理员账号"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('DELETE FROM admins WHERE id = ?', (admin_id,))
        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
