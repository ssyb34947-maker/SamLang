"""
PPIO 沙箱模块
用于在派欧云代码沙箱中执行代码，支持 Remotion 视频生成

使用示例：
    from src.agent.mcp.tools.ppio_sandbox import RemotionExecutor, create_storage
    from src.agent.mcp.tools.ppio_sandbox.client import PPIOSandboxClient
"""

from .client import PPIOSandboxClient, SandboxInfo, CommandResult
from .storage import VideoStorage, LocalStorage, AliyunOSSStorage, create_storage
from .project_builder import RemotionProjectBuilder, SandboxProject
from .remotion_executor import RemotionExecutor, RenderResult, VideoInfo
from .exceptions import (
    PPIOError,
    PPIOAuthError,
    PPIOQuotaError,
    PPIORuntimeError,
    PPIOTimeoutError,
    PPIOConnectionError,
    PPIOFileError,
)

__all__ = [
    # 客户端
    "PPIOSandboxClient",
    "SandboxInfo",
    "CommandResult",
    
    # 存储
    "VideoStorage",
    "LocalStorage",
    "AliyunOSSStorage",
    "create_storage",
    
    # 项目构建
    "RemotionProjectBuilder",
    "SandboxProject",
    
    # 执行器
    "RemotionExecutor",
    "RenderResult",
    "VideoInfo",
    
    # 异常
    "PPIOError",
    "PPIOAuthError",
    "PPIOQuotaError",
    "PPIORuntimeError",
    "PPIOTimeoutError",
    "PPIOConnectionError",
    "PPIOFileError",
]
