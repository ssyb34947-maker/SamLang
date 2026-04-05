"""
工具配置数据类
"""

from dataclasses import dataclass, field


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
class ToolConfig:
    """
    工具配置

    功能：存储所有工具配置
    输入：配置参数
    输出：配置数据类实例
    """
    websearch: WebSearchConfig = field(default_factory=WebSearchConfig)
    youdao_dictionary: YoudaoDictionaryConfig = field(default_factory=YoudaoDictionaryConfig)
