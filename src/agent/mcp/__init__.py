"""
MCP模块初始化文件
统一挂载所有MCP服务器

Usage:
    from src.agent.mcp import mcp
    to import mcp server instance (singleton).
"""

from __future__ import annotations

from functools import lru_cache

from fastmcp import FastMCP

from .tools.websearch import websearch_mcp
from .tools.youdaodictionary import youdao_mcp
from .tools.dictionary import dictionary_mcp
from .tools.skillDownload import skill_mcp
from .tools.rag import rag_server
from .tools.read_file import read_file_mcp


@lru_cache(maxsize=1)
def get_mcp() -> FastMCP:
    """
    获取MCP服务器实例（单例模式）
    """
    mcp = FastMCP(name="AIchatbot MCP Server")
    return mcp


main_mcp: FastMCP = get_mcp()


async def setup():
    """
    初始化MCP服务器，挂载所有子服务器
    """
    # 挂载websearch服务器（使用新的 namespace 参数）
    main_mcp.mount(websearch_mcp, namespace="websearch")

    # 挂载dictionary服务器
    main_mcp.mount(dictionary_mcp, namespace="dictionary")

    # 挂载skill服务器
    main_mcp.mount(skill_mcp, namespace="skill")

    # 挂载rag服务器（知识库检索）
    main_mcp.mount(rag_server, namespace="rag")

    # 挂载read_file服务器（读取skill子文件）
    main_mcp.mount(read_file_mcp, namespace="read_file")

    # 挂载youdaodictionary服务器
    #main_mcp.mount(youdao_mcp, namespace="youdao")


from .client import MCPClient, get_mcp_client
from .sync_client import SyncMCPClient, get_sync_mcp_client

__all__ = [
    "get_mcp",
    "main_mcp",
    "setup",
    "websearch_mcp",
    "dictionary_mcp",
    "skill_mcp",
    "youdao_mcp",
    "rag_server",
    "read_file_mcp",
    "MCPClient",
    "get_mcp_client",
    "SyncMCPClient",
    "get_sync_mcp_client",
]
