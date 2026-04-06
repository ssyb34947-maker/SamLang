"""
Agent 工厂模块
管理 ConversationAgent 实例的创建和复用
实现用户隔离和对话隔离
"""

from typing import Dict, Optional
from loguru import logger

from src.agent import ConversationAgent
from src.config import Config, get_config


class SimpleAgentFactory:
    """
    简单的 Agent 工厂
    
    功能：
    - 管理多个 ConversationAgent 实例
    - 每个 (user_id, conversation_id, role) 组合有独立的 Agent
    - 支持实例复用（同一个对话的多次请求使用同一个 Agent）
    - 支持角色权限控制（professor/assistant/student）
    
    使用场景：
    - 单服务器部署
    - 中等并发量
    - 需要保持对话状态连续性
    - 不同角色使用不同工具权限
    """
    
    def __init__(self, config: Optional[Config] = None):
        """
        初始化工厂
        
        Args:
            config: 全局配置，如果不提供则自动加载
        """
        self.config = config or get_config()
        # Agent 实例池：key = "user_id:conversation_id:role"
        self._agents: Dict[str, ConversationAgent] = {}
        
        logger.info(f"[AgentFactory] 工厂初始化完成")
    
    def get_agent(
        self, 
        user_id: str, 
        conversation_id: str,
        role: str = "student",
        use_react: bool = True,
        verbose: bool = False,
        stream: bool = True
    ) -> ConversationAgent:
        """
        获取 Agent 实例
        
        如果该 (user_id, conversation_id, role) 组合已有 Agent，则复用
        否则创建新的 Agent
        
        Args:
            user_id: 用户ID
            conversation_id: 对话ID
            role: 用户角色 (professor/assistant/student)
            use_react: 是否使用 ReACT 模式
            verbose: 是否打印详细日志
            stream: 是否使用流式输出
            
        Returns:
            ConversationAgent 实例
        """
        key = f"{user_id}:{conversation_id}:{role}"
        
        # 检查是否已有缓存的 Agent
        if key in self._agents:
            logger.debug(f"[AgentFactory] 复用现有 Agent: {key}")
            return self._agents[key]
        
        # 创建新的 Agent
        logger.info(f"[AgentFactory] 创建新 Agent: {key}")
        agent = ConversationAgent(
            user_id=user_id,
            conversation_id=conversation_id,
            role=role,
            config=self.config,
            use_react=use_react,
            verbose=verbose,
            stream=stream
        )
        
        # 存入缓存
        self._agents[key] = agent
        
        return agent
    
    def remove_agent(self, user_id: str, conversation_id: str, role: str = None) -> bool:
        """
        移除指定的 Agent 实例
        
        Args:
            user_id: 用户ID
            conversation_id: 对话ID
            role: 用户角色，如果不指定则移除该对话的所有角色
            
        Returns:
            是否成功移除
        """
        if role:
            key = f"{user_id}:{conversation_id}:{role}"
            if key in self._agents:
                del self._agents[key]
                logger.info(f"[AgentFactory] 已移除 Agent: {key}")
                return True
        else:
            # 移除该对话的所有角色
            keys_to_remove = [
                key for key in self._agents.keys()
                if key.startswith(f"{user_id}:{conversation_id}:")
            ]
            for key in keys_to_remove:
                del self._agents[key]
            if keys_to_remove:
                logger.info(f"[AgentFactory] 已移除 {len(keys_to_remove)} 个 Agent")
                return True
        
        return False
    
    def remove_user_agents(self, user_id: str) -> int:
        """
        移除指定用户的所有 Agent 实例
        
        Args:
            user_id: 用户ID
            
        Returns:
            移除的 Agent 数量
        """
        keys_to_remove = [
            key for key in self._agents.keys()
            if key.startswith(f"{user_id}:")
        ]
        
        for key in keys_to_remove:
            del self._agents[key]
        
        logger.info(f"[AgentFactory] 已移除用户 {user_id} 的 {len(keys_to_remove)} 个 Agent")
        return len(keys_to_remove)
    
    def clear_all(self) -> int:
        """
        清空所有 Agent 实例
        
        Returns:
            移除的 Agent 数量
        """
        count = len(self._agents)
        self._agents.clear()
        logger.info(f"[AgentFactory] 已清空所有 {count} 个 Agent")
        return count
    
    def get_stats(self) -> Dict:
        """
        获取工厂统计信息
        
        Returns:
            统计信息字典
        """
        roles = {}
        for key in self._agents.keys():
            role = key.split(":")[-1]
            roles[role] = roles.get(role, 0) + 1
        
        return {
            "total_agents": len(self._agents),
            "user_count": len(set(key.split(":")[0] for key in self._agents.keys())),
            "conversation_count": len(set(f"{key.split(':')[0]}:{key.split(':')[1]}" for key in self._agents.keys())),
            "role_distribution": roles
        }
    
    def get_user_agents(self, user_id: str) -> Dict[str, ConversationAgent]:
        """
        获取指定用户的所有 Agent 实例
        
        Args:
            user_id: 用户ID
            
        Returns:
            Agent 字典，key 为 conversation_id:role
        """
        return {
            key.split(":", 1)[1]: agent 
            for key, agent in self._agents.items()
            if key.startswith(f"{user_id}:")
        }
    
    def __len__(self) -> int:
        """返回当前管理的 Agent 数量"""
        return len(self._agents)
    
    def __contains__(self, key: str) -> bool:
        """检查是否包含指定的 key"""
        return key in self._agents


