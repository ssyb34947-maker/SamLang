"""
检索器基类
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

from ..core.schemas import Chunk, RetrievalResult, SearchQuery


class BaseRetriever(ABC):
    """
    检索器基类
    
    功能：定义文档检索的通用接口
    """
    
    def __init__(self, top_k: int = 10):
        self.top_k = top_k
    
    @abstractmethod
    def retrieve(self, query: SearchQuery) -> List[RetrievalResult]:
        """
        检索相关文档块
        
        输入：
            - query: 搜索查询
        输出：
            - List[RetrievalResult]: 检索结果列表
        """
        pass
    
    @abstractmethod
    def add_document(self, chunks: List[Chunk]) -> bool:
        """
        添加文档块到检索索引
        
        输入：
            - chunks: 文档块列表
        输出：
            - bool: 是否添加成功
        """
        pass
