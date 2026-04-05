"""
LLM 配置数据类
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class LLMConfig:
    """
    LLM 配置

    功能：存储 LLM 相关配置
    输入：配置参数
    输出：配置数据类实例
    """
    base_url: str
    model_name: str
    api_key: str = ""
    temperature: float = 0.7
    max_tokens: int = 2000

    def __post_init__(self):
        """验证配置"""
        if not self.api_key:
            import os
            self.api_key = os.getenv("OPENAI_API_KEY", "")
            if not self.api_key:
                raise ValueError("需要设置 OPENAI_API_KEY 环境变量")
