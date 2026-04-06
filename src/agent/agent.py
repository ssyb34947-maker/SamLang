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
    支持用户隔离和对话隔离，每个 (user_id, conversation_id) 组合有独立的记忆
    支持角色权限控制，不同角色可使用不同的工具
    
    输入：
        user_id: 用户ID（必需）
        conversation_id: 对话ID（必需）
        role: 用户角色（professor/assistant/student，默认 student）
        config: 全局配置对象（可选）
        llm_config: LLM 配置对象（可选）
        agent_config: Agent 配置对象（可选）
        use_react: 是否使用 ReACT 模式（默认 True）
        verbose: 是否打印详细日志（默认 False）
    输出：提供对话接口
    """

    def __init__(
        self,
        user_id: str,
        conversation_id: str,
        role: str = "student",
        config: Optional[Config] = None,
        llm_config: Optional[LLMConfig] = None,
        agent_config: Optional[AgentConfig] = None,
        use_react: bool = True,
        verbose: bool = False,
        stream: bool = True
    ):
        self.user_id = user_id
        self.conversation_id = conversation_id
        self.role = role
        
        if config is None:
            from src.config import get_config
            config = get_config()

        self.llm_config = llm_config or config.llm
        self.agent_config = agent_config or config.agent
        self.tool_config = config.tool
        self.use_react = use_react
        self.verbose = verbose
        self.stream = stream

        # 创建独立的 MemoryManager（隔离的记忆）
        self.memory_manager = MemoryManager(max_history=self.agent_config.max_history)
        self.planner = Planner()
        
        # 创建 ToolManager，传入 user_id 和 role 实现工具隔离
        self.tool_manager = ToolManager(user_id=user_id, role=role)
        self.llm_client = LLMClient(config=self.llm_config)

        # 初始化 ReACT Agent
        if self.use_react:
            self.react_agent = ReACTAgentWithFunctionCalling(
                llm_client=self.llm_client,
                tool_manager=self.tool_manager,
                max_iterations=self.agent_config.react_max_iterations,
                verbose=True,
                stream=self.stream
            )

        # 从数据库加载历史消息到记忆
        self._load_history_from_db()
        
        # 设置系统提示词
        self._setup_system_prompt()
        
        logger.info(f"[ConversationAgent] 创建完成: user_id={user_id}, conversation_id={conversation_id}, role={role}")

    def _load_history_from_db(self):
        """
        从数据库加载该对话的历史消息到记忆
        """
        try:
            from src.db.message import get_conversation_messages_for_agent
            
            messages = get_conversation_messages_for_agent(
                self.conversation_id,
                limit=self.agent_config.max_history
            )
            
            for msg in messages:
                self.memory_manager.add_message(msg["role"], msg["content"], persist=False)
                
            if self.verbose:
                logger.info(f"[Agent] 已加载 {len(messages)} 条历史消息到记忆 (conversation_id={self.conversation_id})")
        except Exception as e:
            logger.warning(f"[Agent] 加载历史消息失败: {e}")

    def _setup_system_prompt(self):
        """
        构建并设置系统提示词
        """
        system_prompt = get_system_template()
        
        # 注入用户信息（从数据库获取用户名，或使用默认值）
        try:
            from src.db.tools import get_user_username
            username = get_user_username(int(self.user_id)) or "山姆教授的大弟子"
        except:
            username = "山姆教授的大弟子"
        
        system_prompt = context_with_user(username, system_prompt)
        system_prompt = context_with_current_time(system_prompt)
        
        # 添加 skills 信息
        skill_manager = get_skill_manager()
        skills_info = skill_manager.format_skills_for_prompt(format_type="markdown")
        system_prompt = f"{system_prompt}\n\n{skills_info}"

        self.memory_manager.set_system_message(system_prompt)

    def chat(self, user_input: str, thinking_callback=None, token_callback=None) -> str:
        """
        与用户对话

        输入：user_input - 用户输入文本
             thinking_callback - 思考过程回调函数
             token_callback - token回调函数
        输出：AI 回复文本
        """
        # 重写用户输入
        rewritten_input = rewrite_query(user_input)
        
        # 添加用户消息到记忆
        self.memory_manager.add_message("user", rewritten_input)

        # 获取所有消息（包含滑动窗口后的历史）
        messages = self.memory_manager.get_messages()

        if self.use_react:
            # 使用 ReACT 模式
            system_message = [msg for msg in messages if msg.get("role") == "system"]
            history_messages = [msg for msg in messages if msg.get("role") != "system"]
            context_messages = system_message + history_messages

            logger.debug(f"context_messages: {context_messages}")
        
            user_queries = [msg for msg in context_messages if msg.get("role") == "user"]
            current_user_input = user_queries[-1]["content"] if user_queries else ""
            
            assistant_message = self.react_agent.run(
                user_query=current_user_input,
                thinking_callback=thinking_callback,
                token_callback=token_callback,
                context_messages=context_messages
            )
        else:
            # 直接调用 LLM
            if self.stream and self.verbose:
                print("\n[AI] ", end='', flush=True)
                assistant_message = self.llm_client.chat_stream(messages, print_output=True)
            else:
                assistant_message = self.llm_client.chat(messages)

        # 添加助手消息到记忆
        self.memory_manager.add_message("assistant", assistant_message)

        return assistant_message

    def reset(self) -> None:
        """
        重置对话状态（清空记忆但保留系统消息）
        """
        self.memory_manager.clear()
        self._setup_system_prompt()
        logger.info(f"[Agent] 对话已重置 (user_id={self.user_id}, conversation_id={self.conversation_id})")

    def get_history(self) -> list:
        """
        获取对话历史
        """
        return self.memory_manager.get_history()

    def update_system_prompt(self, new_prompt: str) -> None:
        """
        更新系统提示词
        """
        self.memory_manager.set_system_message(new_prompt)

    def get_available_tools(self) -> list:
        """
        获取当前角色可用的工具
        """
        return self.tool_manager.get_tools()

    def get_available_skills(self) -> list:
        """
        获取所有可用技能
        """
        from src.agent.util.skill_manager import get_skill_manager
        skill_manager = get_skill_manager()
        return skill_manager.scan_skills()

    def toggle_react_mode(self, enable: bool) -> None:
        """
        切换 ReACT 模式
        """
        self.use_react = enable
