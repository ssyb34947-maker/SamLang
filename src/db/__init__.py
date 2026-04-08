"""
数据库模块, 用于存储和管理用户数据
目前使用sqlite本地存储方案
"""

from src.db.user import init_db as init_user_tables
from src.db.conversation import init_conversation_tables
from src.db.admin import init_admin_tables
from src.db.user import (
    create_user,
    authenticate_user,
    get_user_by_id,
    update_user_info,
    update_user_profile,
    get_user_profile
)
from src.db.conversation import (
    create_conversation,
    get_conversation_by_id,
    get_user_conversations,
    update_conversation,
    update_conversation_last_message,
    delete_conversation,
    restore_conversation,
    get_user_conversation_stats
)
from src.db.message import (
    create_message,
    get_message_by_id,
    get_conversation_messages,
    get_conversation_messages_for_agent,
    update_message,
    delete_message,
    save_message_pair,
    get_conversation_stats,
    search_messages
)
from src.db.admin import (
    create_admin,
    authenticate_admin,
    get_admin_by_id,
    get_admin_by_uuid,
    list_admins,
    update_admin_status,
    update_admin_password,
    delete_admin
)


def init_db():
    """初始化所有数据库表"""
    init_user_tables()
    init_conversation_tables()
    init_admin_tables()
