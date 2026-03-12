"""
Service layer for managing chat agent instance
Provides singleton pattern for ConversationAgent
"""

from functools import lru_cache
import logging
from math import log
from src.agent import ConversationAgent
from src.config.config import get_config



def create_chat_agent():
    """
    Create and configure the ConversationAgent
    
    Returns:
        ConversationAgent instance
    """
    try:
        config = get_config()
        # 默认启用 ReACT 模式和详细日志
        agent = ConversationAgent(config=config, use_react=True, verbose=True)
        logging.info(f"ConversationAgent 已创建" if agent else "ConversationAgent 创建失败")
        logging.info(f"使用模型: {config.llm.model_name}")
        logging.info(f"API 地址: {config.llm.base_url}")
        logging.info(f"ReACT 模式: {'启用' if agent.use_react else '禁用'}")
        logging.info(f"最大迭代次数: {config.agent.react_max_iterations}\n")

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
