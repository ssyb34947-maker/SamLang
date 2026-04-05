"""
对话数据库模型和操作
管理用户的对话（会话）元数据
"""

import sqlite3
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from src.db.user import DB_PATH


def init_conversation_tables():
    """初始化对话相关数据库表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 创建对话表（元数据）
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        conversation_id TEXT UNIQUE NOT NULL,
        title TEXT DEFAULT '新对话',
        is_pinned BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        message_count INTEGER DEFAULT 0,
        last_message TEXT,
        last_message_time TIMESTAMP,
        model_config TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')
    
    # 创建消息表（具体数据）
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        message_id TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (conversation_id) ON DELETE CASCADE
    )
    ''')
    
    # 创建索引优化查询性能
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_conversations_user 
    ON conversations(user_id, updated_at DESC)
    ''')
    
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_conversations_pinned 
    ON conversations(user_id, is_pinned, updated_at DESC)
    ''')
    
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_messages_conversation 
    ON messages(conversation_id, created_at ASC)
    ''')
    
    conn.commit()
    conn.close()


# ==================== 对话表操作 ====================

def create_conversation(
    user_id: int, 
    conversation_id: str, 
    title: str = '新对话',
    model_config: Optional[Dict[str, Any]] = None
) -> int:
    """
    创建新对话
    
    Args:
        user_id: 用户ID
        conversation_id: 对话唯一标识（UUID）
        title: 对话标题
        model_config: 模型配置（JSON格式）
    
    Returns:
        新创建对话的数据库ID
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        model_config_json = json.dumps(model_config) if model_config else None
        
        cursor.execute('''
        INSERT INTO conversations 
        (user_id, conversation_id, title, model_config, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (user_id, conversation_id, title, model_config_json))
        
        conversation_db_id = cursor.lastrowid
        conn.commit()
        return conversation_db_id
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_conversation_by_id(conversation_id: str) -> Optional[Dict[str, Any]]:
    """
    根据对话ID获取对话信息
    
    Args:
        conversation_id: 对话唯一标识
    
    Returns:
        对话信息字典，不存在则返回None
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT id, user_id, conversation_id, title, is_pinned, is_archived, 
               is_deleted, message_count, last_message, last_message_time,
               model_config, created_at, updated_at
        FROM conversations 
        WHERE conversation_id = ? AND is_deleted = FALSE
        ''', (conversation_id,))
        
        row = cursor.fetchone()
        if not row:
            return None
            
        return {
            'id': row[0],
            'user_id': row[1],
            'conversation_id': row[2],
            'title': row[3],
            'is_pinned': bool(row[4]),
            'is_archived': bool(row[5]),
            'is_deleted': bool(row[6]),
            'message_count': row[7],
            'last_message': row[8],
            'last_message_time': row[9],
            'model_config': json.loads(row[10]) if row[10] else None,
            'created_at': row[11],
            'updated_at': row[12]
        }
        
    finally:
        conn.close()


