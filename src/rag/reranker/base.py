"""
Reranker 基类
"""

from abc import ABC, abstractmethod
from typing import List, Tuple

from ..core.schemas import Chunk


class BaseReranker(ABC):
    """
    重排序器基类
    
    功能：对初步检索结果进行重排序，提高准确性
    """
    
    def __init__(self, model_name: str, top_k: int = 10):
        self.model_name = model_name
        self.top_k = top_k
    
    @abstractmethod
    def rerank(
        self, 
        query: str, 
        chunks: List[Chunk],
        initial_scores: List[float] = None
    ) -> List[Tuple[Chunk, float]]:
        """
        对块进行重排序
        
        输入：
            - query: 查询文本
            - chunks: 候选块列表
            - initial_scores: 初始分数（可选）
        输出：
            - List[Tuple[Chunk, float]]: (块, 新分数) 列表，按分数降序排列
        """
        pass
