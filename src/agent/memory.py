"""
记忆管理模块
负责管理对话历史和上下文记忆
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class Message:
    """
    消息数据类

    功能：存储单条消息
    输入：角色和内容
    输出：消息对象
    """
    role: str  # "system", "user", "assistant"
    content: str


class MemoryManager:
    """
    记忆管理器

    功能：管理对话历史，提供上下文记忆能力
    输入：最大历史记录数（可选）
    输出：提供记忆存储和检索接口
    """

    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.messages: List[Message] = []

    def add_message(self, role: str, content: str) -> None:
        """
        添加消息

        输入：
            role: 角色（system/user/assistant）
            content: 消息内容
        输出：无
        """
        self.messages.append(Message(role=role, content=content))

        # 保留系统消息，只限制用户和助手的对话历史
        system_messages = [m for m in self.messages if m.role == "system"]
        conversation_messages = [m for m in self.messages if m.role != "system"]

        if len(conversation_messages) > self.max_history * 2:
            conversation_messages = conversation_messages[-(self.max_history * 2):]

        self.messages = system_messages + conversation_messages

    def get_messages(self) -> List[Dict[str, str]]:
        """
        获取所有消息（OpenAI 格式）

        输入：无
        输出：消息列表
        """
        return [{"role": m.role, "content": m.content} for m in self.messages]

    def get_history(self) -> List[Message]:
        """
        获取对话历史

        输入：无
        输出：消息对象列表
        """
        return self.messages.copy()

    def clear(self) -> None:
        """
        清空记忆（保留系统消息）

        输入：无
        输出：无
        """
        system_messages = [m for m in self.messages if m.role == "system"]
        self.messages = system_messages

    def set_system_message(self, content: str) -> None:
        """
        设置系统消息

        输入：content - 系统消息内容
        输出：无
        """
        # 移除旧的系统消息
        self.messages = [m for m in self.messages if m.role != "system"]
        # 添加新的系统消息到开头
        self.messages.insert(0, Message(role="system", content=content))

