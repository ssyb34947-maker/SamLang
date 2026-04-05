"""
Embedding 模块
"""

from .base import BaseEmbedding
from .siliconflow_embedding import SiliconFlowEmbedding

__all__ = [
    "BaseEmbedding",
    "SiliconFlowEmbedding",
]
