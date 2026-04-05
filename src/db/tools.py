"""
数据库工具函数
提供各种数据库查询和操作功能
"""

import sqlite3
from typing import Optional, Dict, Any, List
import json
import os
from src.db.user import DB_PATH

def get_user_username(user_id: int) -> Optional[str]:
    """获取用户用户名"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,))
        result = cursor.fetchone()
        return result[0] if result else None
    finally:
        conn.close()

def get_user_email(user_id: int) -> Optional[str]:
    """获取用户邮箱"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT email FROM users WHERE id = ?', (user_id,))
        result = cursor.fetchone()
        return result[0] if result else None
    finally:
        conn.close()

def get_all_users() -> List[Dict[str, Any]]:
    """获取所有用户列表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id, username, email, avatar, is_active, created_at FROM users ORDER BY created_at DESC')
        users = cursor.fetchall()
        
        return [
            {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'avatar': user[3],
                'is_active': user[4],
                'created_at': user[5]
            }
            for user in users
        ]
    finally:
        conn.close()

def get_user_statistics(user_id: int) -> Dict[str, Any]:
    """获取用户统计信息"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 获取聊天消息数量
        cursor.execute('SELECT COUNT(*) FROM chat_history WHERE user_id = ?', (user_id,))
        message_count = cursor.fetchone()[0]
        
        # 获取用户信息
        cursor.execute('SELECT username, email, created_at FROM users WHERE id = ?', (user_id,))
        user_info = cursor.fetchone()
        
        if not user_info:
            return {}
            
        return {
            'user_id': user_id,
            'username': user_info[0],
            'email': user_info[1],
            'message_count': message_count,
            'created_at': user_info[2]
        }
    finally:
        conn.close()

def search_users_by_username(keyword: str) -> List[Dict[str, Any]]:
    """根据用户名搜索用户"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id, username, email, avatar, is_active FROM users WHERE username LIKE ?', (f'%{keyword}%',))
        users = cursor.fetchall()
        
        return [
            {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'avatar': user[3],
                'is_active': user[4]
            }
            for user in users
        ]
    finally:
        conn.close()

def update_user_avatar(user_id: int, avatar_url: str) -> bool:
    """更新用户头像"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('UPDATE users SET avatar = ? WHERE id = ?', (avatar_url, user_id))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def deactivate_user(user_id: int) -> bool:
    """停用用户账号"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('UPDATE users SET is_active = FALSE WHERE id = ?', (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def reactivate_user(user_id: int) -> bool:
    """重新激活用户账号"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('UPDATE users SET is_active = TRUE WHERE id = ?', (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def delete_user(user_id: int) -> bool:
    """删除用户（级联删除相关数据）"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_user_chat_history(user_id: int, limit: int = 100) -> List[Dict[str, Any]]:
    """获取用户聊天历史"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'SELECT message_id, role, content, metadata, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            (user_id, limit)
        )
        messages = cursor.fetchall()
        
        return [
            {
                'message_id': message[0],
                'role': message[1],
                'content': message[2],
                'metadata': json.loads(message[3]) if message[3] else None,
                'created_at': message[4]
            }
            for message in messages
        ]
    finally:
        conn.close()

def save_chat_message(user_id: int, message_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
    """保存聊天消息"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        metadata_json = json.dumps(metadata) if metadata else None
        cursor.execute(
            'INSERT INTO chat_history (user_id, message_id, role, content, metadata) VALUES (?, ?, ?, ?, ?)',
            (user_id, message_id, role, content, metadata_json)
        )
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()