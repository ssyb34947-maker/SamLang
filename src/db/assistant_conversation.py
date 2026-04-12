"""
助教对话数据库模型和操作
单独管理助教Agent的对话，与教授Agent的对话分开存储
"""

import sqlite3
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from src.db.user import DB_PATH


def init_assistant_conversation_tables():
    """初始化助教对话相关数据库表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 创建助教对话表（元数据）
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS assistant_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        conversation_id TEXT UNIQUE NOT NULL,
        title TEXT DEFAULT '助教对话',
        summary TEXT DEFAULT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        message_count INTEGER DEFAULT 0,
        last_message TEXT,
        last_message_time TIMESTAMP,
        model_config TEXT DEFAULT NULL,
        total_tokens INTEGER DEFAULT 0,
        prompt_tokens INTEGER DEFAULT 0,
        completion_tokens INTEGER DEFAULT 0,
        agent_type INTEGER DEFAULT 2,  -- 固定为2（助教Agent）
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')
    
    # 创建助教消息表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS assistant_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        message_id TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,  -- 'user', 'assistant', 'system'
        content TEXT NOT NULL,
        thinking_content TEXT DEFAULT NULL,  -- 思考过程内容
        token_count INTEGER DEFAULT 0,
        prompt_tokens INTEGER DEFAULT 0,
        completion_tokens INTEGER DEFAULT 0,
        model_name TEXT,
        metadata TEXT DEFAULT NULL,  -- JSON格式存储额外元数据
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES assistant_conversations (conversation_id) ON DELETE CASCADE
    )
    ''')
    
    # 创建索引
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_assistant_conv_user 
    ON assistant_conversations (user_id, is_deleted, created_at DESC)
    ''')
    
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_assistant_msg_conv 
    ON assistant_messages (conversation_id, created_at ASC)
    ''')
    
    conn.commit()
    conn.close()
    print("[DB] 助教对话表初始化完成")


def create_assistant_conversation(
    user_id: int,
    conversation_id: str,
    title: str = "助教对话",
    agent_type: int = 2
) -> bool:
    """创建新的助教对话"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        INSERT INTO assistant_conversations 
        (user_id, conversation_id, title, agent_type)
        VALUES (?, ?, ?, ?)
        ''', (user_id, conversation_id, title, agent_type))
        
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def add_assistant_message(
    conversation_id: str,
    message_id: str,
    role: str,
    content: str,
    thinking_content: Optional[str] = None,
    token_count: int = 0,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    model_name: Optional[str] = None,
    metadata: Optional[Dict] = None
) -> bool:
    """添加消息到助教对话"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 插入消息
        cursor.execute('''
        INSERT INTO assistant_messages 
        (conversation_id, message_id, role, content, thinking_content,
         token_count, prompt_tokens, completion_tokens, model_name, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            conversation_id, message_id, role, content, thinking_content,
            token_count, prompt_tokens, completion_tokens, model_name,
            json.dumps(metadata) if metadata else None
        ))
        
        # 更新对话的last_message和message_count
        cursor.execute('''
        UPDATE assistant_conversations 
        SET last_message = ?,
            last_message_time = CURRENT_TIMESTAMP,
            message_count = message_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE conversation_id = ?
        ''', (content[:200], conversation_id))  # 只保存前200字符作为摘要
        
        conn.commit()
        return True
    except Exception as e:
        print(f"[DB] 添加助教消息失败: {e}")
        return False
    finally:
        conn.close()


def get_user_assistant_conversations(
    user_id: int,
    limit: int = 50,
    include_deleted: bool = False
) -> List[Dict[str, Any]]:
    """获取用户的所有助教对话列表"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        if include_deleted:
            cursor.execute('''
            SELECT * FROM assistant_conversations 
            WHERE user_id = ?
            ORDER BY updated_at DESC
            LIMIT ?
            ''', (user_id, limit))
        else:
            cursor.execute('''
            SELECT * FROM assistant_conversations 
            WHERE user_id = ? AND is_deleted = FALSE
            ORDER BY updated_at DESC
            LIMIT ?
            ''', (user_id, limit))
        
        rows = cursor.fetchall()
        
        return [
            {
                'id': row['id'],
                'conversation_id': row['conversation_id'],
                'title': row['title'],
                'summary': row['summary'],
                'is_pinned': bool(row['is_pinned']),
                'is_archived': bool(row['is_archived']),
                'message_count': row['message_count'],
                'last_message': row['last_message'],
                'last_message_time': row['last_message_time'],
                'total_tokens': row['total_tokens'] or 0,
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
            for row in rows
        ]
    finally:
        conn.close()


def get_assistant_conversation_messages(
    conversation_id: str,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """获取助教对话的所有消息"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT * FROM assistant_messages 
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        LIMIT ?
        ''', (conversation_id, limit))
        
        rows = cursor.fetchall()
        
        return [
            {
                'id': row['id'],
                'message_id': row['message_id'],
                'role': row['role'],
                'content': row['content'],
                'thinking_content': row['thinking_content'],
                'token_count': row['token_count'] or 0,
                'model_name': row['model_name'],
                'metadata': json.loads(row['metadata']) if row['metadata'] else {},
                'created_at': row['created_at']
            }
            for row in rows
        ]
    finally:
        conn.close()


def get_assistant_conversation_by_id(conversation_id: str) -> Optional[Dict[str, Any]]:
    """根据ID获取助教对话详情"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT * FROM assistant_conversations 
        WHERE conversation_id = ? AND is_deleted = FALSE
        ''', (conversation_id,))
        
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return {
            'id': row['id'],
            'user_id': row['user_id'],
            'conversation_id': row['conversation_id'],
            'title': row['title'],
            'summary': row['summary'],
            'is_pinned': bool(row['is_pinned']),
            'is_archived': bool(row['is_archived']),
            'message_count': row['message_count'],
            'last_message': row['last_message'],
            'last_message_time': row['last_message_time'],
            'total_tokens': row['total_tokens'] or 0,
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        }
    finally:
        conn.close()


def delete_assistant_conversation(conversation_id: str, soft_delete: bool = True) -> bool:
    """删除助教对话"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        if soft_delete:
            cursor.execute('''
            UPDATE assistant_conversations 
            SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE conversation_id = ?
            ''', (conversation_id,))
        else:
            cursor.execute('''
            DELETE FROM assistant_conversations 
            WHERE conversation_id = ?
            ''', (conversation_id,))
        
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def update_assistant_conversation_title(conversation_id: str, title: str) -> bool:
    """更新助教对话标题"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        UPDATE assistant_conversations 
        SET title = ?, updated_at = CURRENT_TIMESTAMP
        WHERE conversation_id = ?
        ''', (title, conversation_id))
        
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
