"""
Agent 配置数据类
"""

from dataclasses import dataclass


@dataclass
class AgentConfig:
    """
    Agent 配置

    功能：存储 Agent 相关配置
    输入：配置参数
    输出：配置数据类实例
    """
    memory_type: str = "buffer"
    max_history: int = 10
    react_max_iterations: int = 5