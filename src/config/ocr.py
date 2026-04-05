"""
OCR 配置数据类
"""

import os
from dataclasses import dataclass


@dataclass
class OCRConfig:
    """
    OCR 工具配置

    功能：存储 OCR 相关配置
    输入：配置参数
    输出：配置数据类实例
    """
    model_name: str
    base_url: str
    api_key: str = ""

    def __post_init__(self):
        """从环境变量获取 API 密钥"""
        if not self.api_key:
            self.api_key = os.getenv("PADDLEOCR_API_KEY", "")
