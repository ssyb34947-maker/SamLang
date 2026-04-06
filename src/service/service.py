"""
Service layer for managing chat agent instance
Provides factory pattern for ConversationAgent
"""

from functools import lru_cache
import logging
from src.agent import ConversationAgent
from src.config.config import get_config



def create_chat_agent(user_id: str = "default", conversation_id: str = "default"):
    """
    Create and configure the ConversationAgent
    
    Args:
        user_id: 用户ID（用于隔离）
        conversation_id: 对话ID（用于隔离）
    
    Returns:
        ConversationAgent instance
    """
    try:
        config = get_config()
        # 默认启用 ReACT 模式和详细日志
        agent = ConversationAgent(
            user_id=user_id,
            conversation_id=conversation_id,
            config=config,
            use_react=True,
            verbose=True
        )
        logging.info(f"ConversationAgent 已创建" if agent else "ConversationAgent 创建失败")
        logging.info(f"使用模型: {config.llm.model_name}")
        logging.info(f"API 地址: {config.llm.base_url}")
        logging.info(f"ReACT 模式: {'启用' if agent.use_react else '禁用'}")
        logging.info(f"最大迭代次数: {config.agent.react_max_iterations}")
        logging.info(f"记忆窗口: {config.agent.max_history} 轮\n")

        return agent
    except (ValueError, FileNotFoundError) as e:
        logging.error(f"错误：{e}")
        logging.error("请检查 config.yaml 和 .env 文件配置")
        raise



def reset_chat_agent():
    """
    Reset the global chat agent instance
    Useful for testing or reinitialization
    """
    global _chat_agent
    _chat_agent = None
