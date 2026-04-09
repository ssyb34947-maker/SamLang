"""
Token消耗统计数据库模型和操作
用于监控和统计API token使用情况
"""

import sqlite3
import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime, date
import os

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'samlang.db')


def init_token_stats_tables():
    """初始化Token统计相关数据库表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 创建Token消耗记录表 - 每条对话记录一条
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS token_consumption (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        conversation_id TEXT,
        message_id TEXT,
        prompt_tokens INTEGER DEFAULT 0,
        completion_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        model_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')

    # 创建每日Token统计表 - 按天汇总
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS daily_token_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        stats_date DATE NOT NULL,
        total_prompt_tokens INTEGER DEFAULT 0,
        total_completion_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        chat_count INTEGER DEFAULT 0,
        unique_users INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(stats_date)
    )
    ''')

    # 创建用户每日活跃表 - 记录用户每日活跃情况
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_daily_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_date DATE NOT NULL,
        chat_count INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, activity_date)
    )
    ''')

    # 创建索引优化查询性能
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_token_consumption_user_id 
    ON token_consumption(user_id)
    ''')

    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_token_consumption_created_at 
    ON token_consumption(created_at)
    ''')

    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_daily_token_stats_date 
    ON daily_token_stats(stats_date)
    ''')

    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_user_daily_activity_user_date 
    ON user_daily_activity(user_id, activity_date)
    ''')

    conn.commit()
    conn.close()


def create_token_consumption(
    user_id: int,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    total_tokens: int = 0,
    conversation_id: Optional[str] = None,
    message_id: Optional[str] = None,
    model_name: Optional[str] = None
) -> str:
    """
    创建Token消耗记录

    Args:
        user_id: 用户ID
        prompt_tokens: 输入token数
        completion_tokens: 输出token数
        total_tokens: 总token数
        conversation_id: 对话ID
        message_id: 消息ID
        model_name: 模型名称

    Returns:
        记录的UUID
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        record_uuid = str(uuid.uuid4())

        # 如果没有提供total_tokens，自动计算
        if total_tokens == 0 and (prompt_tokens > 0 or completion_tokens > 0):
            total_tokens = prompt_tokens + completion_tokens

        cursor.execute('''
        INSERT INTO token_consumption 
        (uuid, user_id, conversation_id, message_id, prompt_tokens, 
         completion_tokens, total_tokens, model_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            record_uuid, user_id, conversation_id, message_id,
            prompt_tokens, completion_tokens, total_tokens, model_name
        ))

        conn.commit()

        # 更新每日统计
        _update_daily_stats(conn, cursor, prompt_tokens, completion_tokens, total_tokens)

        # 更新用户每日活跃记录
        _update_user_daily_activity(conn, cursor, user_id, total_tokens)

        return record_uuid

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def _update_daily_stats(conn, cursor, prompt_tokens: int, completion_tokens: int, total_tokens: int):
    """更新每日Token统计（内部方法）"""
    today = date.today().isoformat()
    stats_uuid = str(uuid.uuid4())

    cursor.execute('''
    INSERT INTO daily_token_stats 
    (uuid, stats_date, total_prompt_tokens, total_completion_tokens, total_tokens, chat_count)
    VALUES (?, ?, ?, ?, ?, 1)
    ON CONFLICT(stats_date) DO UPDATE SET
        total_prompt_tokens = total_prompt_tokens + ?,
        total_completion_tokens = total_completion_tokens + ?,
        total_tokens = total_tokens + ?,
        chat_count = chat_count + 1,
        updated_at = CURRENT_TIMESTAMP
    ''', (
        stats_uuid, today, prompt_tokens, completion_tokens, total_tokens,
        prompt_tokens, completion_tokens, total_tokens
    ))

    conn.commit()


def _update_user_daily_activity(conn, cursor, user_id: int, tokens: int):
    """更新用户每日活跃记录（内部方法）"""
    today = date.today().isoformat()

    cursor.execute('''
    INSERT INTO user_daily_activity 
    (user_id, activity_date, chat_count, total_tokens, is_active)
    VALUES (?, ?, 1, ?, TRUE)
    ON CONFLICT(user_id, activity_date) DO UPDATE SET
        chat_count = chat_count + 1,
        total_tokens = total_tokens + ?,
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP
    ''', (user_id, today, tokens, tokens))

    conn.commit()


def get_token_consumption_by_uuid(record_uuid: str) -> Optional[Dict[str, Any]]:
    """根据UUID获取Token消耗记录"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('''
        SELECT uuid, user_id, conversation_id, message_id, prompt_tokens,
               completion_tokens, total_tokens, model_name, created_at
        FROM token_consumption
        WHERE uuid = ?
        ''', (record_uuid,))

        row = cursor.fetchone()
        if row:
            return {
                'uuid': row[0],
                'user_id': row[1],
                'conversation_id': row[2],
                'message_id': row[3],
                'prompt_tokens': row[4],
                'completion_tokens': row[5],
                'total_tokens': row[6],
                'model_name': row[7],
                'created_at': row[8]
            }
        return None

    finally:
        conn.close()


def get_user_token_stats(user_id: int, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
    """
    获取用户Token统计

    Args:
        user_id: 用户ID
        start_date: 开始日期 (YYYY-MM-DD)
        end_date: 结束日期 (YYYY-MM-DD)

    Returns:
        统计信息字典
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        query = '''
        SELECT 
            COALESCE(SUM(prompt_tokens), 0) as total_prompt_tokens,
            COALESCE(SUM(completion_tokens), 0) as total_completion_tokens,
            COALESCE(SUM(total_tokens), 0) as total_tokens,
            COUNT(*) as total_chats
        FROM token_consumption
        WHERE user_id = ?
        '''
        params = [user_id]

        if start_date:
            query += ' AND DATE(created_at) >= ?'
            params.append(start_date)
        if end_date:
            query += ' AND DATE(created_at) <= ?'
            params.append(end_date)

        cursor.execute(query, params)
        row = cursor.fetchone()

        return {
            'user_id': user_id,
            'total_prompt_tokens': row[0],
            'total_completion_tokens': row[1],
            'total_tokens': row[2],
            'total_chats': row[3],
            'start_date': start_date,
            'end_date': end_date
        }

    finally:
        conn.close()


def get_daily_token_stats(stats_date: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    获取每日Token统计

    Args:
        stats_date: 日期 (YYYY-MM-DD)，为空则返回今天

    Returns:
        统计信息字典
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        if stats_date is None:
            stats_date = date.today().isoformat()

        cursor.execute('''
        SELECT uuid, stats_date, total_prompt_tokens, total_completion_tokens,
               total_tokens, chat_count, unique_users, created_at, updated_at
        FROM daily_token_stats
        WHERE stats_date = ?
        ''', (stats_date,))

        row = cursor.fetchone()
        if row:
            return {
                'uuid': row[0],
                'stats_date': row[1],
                'total_prompt_tokens': row[2],
                'total_completion_tokens': row[3],
                'total_tokens': row[4],
                'chat_count': row[5],
                'unique_users': row[6],
                'created_at': row[7],
                'updated_at': row[8]
            }
        return None

    finally:
        conn.close()


def get_token_stats_range(start_date: str, end_date: str) -> List[Dict[str, Any]]:
    """
    获取日期范围内的Token统计

    Args:
        start_date: 开始日期 (YYYY-MM-DD)
        end_date: 结束日期 (YYYY-MM-DD)

    Returns:
        每日统计列表
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('''
        SELECT stats_date, total_prompt_tokens, total_completion_tokens,
               total_tokens, chat_count, unique_users
        FROM daily_token_stats
        WHERE stats_date >= ? AND stats_date <= ?
        ORDER BY stats_date DESC
        ''', (start_date, end_date))

        rows = cursor.fetchall()
        return [
            {
                'stats_date': row[0],
                'total_prompt_tokens': row[1],
                'total_completion_tokens': row[2],
                'total_tokens': row[3],
                'chat_count': row[4],
                'unique_users': row[5]
            }
            for row in rows
        ]

    finally:
        conn.close()


def update_token_consumption(record_uuid: str, update_data: Dict[str, Any]) -> bool:
    """
    更新Token消耗记录

    Args:
        record_uuid: 记录UUID
        update_data: 要更新的字段字典

    Returns:
        是否更新成功
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        allowed_fields = ['prompt_tokens', 'completion_tokens', 'total_tokens', 'model_name']
        updates = []
        values = []

        for field in allowed_fields:
            if field in update_data:
                updates.append(f"{field} = ?")
                values.append(update_data[field])

        if not updates:
            return False

        values.append(record_uuid)

        cursor.execute(
            f"UPDATE token_consumption SET {', '.join(updates)} WHERE uuid = ?",
            values
        )

        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_token_consumption(record_uuid: str) -> bool:
    """
    删除Token消耗记录

    Args:
        record_uuid: 记录UUID

    Returns:
        是否删除成功
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('DELETE FROM token_consumption WHERE uuid = ?', (record_uuid,))
        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_daily_stats(stats_date: str) -> bool:
    """
    删除每日统计记录

    Args:
        stats_date: 日期 (YYYY-MM-DD)

    Returns:
        是否删除成功
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('DELETE FROM daily_token_stats WHERE stats_date = ?', (stats_date,))
        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def is_user_active_today(user_id: int) -> bool:
    """
    检查用户今天是否活跃

    Args:
        user_id: 用户ID

    Returns:
        今天是否活跃
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        today = date.today().isoformat()

        cursor.execute('''
        SELECT is_active FROM user_daily_activity
        WHERE user_id = ? AND activity_date = ?
        ''', (user_id, today))

        row = cursor.fetchone()
        return row is not None and row[0]

    finally:
        conn.close()


def get_user_activity_history(user_id: int, days: int = 30) -> List[Dict[str, Any]]:
    """
    获取用户近期活跃历史

    Args:
        user_id: 用户ID
        days: 查询天数

    Returns:
        活跃记录列表
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('''
        SELECT activity_date, chat_count, total_tokens, is_active
        FROM user_daily_activity
        WHERE user_id = ? AND activity_date >= date('now', '-{} days')
        ORDER BY activity_date DESC
        '''.format(days), (user_id,))

        rows = cursor.fetchall()
        return [
            {
                'activity_date': row[0],
                'chat_count': row[1],
                'total_tokens': row[2],
                'is_active': row[3]
            }
            for row in rows
        ]

    finally:
        conn.close()


def get_all_users_daily_activity(activity_date: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    获取所有用户某日的活跃情况

    Args:
        activity_date: 日期 (YYYY-MM-DD)，为空则返回今天

    Returns:
        用户活跃列表
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        if activity_date is None:
            activity_date = date.today().isoformat()

        cursor.execute('''
        SELECT u.id, u.username, uda.chat_count, uda.total_tokens, uda.is_active
        FROM users u
        LEFT JOIN user_daily_activity uda ON u.id = uda.user_id AND uda.activity_date = ?
        WHERE uda.id IS NOT NULL
        ORDER BY uda.chat_count DESC
        ''', (activity_date,))

        rows = cursor.fetchall()
        return [
            {
                'user_id': row[0],
                'username': row[1],
                'chat_count': row[2] or 0,
                'total_tokens': row[3] or 0,
                'is_active': row[4] or False
            }
            for row in rows
        ]

    finally:
        conn.close()
