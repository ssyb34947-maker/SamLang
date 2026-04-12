"""
消息数据库模型和操作
管理对话中的具体消息内容
"""

import sqlite3
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from src.db.user import DB_PATH


# ==================== 消息表操作 ====================

def create_message(
    conversation_id: str,
    message_id: str,
    role: str,
    content: str,
    metadata: Optional[Dict[str, Any]] = None,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    total_tokens: int = 0
) -> int:
    """
    创建新消息
    
    Args:
        conversation_id: 所属对话ID
        message_id: 消息唯一标识（UUID）
        role: 消息角色 ('user', 'assistant', 'system')
        content: 消息内容
        metadata: 额外元数据（JSON格式）
        prompt_tokens: 输入token数
        completion_tokens: 输出token数
        total_tokens: 总token数
    
    Returns:
        新创建消息的数据库ID
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        metadata_json = json.dumps(metadata) if metadata else None
        
        cursor.execute('''
        INSERT INTO messages 
        (conversation_id, message_id, role, content, prompt_tokens, completion_tokens, total_tokens, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (conversation_id, message_id, role, content, prompt_tokens, completion_tokens, total_tokens, metadata_json))
        
        message_db_id = cursor.lastrowid
        conn.commit()
        return message_db_id
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_message_by_id(message_id: str) -> Optional[Dict[str, Any]]:
    """
    根据消息ID获取消息详情
    
    Args:
        message_id: 消息唯一标识
    
    Returns:
        消息信息字典，不存在则返回None
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT id, conversation_id, message_id, role, content, metadata, created_at
        FROM messages 
        WHERE message_id = ?
        ''', (message_id,))
        
        row = cursor.fetchone()
        if not row:
            return None
            
        return {
            'id': row[0],
            'conversation_id': row[1],
            'message_id': row[2],
            'role': row[3],
            'content': row[4],
            'metadata': json.loads(row[5]) if row[5] else None,
            'created_at': row[6]
        }
        
    finally:
        conn.close()


def get_conversation_messages(
    conversation_id: str,
    limit: int = 100,
    offset: int = 0,
    order: str = 'asc'
) -> List[Dict[str, Any]]:
    """
    获取对话的所有消息
    
    Args:
        conversation_id: 对话ID
        limit: 返回数量限制
        offset: 分页偏移量
        order: 排序方式 ('asc' 正序, 'desc' 倒序)
    
    Returns:
        消息列表
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        order_clause = 'ASC' if order.lower() == 'asc' else 'DESC'
        
        cursor.execute(f'''
        SELECT id, message_id, role, content, prompt_tokens, completion_tokens, total_tokens, metadata, created_at
        FROM messages 
        WHERE conversation_id = ?
        ORDER BY created_at {order_clause}
        LIMIT ? OFFSET ?
        ''', (conversation_id, limit, offset))
        
        rows = cursor.fetchall()
        
        return [
            {
                'id': row[0],
                'message_id': row[1],
                'role': row[2],
                'content': row[3],
                'prompt_tokens': row[4] or 0,
                'completion_tokens': row[5] or 0,
                'total_tokens': row[6] or 0,
                'metadata': json.loads(row[7]) if row[7] else None,
                'created_at': row[8]
            }
            for row in rows
        ]
        
    finally:
        conn.close()


def get_conversation_messages_for_assistant(
    conversation_id: str,
    user_id: int,
    limit: int = 50
) -> List[Dict[str, Any]]:
    """
    获取对话消息（助教专用）
    
    跨表查询逻辑：
    1. 先查询conversations表，验证对话存在且属于当前用户，且是教授Agent的对话（agent_type=1）
    2. 再查询messages表，获取对话的具体消息内容
    
    Args:
        conversation_id: 对话ID
        user_id: 用户ID（用于权限验证）
        limit: 返回最近N条消息
    
    Returns:
        消息列表，每个消息包含role、content、created_at等字段
        如果对话不存在或无权访问，返回空列表
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        # 第一步：查询conversations表，验证对话权限和类型
        cursor.execute('''
        SELECT conversation_id, title, agent_type
        FROM conversations
        WHERE conversation_id = ? 
          AND user_id = ? 
          AND is_deleted = FALSE
          AND agent_type = 1
        ''', (conversation_id, user_id))
        
        conversation = cursor.fetchone()
        
        if not conversation:
            # 对话不存在、无权访问，或不是教授Agent的对话
            return []
        
        # 第二步：查询messages表，获取具体消息内容
        cursor.execute('''
        SELECT message_id, role, content, created_at
        FROM messages 
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        LIMIT ?
        ''', (conversation_id, limit))
        
        rows = cursor.fetchall()
        
        return [
            {
                'message_id': row['message_id'],
                'role': row['role'],
                'content': row['content'],
                'created_at': row['created_at']
            }
            for row in rows
        ]
        
    finally:
        conn.close()


def get_conversation_messages_for_agent(
    conversation_id: str,
    limit: int = 20
) -> List[Dict[str, str]]:
    """
    获取对话消息，格式化为Agent可用的格式
    
    Args:
        conversation_id: 对话ID
        limit: 返回最近N条消息
    
    Returns:
        格式化为 [{"role": "user", "content": "..."}, ...] 的消息列表
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT role, content
        FROM messages 
        WHERE conversation_id = ?
        ORDER BY created_at DESC
        LIMIT ?
        ''', (conversation_id, limit))
        
        rows = cursor.fetchall()
        
        # 反转列表使其按时间正序
        messages = [
            {'role': row[0], 'content': row[1]}
            for row in reversed(rows)
        ]
        
        return messages
        
    finally:
        conn.close()


