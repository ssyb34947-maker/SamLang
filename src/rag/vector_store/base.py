"""
向量存储基类
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

from ..core.schemas import Chunk, SearchQuery


class BaseVectorStore(ABC):
    """
    向量存储基类
    
    功能：定义向量存储的通用接口
    """
    
    @abstractmethod
    def add_chunks(self, chunks: List[Chunk]) -> bool:
        """
        添加块到向量存储
        
        输入：
            - chunks: 要添加的块列表（需包含 vector）
        输出：
            - bool: 是否添加成功
        """
        pass
    
    @abstractmethod
    def search(
        self, 
        query_vector: List[float], 
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[tuple]:
        """
        向量相似度搜索
        
        输入：
            - query_vector: 查询向量
            - top_k: 返回结果数量
            - filters: 过滤条件
        输出：
            - List[tuple]: (chunk_id, score) 列表
        """
        pass
    
    @abstractmethod
    def delete_by_doc_id(self, doc_id: str) -> bool:
        """
        根据文档ID删除所有相关块
        
        输入：
            - doc_id: 文档ID
        输出：
            - bool: 是否删除成功
        """
        pass
    
    @abstractmethod
    def get_chunk_by_id(self, chunk_id: str) -> Optional[Chunk]:
        """
        根据ID获取块
        
        输入：
            - chunk_id: 块ID
        输出：
            - Chunk: 块对象，不存在则返回 None
        """
        pass
    
    @abstractmethod
    def close(self):
        """关闭连接"""
        pass
