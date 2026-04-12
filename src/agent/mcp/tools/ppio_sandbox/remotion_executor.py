"""
Remotion 视频生成执行器
整合项目构建、渲染、视频存储的完整流程
"""

import json
import re
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from loguru import logger

from .client import PPIOSandboxClient, CommandResult
from .project_builder import RemotionProjectBuilder, SandboxProject
from .storage import VideoStorage
from .exceptions import PPIOError, PPIOTimeoutError


@dataclass
class RenderResult:
    """渲染结果"""
    success: bool
    output_path: str
    duration: float = 0.0
    width: int = 0
    height: int = 0
    file_size: int = 0
    logs: str = ""
    error: str = ""


@dataclass
class VideoInfo:
    """视频信息"""
    file_id: str
    url: str
    duration: float
    width: int
    height: int
    file_size: int
    format: str


class RemotionExecutor:
    """
    Remotion 视频生成执行器
    
    功能：
    - 创建沙箱和项目
    - 上传素材
    - 执行渲染
    - 下载和存储视频
    - 清理资源
    """
    
    def __init__(
        self,
        client: PPIOSandboxClient,
        storage: VideoStorage,
        config: Dict[str, Any]
    ):
        """
        初始化执行器
        
        输入：
            client: PPIO 沙箱客户端
            storage: 视频存储实例
            config: 配置字典
        """
        self.client = client
        self.storage = storage
        self.config = config
        self.builder = RemotionProjectBuilder(client)
    
    def execute(
        self,
        user_id: str,
        code: str,
        language: str = "typescript",
        project_type: str = "remotion",
        dependencies: Optional[List[str]] = None,
        assets: Optional[Dict[str, Union[str, bytes]]] = None,
        render_config: Optional[Dict[str, Any]] = None,
        timeout: int = 600
    ) -> Dict[str, Any]:
        """
        执行完整的 Remotion 视频生成流程
        
        输入：
            user_id: 用户ID（系统注入）
            code: 代码内容
            language: 语言类型
            project_type: 项目类型
            dependencies: 额外依赖
            assets: 素材文件
            render_config: 渲染配置
            timeout: 超时时间
        
        输出：
            执行结果字典
        """
        sandbox = None
        project = None
        
        try:
            # 1. 创建沙箱
            logger.info(f"[RemotionExecutor] 开始执行: user={user_id}")
            sandbox = self.client.create_sandbox()
            
            # 2. 创建项目
            project_name = f"video_{user_id}_{self._generate_timestamp()}"
            project = self.builder.create_project(
                sandbox_id=sandbox.sandbox_id,
                project_name=project_name,
                template="with-media",
                additional_deps=dependencies
            )
            
            # 3. 写入组件代码
            self.builder.write_component_code(project, code)
            
            # 4. 上传素材
            if assets:
                self._upload_assets(project, assets)
            
            # 5. 渲染视频
            composition_id = render_config.get("composition_id", "Main") if render_config else "Main"
            output_format = render_config.get("output_format", "mp4") if render_config else "mp4"
            quality = render_config.get("quality", "1080p") if render_config else "1080p"
            
            render_result = self._render_video(
                project=project,
                composition_id=composition_id,
                output_format=output_format,
                quality=quality,
                timeout=timeout
            )
            
            if not render_result.success:
                return {
                    "success": False,
                    "error": render_result.error,
                    "logs": render_result.logs
                }
            
            # 6. 下载视频
            video_content = self.client.download_file(
                sandbox_id=project.sandbox_id,
                remote_path=render_result.output_path
            )
            
            # 7. 存储视频
            filename = f"{composition_id}.{output_format}"
            file_id = self.storage.save(user_id, filename, video_content)
            video_url = self.storage.get_url(file_id)
            
            # 8. 构建返回结果
            video_info = VideoInfo(
                file_id=file_id,
                url=video_url,
                duration=render_result.duration,
                width=render_result.width,
                height=render_result.height,
                file_size=len(video_content),
                format=output_format
            )
            
            logger.info(f"[RemotionExecutor] 执行完成: file_id={file_id}")
            
            return {
                "success": True,
                "output_type": "video",
                "video": {
                    "file_id": video_info.file_id,
                    "url": video_info.url,
                    "duration": video_info.duration,
                    "width": video_info.width,
                    "height": video_info.height,
                    "file_size": video_info.file_size,
                    "format": video_info.format
                },
                "logs": render_result.logs,
                "sandbox_id": sandbox.sandbox_id
            }
            
        except PPIOError as e:
            logger.error(f"[RemotionExecutor] PPIO错误: {str(e)}")
            return {
                "success": False,
                "error": f"沙箱执行错误: {str(e)}",
                "logs": ""
            }
        except Exception as e:
            logger.error(f"[RemotionExecutor] 执行错误: {str(e)}")
            return {
                "success": False,
                "error": f"执行错误: {str(e)}",
                "logs": ""
            }
        finally:
            # 9. 清理资源
            if sandbox:
                try:
                    self.client.kill_sandbox(sandbox.sandbox_id)
                    logger.info(f"[RemotionExecutor] 沙箱已清理: {sandbox.sandbox_id}")
                except Exception as e:
                    logger.warning(f"[RemotionExecutor] 沙箱清理失败: {str(e)}")
    
    def _upload_assets(
        self,
        project: SandboxProject,
        assets: Dict[str, Union[str, bytes]]
    ) -> None:
        """
        上传素材文件
        
        输入：
            project: 项目信息
            assets: 素材字典 {文件名: 内容或URL}
        """
        for filename, content in assets.items():
            try:
                if isinstance(content, str):
                    # 如果是URL，需要下载
                    if content.startswith("http://") or content.startswith("https://"):
                        import requests
                        response = requests.get(content, timeout=30)
                        content = response.content
                    elif content.startswith("base64:"):
                        # Base64编码内容
                        import base64
                        content = base64.b64decode(content[7:])
                    else:
                        # 视为文件路径或纯文本
                        content = content.encode('utf-8')
                
                self.builder.upload_asset(project, filename, content)
                
            except Exception as e:
                logger.warning(f"[RemotionExecutor] 素材上传失败 {filename}: {str(e)}")
    
    def _render_video(
        self,
        project: SandboxProject,
        composition_id: str,
        output_format: str,
        quality: str,
        timeout: int
    ) -> RenderResult:
        """
        渲染视频
        
        输入：
            project: 项目信息
            composition_id: 组合ID
            output_format: 输出格式
            quality: 视频质量
            timeout: 超时时间
        
        输出：
            RenderResult 对象
        """
        logger.info(f"[RemotionExecutor] 开始渲染: composition={composition_id}, format={output_format}")
        
        # 构建输出路径
        output_filename = f"output.{output_format}"
        output_path = f"{project.project_path}/out/{output_filename}"
        
        # 创建输出目录
        self.client.execute_command(
            project.sandbox_id,
            f"mkdir -p {project.project_path}/out",
            timeout=10
        )
        
        # 构建渲染命令
        # 质量参数映射
        quality_settings = {
            "720p": "--height=720",
            "1080p": "--height=1080",
            "1440p": "--height=1440",
            "4k": "--height=2160"
        }
        quality_param = quality_settings.get(quality, "--height=1080")
        
        render_cmd = (
            f"cd {project.project_path} && "
            f"npx remotion render src/index.ts {composition_id} {output_path} "
            f"{quality_param} --codec=h264"
        )
        
        # 执行渲染
        result = self.client.execute_command(
            project.sandbox_id,
            render_cmd,
            timeout=timeout
        )
        
        # 解析结果
        logs = result.stdout + "\n" + result.stderr
        
        if result.exit_code != 0:
            logger.error(f"[RemotionExecutor] 渲染失败: {logs}")
            return RenderResult(
                success=False,
                output_path="",
                logs=logs,
                error=f"渲染失败 (exit code {result.exit_code})"
            )
        
        # 获取视频信息
        video_info = self._get_video_info(project.sandbox_id, output_path)
        
        logger.info(f"[RemotionExecutor] 渲染完成: {output_path}")
        
        return RenderResult(
            success=True,
            output_path=output_path,
            duration=video_info.get("duration", 0),
            width=video_info.get("width", 0),
            height=video_info.get("height", 0),
            file_size=video_info.get("file_size", 0),
            logs=logs
        )
    
    def _get_video_info(
        self,
        sandbox_id: str,
        video_path: str
    ) -> Dict[str, Any]:
        """
        获取视频信息
        
        使用 ffprobe 获取视频元数据
        """
        try:
            # 使用 ffprobe 获取视频信息
            cmd = f"ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of json {video_path}"
            result = self.client.execute_command(sandbox_id, cmd, timeout=30)
            
            if result.exit_code == 0:
                info = json.loads(result.stdout)
                stream = info.get("streams", [{}])[0]
                
                # 获取文件大小
                size_cmd = f"stat -c%s {video_path}"
                size_result = self.client.execute_command(sandbox_id, size_cmd, timeout=10)
                file_size = int(size_result.stdout.strip()) if size_result.exit_code == 0 else 0
                
                return {
                    "width": int(stream.get("width", 0)),
                    "height": int(stream.get("height", 0)),
                    "duration": float(stream.get("duration", 0)),
                    "file_size": file_size
                }
        except Exception as e:
            logger.warning(f"[RemotionExecutor] 获取视频信息失败: {str(e)}")
        
        return {"width": 0, "height": 0, "duration": 0, "file_size": 0}
    
    def _generate_timestamp(self) -> str:
        """生成时间戳"""
        from datetime import datetime
        return datetime.now().strftime("%Y%m%d_%H%M%S")