def update_message(
    message_id: str,
    update_data: Dict[str, Any]
) -> bool:
    """
    更新消息内容
    
    Args:
        message_id: 消息唯一标识
        update_data: 要更新的字段字典
            - content: 消息内容
            - metadata: 元数据
    
    Returns:
        是否更新成功
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        allowed_fields = ['content', 'metadata']
        updates = []
        values = []
        
        for field in allowed_fields:
            if field in update_data:
                if field == 'metadata':
                    values.append(json.dumps(update_data[field]) if update_data[field] else None)
                else:
                    values.append(update_data[field])
                updates.append(f"{field} = ?")
        
        if not updates:
            return False
        
        values.append(message_id)
        
        cursor.execute(
            f"UPDATE messages SET {', '.join(updates)} WHERE message_id = ?",
            values
        )
        
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_message(message_id: str) -> bool:
    """
    删除单条消息
    
    Args:
        message_id: 消息唯一标识
    
    Returns:
        是否删除成功
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM messages WHERE message_id = ?', (message_id,))
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_conversation_messages(conversation_id: str) -> int:
    """
    删除对话的所有消息
    
    Args:
        conversation_id: 对话ID
    
    Returns:
        删除的消息数量
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM messages WHERE conversation_id = ?', (conversation_id,))
        deleted_count = cursor.rowcount
        conn.commit()
        return deleted_count
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# ==================== 批量操作 ====================

def save_message_pair(
    conversation_id: str,
    user_message_id: str,
    user_content: str,
    assistant_message_id: str,
    assistant_content: str,
    user_metadata: Optional[Dict[str, Any]] = None,
    assistant_metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, int]:
    """
    保存用户和AI的一对消息（原子操作）
    
    Args:
        conversation_id: 对话ID
        user_message_id: 用户消息ID
        user_content: 用户消息内容
        assistant_message_id: AI消息ID
        assistant_content: AI消息内容
        user_metadata: 用户消息元数据
        assistant_metadata: AI消息元数据
    
    Returns:
        包含两个消息数据库ID的字典
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 插入用户消息
        user_metadata_json = json.dumps(user_metadata) if user_metadata else None
        cursor.execute('''
        INSERT INTO messages 
        (conversation_id, message_id, role, content, metadata)
        VALUES (?, ?, ?, ?, ?)
        ''', (conversation_id, user_message_id, 'user', user_content, user_metadata_json))
        
        user_db_id = cursor.lastrowid
        
        # 插入AI消息
        assistant_metadata_json = json.dumps(assistant_metadata) if assistant_metadata else None
        cursor.execute('''
        INSERT INTO messages 
        (conversation_id, message_id, role, content, metadata)
        VALUES (?, ?, ?, ?, ?)
        ''', (conversation_id, assistant_message_id, 'assistant', assistant_content, assistant_metadata_json))
        
        assistant_db_id = cursor.lastrowid
        
        conn.commit()
        
        return {
            'user_message_id': user_db_id,
            'assistant_message_id': assistant_db_id
        }
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# ==================== 消息统计 ====================

def get_conversation_message_count(conversation_id: str) -> int:
    """
    获取对话的消息数量
    
    Args:
        conversation_id: 对话ID
    
    Returns:
        消息数量
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'SELECT COUNT(*) FROM messages WHERE conversation_id = ?',
            (conversation_id,)
        )
        return cursor.fetchone()[0]
        
    finally:
        conn.close()


def get_conversation_stats(conversation_id: str) -> Dict[str, Any]:
    """
    获取对话的消息统计信息
    
    Args:
        conversation_id: 对话ID
    
    Returns:
        统计信息字典
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 总消息数
        cursor.execute(
            'SELECT COUNT(*) FROM messages WHERE conversation_id = ?',
            (conversation_id,)
        )
        total_count = cursor.fetchone()[0]
        
        # 用户消息数
        cursor.execute(
            "SELECT COUNT(*) FROM messages WHERE conversation_id = ? AND role = 'user'",
            (conversation_id,)
        )
        user_count = cursor.fetchone()[0]
        
        # AI消息数
        cursor.execute(
            "SELECT COUNT(*) FROM messages WHERE conversation_id = ? AND role = 'assistant'",
            (conversation_id,)
        )
        assistant_count = cursor.fetchone()[0]
        
        # 第一条和最后一条消息时间
        cursor.execute(
            'SELECT MIN(created_at), MAX(created_at) FROM messages WHERE conversation_id = ?',
            (conversation_id,)
        )
        time_range = cursor.fetchone()
        
        return {
            'total_messages': total_count,
            'user_messages': user_count,
            'assistant_messages': assistant_count,
            'first_message_time': time_range[0],
            'last_message_time': time_range[1]
        }
        
    finally:
        conn.close()


def search_messages(
    user_id: int,
    keyword: str,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    搜索用户的消息内容
    
    Args:
        user_id: 用户ID
        keyword: 搜索关键词
        limit: 返回数量限制
    
    Returns:
        匹配的消息列表（包含对话信息）
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT m.id, m.message_id, m.conversation_id, m.role, m.content, 
               m.created_at, c.title as conversation_title
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.conversation_id
        WHERE c.user_id = ? AND c.is_deleted = FALSE AND m.content LIKE ?
        ORDER BY m.created_at DESC
        LIMIT ?
        ''', (user_id, f'%{keyword}%', limit))
        
        rows = cursor.fetchall()
        
        return [
            {
                'id': row[0],
                'message_id': row[1],
                'conversation_id': row[2],
                'role': row[3],
                'content': row[4],
                'created_at': row[5],
                'conversation_title': row[6]
            }
            for row in rows
        ]
        
    finally:
        conn.close()
