"""
MCP Client 同步版本
提供同步接口，方便在非异步环境中使用
"""

import asyncio
from typing import Any, Dict, List, Optional
from functools import wraps
from src.agent.mcp.client import MCPClient, get_mcp_client
from src.agent.mcp import setup


def run_async(coro):
    """
    在同步环境中运行异步函数

    输入：
        coro: 协程对象
    输出：
        协程的返回值
    """
    import inspect
    if inspect.iscoroutine(coro):
        try:
            # 检查是否已经有运行中的事件循环
            loop = asyncio.get_event_loop()
            # 如果事件循环正在运行，在新线程中创建新的事件循环
            if loop.is_running():
                import threading
                import concurrent.futures

                def run_in_new_loop():
                    """在新线程中创建并运行事件循环"""
                    new_loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(new_loop)
                    try:
                        return new_loop.run_until_complete(coro)
                    finally:
                        new_loop.close()

                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(run_in_new_loop)
                    return future.result()
            else:
                # 事件循环存在但未运行，直接运行
                return loop.run_until_complete(coro)
        except RuntimeError:
            # 没有事件循环，创建新的
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(coro)
            finally:
                loop.close()
    return coro


class SyncMCPClient:
    """
    MCP Client 同步版本

    功能：
    - 提供同步接口封装异步的 MCPClient
    - 自动处理事件循环
    - 方便在普通函数中调用 MCP 工具
    """

    def __init__(self, mcp_server=None):
        """
        初始化同步 MCP Client

        输入：
            mcp_server: FastMCP 服务器实例，默认使用 main_mcp
        输出：无
        """
        self._async_client: Optional[MCPClient] = None
        self._mcp_server = mcp_server
        self._initialized = False

    def _ensure_initialized(self):
        """确保客户端已初始化"""
        if not self._initialized:
            # 初始化服务器
            run_async(setup())
            self._async_client = get_mcp_client(self._mcp_server)
            self._initialized = True

    def connect(self) -> bool:
        """
        连接到 MCP Server

        输入：无
        输出：
            bool，是否连接成功
        """
        self._ensure_initialized()

        async def _connect():
            async with self._async_client as client:
                return await client.connect()

        return run_async(_connect())

    def list_tools(self, use_cache: bool = True) -> List[Dict[str, Any]]:
        """
        列出所有可用的工具

        输入：
            use_cache: 是否使用缓存的工具列表
        输出：
            工具列表
        """
        self._ensure_initialized()

        async def _list_tools():
            async with self._async_client as client:
                return await client.list_tools(use_cache)

        return run_async(_list_tools())

    def call_tool(self, tool_name: str, **kwargs) -> str:
        """
        调用指定的工具

        输入：
            tool_name: 工具名称
            **kwargs: 工具所需的参数
        输出：
            工具执行的结果
        """
        self._ensure_initialized()

        async def _call_tool():
            async with self._async_client as client:
                return await client.call_tool(tool_name, **kwargs)

        return run_async(_call_tool())

    def get_tool_info(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """
        获取指定工具的详细信息

        输入：
            tool_name: 工具名称
        输出：
            工具信息字典
        """
        self._ensure_initialized()

        async def _get_tool_info():
            async with self._async_client as client:
                return await client.get_tool_info(tool_name)

        return run_async(_get_tool_info())


# 全局单例
_global_sync_client: Optional[SyncMCPClient] = None


def get_sync_mcp_client(mcp_server=None) -> SyncMCPClient:
    """
    获取同步 MCP Client 单例

    输入：
        mcp_server: FastMCP 服务器实例
    输出：
        SyncMCPClient 实例
    """
    global _global_sync_client
    if _global_sync_client is None:
        _global_sync_client = SyncMCPClient(mcp_server)
    return _global_sync_client


# 示例用法
def demo():
    """
    演示同步 MCP Client 的基本用法

    输入：无
    输出：无
    """
    # 创建客户端
    client = get_sync_mcp_client()

    # 连接测试
    connected = client.connect()
    print(f"连接状态：{'成功' if connected else '失败'}\n")

    # 列出所有工具
    tools = client.list_tools()
    print("可用工具列表：")
    for tool in tools:
        print(f"  - {tool.get('name')}: {tool.get('description', '无描述')}")
    print()

    # 调用 websearch 工具
    print("测试 websearch 工具：")
    result = client.call_tool(
        "websearch_websearch",
        query="Python 最新版本",
        max_results=3
    )
    print(f"搜索结果：\n{result}\n")

    # 调用 youdao 词典工具
    print("测试 youdaodictionary 工具：")
    result = client.call_tool(
        "youdao_youdaodictionary",
        word="hello"
    )
    print(f"词典查询结果：\n{result}\n")


if __name__ == "__main__":
    demo()
