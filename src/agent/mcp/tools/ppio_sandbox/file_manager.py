"""
文件管理工具
用于管理沙箱中的文件操作
"""

import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from loguru import logger

from .client import PPIOSandboxClient


class FileManager:
    """
    文件管理器
    
    功能：
    - 批量上传/下载文件
    - 管理目录结构
    - 清理临时文件
    """
    
    def __init__(self, client: PPIOSandboxClient):
        """
        初始化文件管理器
        
        输入：
            client: PPIO 沙箱客户端
        """
        self.client = client
    
    def upload_directory(
        self,
        sandbox_id: str,
        local_dir: str,
        remote_dir: str
    ) -> List[str]:
        """
        上传整个目录到沙箱
        
        输入：
            sandbox_id: 沙箱 ID
            local_dir: 本地目录路径
            remote_dir: 远程目录路径
        
        输出：
            上传的文件列表
        """
        uploaded_files = []
        local_path = Path(local_dir)
        
        if not local_path.exists():
            logger.warning(f"[FileManager] 本地目录不存在: {local_dir}")
            return uploaded_files
        
        for file_path in local_path.rglob("*"):
            if file_path.is_file():
                # 计算相对路径
                relative_path = file_path.relative_to(local_path)
                remote_path = f"{remote_dir}/{relative_path}"
                
                try:
                    with open(file_path, "rb") as f:
                        content = f.read()
                    
                    self.client.upload_file(sandbox_id, remote_path, content)
                    uploaded_files.append(str(relative_path))
                    
                except Exception as e:
                    logger.warning(f"[FileManager] 上传失败 {file_path}: {str(e)}")
        
        logger.info(f"[FileManager] 目录上传完成: {len(uploaded_files)} 个文件")
        return uploaded_files
    
    def download_directory(
        self,
        sandbox_id: str,
        remote_dir: str,
        local_dir: str
    ) -> List[str]:
        """
        从沙箱下载整个目录
        
        输入：
            sandbox_id: 沙箱 ID
            remote_dir: 远程目录路径
            local_dir: 本地目录路径
        
        输出：
            下载的文件列表
        """
        downloaded_files = []
        
        try:
            # 列出远程目录中的所有文件
            files = self.client.list_files(sandbox_id, remote_dir)
            
            for file_info in files:
                if file_info.get("type") == "file":
                    remote_path = file_info.get("path")
                    relative_path = remote_path.replace(remote_dir, "").lstrip("/")
                    local_path = Path(local_dir) / relative_path
                    
                    try:
                        # 创建本地目录
                        local_path.parent.mkdir(parents=True, exist_ok=True)
                        
                        # 下载文件
                        content = self.client.download_file(sandbox_id, remote_path)
                        
                        # 保存文件
                        with open(local_path, "wb") as f:
                            f.write(content)
                        
                        downloaded_files.append(str(relative_path))
                        
                    except Exception as e:
                        logger.warning(f"[FileManager] 下载失败 {remote_path}: {str(e)}")
            
            logger.info(f"[FileManager] 目录下载完成: {len(downloaded_files)} 个文件")
            
        except Exception as e:
            logger.error(f"[FileManager] 下载目录失败: {str(e)}")
        
        return downloaded_files
    
    def ensure_directory(self, sandbox_id: str, remote_path: str) -> bool:
        """
        确保远程目录存在
        
        输入：
            sandbox_id: 沙箱 ID
            remote_path: 远程目录路径
        
        输出：
            是否成功
        """
        try:
            result = self.client.execute_command(
                sandbox_id,
                f"mkdir -p {remote_path}",
                timeout=10
            )
            return result.exit_code == 0
        except Exception as e:
            logger.warning(f"[FileManager] 创建目录失败: {str(e)}")
            return False
    
    def cleanup_remote_directory(
        self,
        sandbox_id: str,
        remote_dir: str
    ) -> bool:
        """
        清理远程目录
        
        输入：
            sandbox_id: 沙箱 ID
            remote_dir: 远程目录路径
        
        输出：
            是否成功
        """
        try:
            result = self.client.execute_command(
                sandbox_id,
                f"rm -rf {remote_dir}",
                timeout=30
            )
            return result.exit_code == 0
        except Exception as e:
            logger.warning(f"[FileManager] 清理目录失败: {str(e)}")
            return False
