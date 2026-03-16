"""
对话代理核心模块
整合记忆、规划和工具，提供完整的对话能力
使用React架构模式，包含以下组件：
- MemoryManager：管理对话历史
- ToolManager：执行外部操作
- ReACTAgent：支持工具调用的推理-行动循环
"""

from typing import Optional

from loguru import logger

from .memory import MemoryManager
from .planner import Planner
from .tools import ToolManager
from .llm.llmclient import LLMClient
from src.agent.prompt.get_prompt import get_system_template, context_with_current_time, context_with_user
from src.agent.util.skill_manager import get_skill_manager
from src.agent.query import rewrite_query
from .core.react import ReACTAgentWithFunctionCalling
from src.config import Config, LLMConfig, AgentConfig


class ConversationAgent:
    """
    对话代理

    功能：提供完整的对话能力，整合记忆、规划和工具
    输入：
        config: 全局配置对象（可选，如果不提供则使用默认配置）
        llm_config: LLM 配置对象（可选，覆盖全局配置）
        agent_config: Agent 配置对象（可选，覆盖全局配置）
        use_react: 是否使用 ReACT 模式（默认 True）
        verbose: 是否打印详细日志（默认 False）
    输出：提供对话接口
    """

    def __init__(
        self,
        config: Optional[Config] = None,
        llm_config: Optional[LLMConfig] = None,
        agent_config: Optional[AgentConfig] = None,
        use_react: bool = True,
        verbose: bool = False,
        stream: bool = True
    ):
        if config is None:
            from src.config import get_config
            config = get_config()

        self.llm_config = llm_config or config.llm
        self.agent_config = agent_config or config.agent
        self.tool_config = config.tool
        self.use_react = use_react
        self.verbose = verbose
        self.stream = stream

        self.memory_manager = MemoryManager(max_history=self.agent_config.max_history)
        self.planner = Planner()
        self.tool_manager = ToolManager()
        self.llm_client = LLMClient(config=self.llm_config)

        # 初始化 ReACT Agent
        if self.use_react:
            self.react_agent = ReACTAgentWithFunctionCalling(
                llm_client=self.llm_client,
                tool_manager=self.tool_manager,
                max_iterations=self.agent_config.react_max_iterations,
                verbose=self.verbose,
                stream=self.stream
            )

        # 添加 skills 信息到 system prompt
        system_prompt = get_system_template()
        # 注入用户信息（默认为山姆教授的大弟子）和时间信息
        system_prompt = context_with_user("山姆教授的大弟子", system_prompt)
        system_prompt = context_with_current_time(system_prompt)
        skill_manager = get_skill_manager()
        skills_info = skill_manager.format_skills_for_prompt(format_type="markdown")
        system_prompt = f"{system_prompt}\n\n{skills_info}"

        self.memory_manager.set_system_message(system_prompt)

    def chat(self, user_input: str, user_name: str = "山姆教授的大弟子") -> str:
        """
        与用户对话

        输入：user_input - 用户输入文本
        输出：AI 回复文本
        """
        # 更新系统提示词中的用户信息
        system_prompt = get_system_template()
        system_prompt = context_with_user(user_name, system_prompt)
        system_prompt = context_with_current_time(system_prompt)
        # 添加 skills 信息
        skill_manager = get_skill_manager()
        skills_info = skill_manager.format_skills_for_prompt(format_type="markdown")
        system_prompt = f"{system_prompt}\n\n{skills_info}"
        # 更新系统消息
        self.memory_manager.set_system_message(system_prompt)
        
        # 重写用户输入
        rewritten_input = rewrite_query(user_input)
        # 添加用户消息到历史
        self.memory_manager.add_message("user", rewritten_input)

        # 获取所有消息
        messages = self.memory_manager.get_messages()

        if self.use_react:
            # 使用 ReACT 模式
            # 分离系统消息和历史消息
            system_message = [msg for msg in messages if msg.get("role") == "system"]
            # 包含助手消息和用户消息作为历史，排除系统消息
            history_messages = [msg for msg in messages if msg.get("role") != "system"]

            # 构建上下文消息
            context_messages = system_message + history_messages

            # 运行 ReACT
            logger.debug(f"context_messages: {context_messages}")
        
            # 从上下文中获取最后一条用户消息作为查询
            user_queries = [msg for msg in context_messages if msg.get("role") == "user"]
            current_user_input = user_queries[-1]["content"] if user_queries else ""
            
            assistant_message = self.react_agent.run(
                user_query=current_user_input,
                context_messages=context_messages
            )
        else:
            # 直接调用 LLM（不使用工具）
            if self.stream and self.verbose:
                print("\n[AI] ", end='', flush=True)
                assistant_message = self.llm_client.chat_stream(messages, print_output=True)
            else:
                assistant_message = self.llm_client.chat(messages)

        # 添加助手消息到历史
        self.memory_manager.add_message("assistant", assistant_message)

        return assistant_message

    def reset(self, user_name: str = "学生") -> None:
        """
        重置对话状态

        输入：无
        输出：无
        """
        self.memory_manager.clear()

        system_prompt = get_system_template()
        system_prompt = context_with_user(user_name, system_prompt)
        system_prompt = context_with_current_time(system_prompt)

        # 添加 skills 信息
        skill_manager = get_skill_manager()
        skills_info = skill_manager.format_skills_for_prompt(format_type="markdown")
        system_prompt = f"{system_prompt}\n\n{skills_info}"

        self.memory_manager.set_system_message(system_prompt)

    def get_history(self) -> list:
        """
        获取对话历史

        输入：无
        输出：对话历史列表
        """
        return self.memory_manager.get_history()

    def update_system_prompt(self, new_prompt: str) -> None:
        """
        更新系统提示词

        输入：new_prompt - 新的系统提示词
        输出：无
        """
        self.memory_manager.set_system_message(new_prompt)

    def get_available_tools(self) -> list:
        """
        获取所有可用工具

        输入：无
        输出：工具列表
        """
        return self.tool_manager.get_tools()

    def get_available_skills(self) -> list:
        """
        获取所有可用技能

        输入：无
        输出：技能列表
        """
        from src.agent.util.skill_manager import get_skill_manager
        skill_manager = get_skill_manager()
        return skill_manager.scan_skills()

    def toggle_react_mode(self, enable: bool) -> None:
        """
        切换 ReACT 模式

        输入：enable - 是否启用 ReACT 模式
        输出：无
        """
        self.use_react = enable

