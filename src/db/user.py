"""
用户数据库模型和操作
"""

import sqlite3
import hashlib
import json
from typing import Optional, Dict, Any
from datetime import datetime
import os

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'samlang.db')

# 确保数据目录存在
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def init_db():
    """初始化数据库表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 创建用户表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # 检查并添加 bio 列（如果不存在）
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    if 'bio' not in columns:
        cursor.execute('ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL')
    
    # 创建用户画像表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        learning_level TEXT DEFAULT 'beginner',
        interests TEXT DEFAULT NULL,
        learning_goals TEXT DEFAULT NULL,
        strengths TEXT DEFAULT NULL,
        weaknesses TEXT DEFAULT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')
    
    # 创建聊天历史表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    """哈希密码"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(username: str, email: str, password: str) -> int:
    """创建新用户"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 验证用户名：只可以是大小写英文字母和数字
        import re
        if not re.match(r'^[a-zA-Z0-9]+$', username):
            raise ValueError("用户名只能包含大小写英文字母和数字")
        
        # 检查用户名和邮箱是否已存在
        cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
        if cursor.fetchone():
            raise ValueError("用户名或邮箱已存在")
        
        # 创建用户
        password_hash = hash_password(password)
        cursor.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        user_id = cursor.lastrowid
        
        # 创建用户画像
        cursor.execute(
            'INSERT INTO user_profiles (user_id) VALUES (?)',
            (user_id,)
        )
        
        conn.commit()
        return user_id
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def authenticate_user(username_or_email: str, password: str) -> Optional[Dict[str, Any]]:
    """验证用户登录（支持用户名或邮箱）"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        password_hash = hash_password(password)
        cursor.execute(
            'SELECT id, username, email, avatar, is_active FROM users WHERE (email = ? OR username = ?) AND password_hash = ?',
            (username_or_email, username_or_email, password_hash)
        )
        user = cursor.fetchone()
        
        if user:
            return {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'avatar': user[3],
                'is_active': user[4]
            }
        return None
        
    finally:
        conn.close()

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """根据ID获取用户信息"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'SELECT id, username, email, avatar, bio, is_active, created_at FROM users WHERE id = ?',
            (user_id,)
        )
        user = cursor.fetchone()
        
        if user:
            return {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'avatar': user[3],
                'bio': user[4],
                'is_active': user[5],
                'created_at': user[6]
            }
        return None
        
    finally:
        conn.close()


def update_user_info(user_id: int, update_data: Dict[str, Any]) -> bool:
    """更新用户基本信息"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 构建更新字段
        allowed_fields = ['username', 'email', 'avatar', 'bio']
        updates = []
        values = []
        
        for field in allowed_fields:
            if field in update_data:
                updates.append(f"{field} = ?")
                values.append(update_data[field])
        
        if not updates:
            return False
        
        values.append(user_id)
        
        cursor.execute(
            f"UPDATE users SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            values
        )
        
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def update_user_profile(user_id: int, profile_data: Dict[str, Any]) -> bool:
    """更新用户画像"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 将列表转换为JSON字符串
        interests = json.dumps(profile_data.get('interests', [])) if 'interests' in profile_data else None
        learning_goals = json.dumps(profile_data.get('learning_goals', [])) if 'learning_goals' in profile_data else None
        strengths = json.dumps(profile_data.get('strengths', [])) if 'strengths' in profile_data else None
        weaknesses = json.dumps(profile_data.get('weaknesses', [])) if 'weaknesses' in profile_data else None
        
        cursor.execute('''
        UPDATE user_profiles 
        SET learning_level = COALESCE(?, learning_level),
            interests = COALESCE(?, interests),
            learning_goals = COALESCE(?, learning_goals),
            strengths = COALESCE(?, strengths),
            weaknesses = COALESCE(?, weaknesses),
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ?
        ''', (
            profile_data.get('learning_level'),
            interests,
            learning_goals,
            strengths,
            weaknesses,
            user_id
        ))
        
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """获取用户画像"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'SELECT learning_level, interests, learning_goals, strengths, weaknesses, last_updated FROM user_profiles WHERE user_id = ?',
            (user_id,)
        )
        profile = cursor.fetchone()
        
        if profile:
            return {
                'learning_level': profile[0],
                'interests': json.loads(profile[1]) if profile[1] else [],
                'learning_goals': json.loads(profile[2]) if profile[2] else [],
                'strengths': json.loads(profile[3]) if profile[3] else [],
                'weaknesses': json.loads(profile[4]) if profile[4] else [],
                'last_updated': profile[5]
            }
        return None
        
    finally:
        conn.close()