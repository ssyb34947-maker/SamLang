"""
MCP Client 模块
用于连接和调用 MCP Server 的工具
"""

import asyncio
from typing import Any, Dict, List, Optional
from fastmcp import Client
from src.agent.mcp import main_mcp
from loguru import logger   


class MCPClient:
    """
    MCP Client 客户端类

    功能：
    - 连接到 MCP Server
    - 列出所有可用工具
    - 调用指定工具并返回结果
    """

    def __init__(self, mcp_server=None):
        """
        初始化 MCP Client

        输入：
            mcp_server: FastMCP 服务器实例，默认使用 main_mcp
        输出：无
        """
        self.mcp_server = mcp_server or main_mcp
        self.client = Client(self.mcp_server)
        self._tools_cache: Optional[List[Dict]] = None

    async def connect(self):
        """
        连接到 MCP Server

        输入：无
        输出：bool，是否连接成功
        """
        try:
            await self.client.ping()
            logger.info("成功连接到 MCP Server")
            return True
        except Exception as e:
            print(f"连接 MCP Server 失败：{e}")
            return False

    async def list_tools(self, use_cache: bool = True) -> List[Dict[str, Any]]:
        """
        列出所有可用的工具

        输入：
            use_cache: 是否使用缓存的工具列表
        输出：
            工具列表，每个工具包含 name, description 等信息
        """
        if use_cache and self._tools_cache is not None:
            return self._tools_cache

        try:
            tools = await self.client.list_tools()
            # 将 Pydantic 对象转换为字典
            tools_dict = []
            for tool in tools:
                if hasattr(tool, 'model_dump'):
                    tools_dict.append(tool.model_dump())
                elif hasattr(tool, 'dict'):
                    tools_dict.append(tool.dict())
                else:
                    tools_dict.append({
                        'name': tool.name,
                        'description': getattr(tool, 'description', ''),
                        'inputSchema': getattr(tool, 'inputSchema', {})
                    })
            self._tools_cache = tools_dict
            return tools_dict
        except Exception as e:
            print(f"获取工具列表失败：{e}")
            return []

    async def call_tool(self, tool_name: str, **kwargs) -> str:
        """
        调用指定的工具

        输入：
            tool_name: 工具名称
            **kwargs: 工具所需的参数
        输出：
            工具执行的结果（字符串形式）
        """
        try:
            result = await self.client.call_tool(tool_name, kwargs)

            # 处理返回结果
            if isinstance(result, list) and len(result) > 0:
                # fastmcp 返回的是 list of content blocks
                content = result[0]
                if hasattr(content, 'text'):
                    return content.text
                elif isinstance(content, dict) and 'text' in content:
                    return content['text']
                else:
                    return str(content)
            else:
                return str(result)

        except Exception as e:
            error_msg = f"调用工具 {tool_name} 失败：{e}"
            print(error_msg)
            return error_msg

    async def get_tool_info(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """
        获取指定工具的详细信息

        输入：
            tool_name: 工具名称
        输出：
            工具信息字典，如果工具不存在则返回 None
        """
        tools = await self.list_tools()
        for tool in tools:
            if tool.get('name') == tool_name:
                return tool
        return None

    async def __aenter__(self):
        """异步上下文管理器入口"""
        await self.client.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器退出"""
        return await self.client.__aexit__(exc_type, exc_val, exc_tb)


def get_mcp_client(mcp_server=None) -> MCPClient:
    """
    工厂函数：创建 MCP Client 实例

    输入：
        mcp_server: FastMCP 服务器实例，默认使用 main_mcp
    输出：
        MCPClient 实例
    """
    return MCPClient(mcp_server)


# 示例用法
async def demo():
    """
    演示 MCP Client 的基本用法

    输入：无
    输出：无
    """
    from src.agent.mcp import setup

    # 首先初始化服务器（挂载所有工具）
    await setup()

    # 创建客户端
    async with get_mcp_client() as client:
        # 连接测试
        connected = await client.connect()
        print(f"连接状态：{'成功' if connected else '失败'}\n")

        # 列出所有工具
        tools = await client.list_tools()
        print("可用工具列表：")
        for tool in tools:
            print(f"  - {tool.get('name')}: {tool.get('description', '无描述')}")
        print()

        # 调用 websearch 工具
        print("测试 websearch 工具：")
        result = await client.call_tool(
            "websearch_websearch",
            query="Python 最新版本",
            max_results=3
        )
        print(f"搜索结果：\n{result}\n")

        # 调用 youdao 词典工具
        print("测试 youdaodictionary 工具：")
        result = await client.call_tool(
            "youdao_youdaodictionary",
            word="hello"
        )
        print(f"词典查询结果：\n{result}\n")


if __name__ == "__main__":
    asyncio.run(demo())