"""
Rerank 配置数据类
"""

import os
from dataclasses import dataclass


@dataclass
class RerankConfig:
    """
    Rerank 模型配置

    功能：存储 Rerank 相关配置
    输入：配置参数
    输出：配置数据类实例
    """
    model_name: str
    base_url: str
    api_key: str = ""

    def __post_init__(self):
        """从环境变量获取 API 密钥"""
        if not self.api_key:
            self.api_key = os.getenv("REANK_API_KEY", "")
