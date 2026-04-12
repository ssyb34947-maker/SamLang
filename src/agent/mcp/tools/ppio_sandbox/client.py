"""
PPIO 沙箱客户端
使用派欧云官方 SDK 与代码沙箱服务交互
"""

import os
from typing import Optional, Dict, Any, List
from loguru import logger

from .exceptions import (
    PPIOError,
    PPIOAuthError,
    PPIOQuotaError,
    PPIORuntimeError,
    PPIOTimeoutError,
    PPIOConnectionError,
    PPIOFileError,
)


class SandboxInfo:
    """沙箱信息"""
    def __init__(self, sandbox_id: str, status: str, runtime: str, created_at: str):
        self.sandbox_id = sandbox_id
        self.status = status
        self.runtime = runtime
        self.created_at = created_at


class CommandResult:
    """命令执行结果"""
    def __init__(
        self,
        exit_code: int,
        stdout: str,
        stderr: str,
        duration: float
    ):
        self.exit_code = exit_code
        self.stdout = stdout
        self.stderr = stderr
        self.duration = duration


class PPIOSandboxClient:
    """
    PPIO 沙箱客户端
    
    功能：
    - 管理沙箱生命周期（创建、运行、销毁）
    - 上传/下载文件
    - 执行命令
    
    使用官方 ppio-sandbox SDK
    """
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        """
        初始化 PPIO 客户端
        
        输入：
            api_key: PPIO API Key
            base_url: API 基础 URL（可选）
        """
        self.api_key = api_key
        
        # 设置环境变量供官方 SDK 使用
        os.environ["PPIO_API_KEY"] = api_key
        
        # 延迟导入官方 SDK
        try:
            from ppio_sandbox.code_interpreter import Sandbox
            self._sandbox_class = Sandbox
            logger.info("[PPIO] 官方 SDK 导入成功")
        except ImportError as e:
            logger.error(f"[PPIO] 无法导入 ppio-sandbox SDK: {str(e)}")
            logger.info("[PPIO] 请安装: pip install ppio-sandbox")
            raise ImportError("请安装 ppio-sandbox SDK: pip install ppio-sandbox")
        
        # 活跃沙箱缓存
        self._active_sandboxes: Dict[str, Any] = {}
    
    def create_sandbox(self) -> SandboxInfo:
        """
        创建沙箱
        
        输出：
            SandboxInfo 对象
        """
        try:
            logger.info("[PPIO] 创建沙箱...")
            
            # 使用官方 SDK 创建沙箱（不传参数）
            sandbox = self._sandbox_class.create()
            
            # 使用 sandbox_id 属性
            sandbox_id = sandbox.sandbox_id
            
            sandbox_info = SandboxInfo(
                sandbox_id=sandbox_id,
                status="running",
                runtime="unknown",
                created_at=""
            )
            
            # 缓存沙箱实例
            self._active_sandboxes[sandbox_id] = sandbox
            
            logger.info(f"[PPIO] 沙箱创建成功: {sandbox_id}")
            return sandbox_info
            
        except Exception as e:
            logger.error(f"[PPIO] 沙箱创建失败: {str(e)}")
            raise PPIOError(f"创建沙箱失败: {str(e)}")
    
    def execute_command(
        self,
        sandbox_id: str,
        command: str,
        timeout: int = 300,
        working_dir: Optional[str] = None
    ) -> CommandResult:
        """
        在沙箱中执行命令
        
        输入：
            sandbox_id: 沙箱 ID
            command: 要执行的命令
            timeout: 命令超时时间（秒）
            working_dir: 工作目录（可选）
        
        输出：
            CommandResult 对象
        """
        try:
            # 获取沙箱实例
            sandbox = self._active_sandboxes.get(sandbox_id)
            if not sandbox:
                raise PPIOError(f"沙箱不存在: {sandbox_id}")
            
            logger.info(f"[PPIO] 执行命令: sandbox={sandbox_id}, cmd={command[:50]}...")
            
            # 使用官方 SDK 执行代码
            execution = sandbox.run_code(command, timeout=timeout)
            
            # Execution 对象属性：exit_code, stdout, stderr, logs 等
            # 根据实际属性调整
            cmd_result = CommandResult(
                exit_code=getattr(execution, 'exit_code', 0),
                stdout=getattr(execution, 'stdout', '') or getattr(execution, 'logs', ''),
                stderr=getattr(execution, 'stderr', ''),
                duration=getattr(execution, 'duration', 0)
            )
            
            logger.info(f"[PPIO] 命令执行完成: exit_code={cmd_result.exit_code}")
            return cmd_result
            
        except Exception as e:
            logger.error(f"[PPIO] 命令执行失败: {str(e)}")
            raise PPIOError(f"命令执行失败: {str(e)}")
    
    def upload_file(
        self,
        sandbox_id: str,
        remote_path: str,
        content: bytes
    ) -> bool:
        """
        上传文件到沙箱
        
        输入：
            sandbox_id: 沙箱 ID
            remote_path: 远程文件路径
            content: 文件内容（bytes）
        
        输出：
            是否成功
        """
        try:
            sandbox = self._active_sandboxes.get(sandbox_id)
            if not sandbox:
                raise PPIOError(f"沙箱不存在: {sandbox_id}")
            
            logger.info(f"[PPIO] 上传文件: sandbox={sandbox_id}, path={remote_path}")
            
            # 使用官方 SDK 上传文件
            sandbox.files.write(remote_path, content.decode('utf-8') if isinstance(content, bytes) else content)
            
            logger.info(f"[PPIO] 文件上传成功: {remote_path}")
            return True
            
        except Exception as e:
            logger.error(f"[PPIO] 文件上传失败: {str(e)}")
            raise PPIOFileError(f"文件上传失败: {str(e)}")
    
    def download_file(
        self,
        sandbox_id: str,
        remote_path: str
    ) -> bytes:
        """
        从沙箱下载文件
        
        输入：
            sandbox_id: 沙箱 ID
            remote_path: 远程文件路径
        
        输出：
            文件内容（bytes）
        """
        try:
            sandbox = self._active_sandboxes.get(sandbox_id)
            if not sandbox:
                raise PPIOError(f"沙箱不存在: {sandbox_id}")
            
            logger.info(f"[PPIO] 下载文件: sandbox={sandbox_id}, path={remote_path}")
            
            # 使用官方 SDK 读取文件
            content = sandbox.files.read(remote_path)
            
            logger.info(f"[PPIO] 文件下载成功: {len(content)} bytes")
            return content.encode('utf-8') if isinstance(content, str) else content
            
        except Exception as e:
            logger.error(f"[PPIO] 文件下载失败: {str(e)}")
            raise PPIOFileError(f"文件下载失败: {str(e)}")
    
    def list_files(
        self,
        sandbox_id: str,
        path: str = "/"
    ) -> List[Dict[str, Any]]:
        """
        列出沙箱中的文件
        
        输入：
            sandbox_id: 沙箱 ID
            path: 目录路径
        
        输出：
            文件列表
        """
        try:
            sandbox = self._active_sandboxes.get(sandbox_id)
            if not sandbox:
                raise PPIOError(f"沙箱不存在: {sandbox_id}")
            
            # 使用官方 SDK 列出文件
            files = sandbox.files.list(path)
            
            return [{"name": f, "path": f"{path}/{f}"} for f in files] if files else []
            
        except Exception as e:
            logger.error(f"[PPIO] 列出文件失败: {str(e)}")
            raise PPIOFileError(f"列出文件失败: {str(e)}")
    
    def kill_sandbox(self, sandbox_id: str) -> bool:
        """
        销毁沙箱
        
        输入：
            sandbox_id: 沙箱 ID
        
        输出：
            是否成功
        """
        try:
            sandbox = self._active_sandboxes.get(sandbox_id)
            if sandbox:
                logger.info(f"[PPIO] 销毁沙箱: {sandbox_id}")
                sandbox.kill()
                del self._active_sandboxes[sandbox_id]
                logger.info(f"[PPIO] 沙箱销毁成功: {sandbox_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"[PPIO] 沙箱销毁失败: {str(e)}")
            return False
    
    def get_sandbox_status(self, sandbox_id: str) -> SandboxInfo:
        """
        获取沙箱状态
        
        输入：
            sandbox_id: 沙箱 ID
        
        输出：
            SandboxInfo 对象
        """
        sandbox = self._active_sandboxes.get(sandbox_id)
        if not sandbox:
            raise PPIOError(f"沙箱不存在: {sandbox_id}")
        
        return SandboxInfo(
            sandbox_id=sandbox_id,
            status="running",
            runtime="unknown",
            created_at=""
        )