# 全局工厂实例（单例）
_global_factory: Optional[SimpleAgentFactory] = None


def get_agent_factory(config: Optional[Config] = None) -> SimpleAgentFactory:
    """
    获取全局 Agent 工厂实例（单例模式）
    
    Args:
        config: 全局配置
        
    Returns:
        SimpleAgentFactory 实例
    """
    global _global_factory
    if _global_factory is None:
        _global_factory = SimpleAgentFactory(config)
    return _global_factory


def reset_agent_factory() -> None:
    """
    重置全局工厂（用于测试或重新初始化）
    """
    global _global_factory
    if _global_factory is not None:
        _global_factory.clear_all()
        _global_factory = None
    logger.info("[AgentFactory] 全局工厂已重置")


# 便捷函数：创建教授 Agent
def create_professor_agent(
    user_id: str,
    conversation_id: str,
    **kwargs
) -> ConversationAgent:
    """
    创建教授角色的 Agent
    
    教授 Agent 权限：
    - 可以使用 rag_search 检索知识
    - 可以使用 rag_context 生成上下文
    - 不能使用 rag_delete 和 rag_add_document
    """
    factory = get_agent_factory()
    return factory.get_agent(
        user_id=user_id,
        conversation_id=conversation_id,
        role="professor",
        **kwargs
    )


# 便捷函数：创建助教 Agent
def create_assistant_agent(
    user_id: str,
    conversation_id: str,
    **kwargs
) -> ConversationAgent:
    """
    创建助教角色的 Agent
    
    助教 Agent 权限：
    - 可以使用 rag_search 检索知识
    - 可以使用 rag_context 生成上下文
    - 可以使用 rag_delete 删除知识
    - 可以使用 rag_add_document 添加知识
    - 可以使用 rag_list 列出知识
    """
    factory = get_agent_factory()
    return factory.get_agent(
        user_id=user_id,
        conversation_id=conversation_id,
        role="assistant",
        **kwargs
    )


# 便捷函数：创建学生 Agent
def create_student_agent(
    user_id: str,
    conversation_id: str,
    **kwargs
) -> ConversationAgent:
    """
    创建学生角色的 Agent
    
    学生 Agent 权限：
    - 不能使用 RAG 工具
    - 只能使用基础工具（如 websearch、dictionary 等）
    """
    factory = get_agent_factory()
    return factory.get_agent(
        user_id=user_id,
        conversation_id=conversation_id,
        role="student",
        **kwargs
    )
