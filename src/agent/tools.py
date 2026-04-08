"""
工具管理器模块
负责管理和调用 MCP 工具
支持用户隔离和角色权限控制
"""

from typing import List, Dict, Any, Optional
from src.agent.mcp import get_sync_mcp_client
from loguru import logger


class ToolManager:
    """
    工具管理器

    功能：
    - 管理所有可用工具
    - 提供工具调用接口
    - 将工具转换为 LLM 可用的格式
    - 支持用户隔离（每个 Agent 独立的 MCP Client）
    """

    def __init__(
        self,
        user_id: Optional[str] = None,
        role: str = "student"
    ):
        """
        初始化工具管理器

        输入：
            user_id: 用户ID，用于数据隔离
            role: 用户角色 (professor/assistant/student)
        输出：无
        """
        self.user_id = user_id
        self.role = role
        self.mcp_client = None  # 延迟初始化
        self._tools: Optional[List[Dict[str, Any]]] = None
        
        logger.debug(f"[ToolManager] 创建: user_id={user_id}, role={role}")

    def _ensure_client(self):
        """确保 MCP 客户端已初始化"""
        if self.mcp_client is None:
            # 每个 ToolManager 创建独立的 Client，绑定 user_id 和 role
            self.mcp_client = get_sync_mcp_client(
                user_id=self.user_id,
                role=self.role
            )
            logger.debug(f"[ToolManager] MCP Client 初始化完成: user_id={self.user_id}")

    def get_tools(self) -> List[Dict[str, Any]]:
        """
        获取当前角色可用的工具

        输入：无
        输出：工具列表（已根据角色过滤）
        """
        self._ensure_client()
        if self._tools is None:
            self._tools = self.mcp_client.list_tools()
            logger.info(f"[ToolManager] 从 MCP 获取 {len(self._tools)} 个工具: {[t.get('name', '') for t in self._tools]}")
        return self._tools

    def get_tools_for_llm(self) -> List[Dict[str, Any]]:
        """
        获取 LLM 工具调用格式的工具列表

        输入：无
        输出：符合 OpenAI function calling 格式的工具列表
        """
        tools = self.get_tools()
        llm_tools = []

        for tool in tools:
            llm_tool = {
                "type": "function",
                "function": {
                    "name": tool.get("name", ""),
                    "description": tool.get("description", ""),
                    "parameters": tool.get("inputSchema", {
                        "type": "object",
                        "properties": {},
                        "required": []
                    })
                }
            }
            llm_tools.append(llm_tool)

        return llm_tools

    def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """
        调用指定工具

        输入：
            tool_name: 工具名称
            arguments: 工具参数字典
        输出：
            工具执行结果
        """
        self._ensure_client()
        try:
            # MCPClient 会自动注入 user_id 到 RAG 工具
            result = self.mcp_client.call_tool(tool_name, **arguments)
            return result
        except Exception as e:
            error_msg = f"工具调用失败：{str(e)}"
            logger.error(f"[ToolManager] {error_msg}")
            return error_msg

    def get_tool_by_name(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """
        根据名称获取工具信息

        输入：
            tool_name: 工具名称
        输出：
            工具信息字典，不存在或无权限则返回 None
        """
        tools = self.get_tools()
        for tool in tools:
            if tool.get("name") == tool_name:
                return tool
        return None

    def get_tool_names(self) -> List[str]:
        """
        获取所有工具名称列表

        输入：无
        输出：工具名称列表
        """
        tools = self.get_tools()
        return [tool.get("name", "") for tool in tools]

    def format_tools_description(self) -> str:
        """
        格式化工具描述为文本

        输入：无
        输出：工具描述文本
        """
        tools = self.get_tools()
        if not tools:
            return "当前没有可用工具。"

        descriptions = ["可用工具列表：\n"]
        for i, tool in enumerate(tools, 1):
            name = tool.get("name", "")
            desc = tool.get("description", "无描述")
            schema = tool.get("inputSchema", {})
            properties = schema.get("properties", {})

            descriptions.append(f"{i}. {name}")
            descriptions.append(f"   描述：{desc}")
            if properties:
                descriptions.append(f"   参数：{', '.join(properties.keys())}")
            descriptions.append("")

        return "\n".join(descriptions)
