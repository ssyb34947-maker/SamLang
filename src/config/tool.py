"""
工具配置数据类
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class WebSearchConfig:
    """
    网页搜索工具配置

    功能：存储网页搜索工具配置
    输入：配置参数
    输出：配置数据类实例
    """
    enabled: bool = False
    api_url: str = ""
    api_key: str = ""


@dataclass
class YoudaoDictionaryConfig:
    """
    有道词典工具配置

    功能：存储有道词典工具配置
    输入：配置参数
    输出：配置数据类实例
    """
    enabled: bool = False
    base_url: str = ""
    api_key: str = ""


@dataclass
class RemotionConfig:
    """
    Remotion视频生成配置
    
    功能：存储Remotion视频生成相关配置
    """
    enabled: bool = True
    timeout: int = 600
    default_template: str = "with-media"
    available_templates: List[str] = field(default_factory=lambda: [
        "hello-world", "with-media", "with-voiceover"
    ])
    runtimes: Dict[str, Any] = field(default_factory=lambda: {
        "default": "nodejs20",
        "available": ["nodejs18", "nodejs20"]
    })
    quality_presets: List[str] = field(default_factory=lambda: [
        "720p", "1080p", "1440p", "4k"
    ])
    output_formats: List[str] = field(default_factory=lambda: [
        "mp4", "webm", "prores"
    ])


@dataclass
class VideoStorageConfig:
    """
    视频存储配置
    
    功能：存储视频文件的存储配置
    """
    type: str = "local"  # local, oss, s3
    local_path: str = "./temp/videos"
    local_url: str = "/videos"
    # OSS配置
    oss_bucket: str = ""
    oss_endpoint: str = ""
    oss_access_key_id: str = ""
    oss_access_key_secret: str = ""


@dataclass
class PPIOConfig:
    """
    派欧云代码沙箱配置
    
    功能：存储PPIO代码沙箱的配置信息
    """
    enabled: bool = False
    api_key: str = ""
    base_url: str = "https://api.ppio.cloud"
    default_timeout: int = 60
    # Remotion专用配置
    remotion: RemotionConfig = field(default_factory=RemotionConfig)
    # 视频存储配置
    video_storage: VideoStorageConfig = field(default_factory=VideoStorageConfig)


@dataclass
class ToolConfig:
    """
    工具配置

    功能：存储所有工具配置
    输入：配置参数
    输出：配置数据类实例
    """
    websearch: WebSearchConfig = field(default_factory=WebSearchConfig)
    youdao_dictionary: YoudaoDictionaryConfig = field(default_factory=YoudaoDictionaryConfig)
    ppio_sandbox: PPIOConfig = field(default_factory=PPIOConfig)
