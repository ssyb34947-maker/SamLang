"""
Embedding 模型基类
"""

from abc import ABC, abstractmethod
from typing import List


class BaseEmbedding(ABC):
    """
    Embedding 模型基类
    
    功能：定义文本向量化的通用接口
    """
    
    def __init__(self, model_name: str, vector_dim: int):
        self.model_name = model_name
        self.vector_dim = vector_dim
    
    @abstractmethod
    def embed(self, texts: List[str]) -> List[List[float]]:
        """
        将文本列表转换为向量
        
        输入：
            - texts: 文本列表
        输出：
            - List[List[float]]: 向量列表，每个向量是 float 列表
        """
        pass
    
    def embed_query(self, query: str) -> List[float]:
        """
        将查询文本转换为向量
        
        输入：
            - query: 查询文本
        输出：
            - List[float]: 查询向量
        """
        result = self.embed([query])
        return result[0] if result else []
