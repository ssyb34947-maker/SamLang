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
    api_key: str
    base_url: str
    model_name: str
    temperature: float = 0.7
    max_tokens: int = 2000

    def __post_init__(self):
        """验证配置"""
        if not self.api_key or self.api_key == "${OPENAI_API_KEY}":
            import os
            self.api_key = os.getenv("OPENAI_API_KEY", "")
            if not self.api_key:
                raise ValueError("需要设置 OPENAI_API_KEY 环境变量")
