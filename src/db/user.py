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
        uuid TEXT UNIQUE DEFAULT NULL,
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

    # 检查并添加 uuid 列（如果不存在）
    if 'uuid' not in columns:
        cursor.execute('ALTER TABLE users ADD COLUMN uuid TEXT UNIQUE DEFAULT NULL')

    # 检查并添加 gender 列（如果不存在）
    if 'gender' not in columns:
        cursor.execute('ALTER TABLE users ADD COLUMN gender TEXT DEFAULT NULL')

    # 检查并添加 age 列（如果不存在）
    if 'age' not in columns:
        cursor.execute('ALTER TABLE users ADD COLUMN age INTEGER DEFAULT NULL')

    # 检查并添加 is_student 列（如果不存在）
    if 'is_student' not in columns:
        cursor.execute('ALTER TABLE users ADD COLUMN is_student BOOLEAN DEFAULT NULL')

    # 检查并添加 student_grade 列（如果不存在）
    if 'student_grade' not in columns:
        cursor.execute('ALTER TABLE users ADD COLUMN student_grade TEXT DEFAULT NULL')

    # 检查并添加 occupation 列（如果不存在）
    if 'occupation' not in columns:
        cursor.execute('ALTER TABLE users ADD COLUMN occupation TEXT DEFAULT NULL')

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
        daily_study_time TEXT DEFAULT NULL,
        math_recognition TEXT DEFAULT NULL,
        learning_autonomy TEXT DEFAULT NULL,
        learning_persistence TEXT DEFAULT NULL,
        learning_curiosity TEXT DEFAULT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')

    # 检查并添加用户画像表的新列（兼容已有表）
    cursor.execute("PRAGMA table_info(user_profiles)")
    profile_columns = [column[1] for column in cursor.fetchall()]

    if 'daily_study_time' not in profile_columns:
        cursor.execute('ALTER TABLE user_profiles ADD COLUMN daily_study_time TEXT DEFAULT NULL')
    if 'math_recognition' not in profile_columns:
        cursor.execute('ALTER TABLE user_profiles ADD COLUMN math_recognition TEXT DEFAULT NULL')
    if 'learning_autonomy' not in profile_columns:
        cursor.execute('ALTER TABLE user_profiles ADD COLUMN learning_autonomy TEXT DEFAULT NULL')
    if 'learning_persistence' not in profile_columns:
        cursor.execute('ALTER TABLE user_profiles ADD COLUMN learning_persistence TEXT DEFAULT NULL')
    if 'learning_curiosity' not in profile_columns:
        cursor.execute('ALTER TABLE user_profiles ADD COLUMN learning_curiosity TEXT DEFAULT NULL')
    
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
    import uuid
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

        # 生成用户 UUID
        user_uuid = str(uuid.uuid4())

        # 创建用户
        password_hash = hash_password(password)
        cursor.execute(
            'INSERT INTO users (uuid, username, email, password_hash) VALUES (?, ?, ?, ?)',
            (user_uuid, username, email, password_hash)
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
            'SELECT id, uuid, username, email, avatar, bio, gender, age, is_student, student_grade, occupation, is_active, created_at FROM users WHERE id = ?',
            (user_id,)
        )
        user = cursor.fetchone()

        if user:
            return {
                'id': user[0],
                'uuid': user[1],
                'username': user[2],
                'email': user[3],
                'avatar': user[4],
                'bio': user[5],
                'gender': user[6],
                'age': user[7],
                'is_student': user[8],
                'student_grade': user[9],
                'occupation': user[10],
                'is_active': user[11],
                'created_at': user[12]
            }
        return None

    finally:
        conn.close()


def get_user_by_uuid(user_uuid: str) -> Optional[Dict[str, Any]]:
    """根据UUID获取用户信息"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute(
            'SELECT id, uuid, username, email, avatar, bio, gender, age, is_student, student_grade, occupation, is_active, created_at FROM users WHERE uuid = ?',
            (user_uuid,)
        )
        user = cursor.fetchone()

        if user:
            return {
                'id': user[0],
                'uuid': user[1],
                'username': user[2],
                'email': user[3],
                'avatar': user[4],
                'bio': user[5],
                'gender': user[6],
                'age': user[7],
                'is_student': user[8],
                'student_grade': user[9],
                'occupation': user[10],
                'is_active': user[11],
                'created_at': user[12]
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
        allowed_fields = ['username', 'email', 'avatar', 'bio', 'gender', 'age', 'is_student', 'student_grade', 'occupation']
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
            daily_study_time = COALESCE(?, daily_study_time),
            math_recognition = COALESCE(?, math_recognition),
            learning_autonomy = COALESCE(?, learning_autonomy),
            learning_persistence = COALESCE(?, learning_persistence),
            learning_curiosity = COALESCE(?, learning_curiosity),
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ?
        ''', (
            profile_data.get('learning_level'),
            interests,
            learning_goals,
            strengths,
            weaknesses,
            profile_data.get('daily_study_time'),
            profile_data.get('math_recognition'),
            profile_data.get('learning_autonomy'),
            profile_data.get('learning_persistence'),
            profile_data.get('learning_curiosity'),
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
            '''SELECT learning_level, interests, learning_goals, strengths, weaknesses,
                      daily_study_time, math_recognition, learning_autonomy,
                      learning_persistence, learning_curiosity, last_updated
               FROM user_profiles WHERE user_id = ?''',
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
                'daily_study_time': profile[5],
                'math_recognition': profile[6],
                'learning_autonomy': profile[7],
                'learning_persistence': profile[8],
                'learning_curiosity': profile[9],
                'last_updated': profile[10]
            }
        return None

    finally:
        conn.close()