def get_user_conversations(
    user_id: int, 
    include_archived: bool = False,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    获取用户的对话列表
    
    Args:
        user_id: 用户ID
        include_archived: 是否包含已归档的对话
        limit: 返回数量限制
        offset: 分页偏移量
    
    Returns:
        对话列表，按置顶状态和更新时间排序
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        if include_archived:
            cursor.execute('''
            SELECT id, conversation_id, title, is_pinned, is_archived,
                   message_count, last_message, last_message_time, created_at, updated_at
            FROM conversations 
            WHERE user_id = ? AND is_deleted = FALSE
            ORDER BY is_pinned DESC, updated_at DESC
            LIMIT ? OFFSET ?
            ''', (user_id, limit, offset))
        else:
            cursor.execute('''
            SELECT id, conversation_id, title, is_pinned, is_archived,
                   message_count, last_message, last_message_time, created_at, updated_at
            FROM conversations 
            WHERE user_id = ? AND is_deleted = FALSE AND is_archived = FALSE
            ORDER BY is_pinned DESC, updated_at DESC
            LIMIT ? OFFSET ?
            ''', (user_id, limit, offset))
        
        rows = cursor.fetchall()
        
        return [
            {
                'id': row[0],
                'conversation_id': row[1],
                'title': row[2],
                'is_pinned': bool(row[3]),
                'is_archived': bool(row[4]),
                'message_count': row[5],
                'last_message': row[6],
                'last_message_time': row[7],
                'created_at': row[8],
                'updated_at': row[9]
            }
            for row in rows
        ]
        
    finally:
        conn.close()


def update_conversation(
    conversation_id: str, 
    update_data: Dict[str, Any]
) -> bool:
    """
    更新对话信息
    
    Args:
        conversation_id: 对话唯一标识
        update_data: 要更新的字段字典
            - title: 标题
            - is_pinned: 是否置顶
            - is_archived: 是否归档
            - is_deleted: 是否删除（软删除）
            - model_config: 模型配置
    
    Returns:
        是否更新成功
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        allowed_fields = ['title', 'is_pinned', 'is_archived', 'is_deleted', 'model_config']
        updates = []
        values = []
        
        for field in allowed_fields:
            if field in update_data:
                if field == 'model_config':
                    values.append(json.dumps(update_data[field]) if update_data[field] else None)
                else:
                    values.append(update_data[field])
                updates.append(f"{field} = ?")
        
        if not updates:
            return False
        
        # 自动更新 updated_at
        updates.append("updated_at = CURRENT_TIMESTAMP")
        values.append(conversation_id)
        
        cursor.execute(
            f"UPDATE conversations SET {', '.join(updates)} WHERE conversation_id = ?",
            values
        )
        
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def update_conversation_last_message(
    conversation_id: str, 
    last_message: str,
    increment_count: bool = True
) -> bool:
    """
    更新对话的最后一条消息信息
    
    Args:
        conversation_id: 对话唯一标识
        last_message: 最后一条消息内容
        increment_count: 是否增加消息计数
    
    Returns:
        是否更新成功
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        if increment_count:
            cursor.execute('''
            UPDATE conversations 
            SET last_message = ?, 
                last_message_time = CURRENT_TIMESTAMP,
                message_count = message_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE conversation_id = ?
            ''', (last_message, conversation_id))
        else:
            cursor.execute('''
            UPDATE conversations 
            SET last_message = ?, 
                last_message_time = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE conversation_id = ?
            ''', (last_message, conversation_id))
        
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_conversation(conversation_id: str, soft_delete: bool = True) -> bool:
    """
    删除对话
    
    Args:
        conversation_id: 对话唯一标识
        soft_delete: 是否软删除（默认True），False则永久删除
    
    Returns:
        是否删除成功
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        if soft_delete:
            cursor.execute('''
            UPDATE conversations 
            SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE conversation_id = ?
            ''', (conversation_id,))
        else:
            cursor.execute('DELETE FROM conversations WHERE conversation_id = ?', (conversation_id,))
        
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def restore_conversation(conversation_id: str) -> bool:
    """
    恢复已软删除的对话
    
    Args:
        conversation_id: 对话唯一标识
    
    Returns:
        是否恢复成功
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        UPDATE conversations 
        SET is_deleted = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE conversation_id = ?
        ''', (conversation_id,))
        
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# ==================== 对话统计 ====================

def get_user_conversation_stats(user_id: int) -> Dict[str, Any]:
    """
    获取用户的对话统计信息
    
    Args:
        user_id: 用户ID
    
    Returns:
        统计信息字典
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 总对话数
        cursor.execute('''
        SELECT COUNT(*) FROM conversations 
        WHERE user_id = ? AND is_deleted = FALSE
        ''', (user_id,))
        total_count = cursor.fetchone()[0]
        
        # 置顶对话数
        cursor.execute('''
        SELECT COUNT(*) FROM conversations 
        WHERE user_id = ? AND is_deleted = FALSE AND is_pinned = TRUE
        ''', (user_id,))
        pinned_count = cursor.fetchone()[0]
        
        # 归档对话数
        cursor.execute('''
        SELECT COUNT(*) FROM conversations 
        WHERE user_id = ? AND is_deleted = FALSE AND is_archived = TRUE
        ''', (user_id,))
        archived_count = cursor.fetchone()[0]
        
        # 总消息数
        cursor.execute('''
        SELECT SUM(message_count) FROM conversations 
        WHERE user_id = ? AND is_deleted = FALSE
        ''', (user_id,))
        total_messages = cursor.fetchone()[0] or 0
        
        return {
            'total_conversations': total_count,
            'pinned_conversations': pinned_count,
            'archived_conversations': archived_count,
            'total_messages': total_messages
        }
        
    finally:
        conn.close()
