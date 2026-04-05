"""
文本分块器基类
"""

from abc import ABC, abstractmethod
from typing import List

from ..core.schemas import Document, Chunk


class BaseChunker(ABC):
    """
    文本分块器基类
    
    功能：定义文本分块的通用接口
    """
    
    def __init__(self, chunk_size: int = 512, chunk_overlap: float = 0.1):
        """
        初始化分块器
        
        参数：
            - chunk_size: 每个块的大小（字符数）
            - chunk_overlap: 块之间的重叠比例（0-1）
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.overlap_size = int(chunk_size * chunk_overlap)
    
    @abstractmethod
    def split(self, document: Document) -> List[Chunk]:
        """
        将文档分块
        
        输入：
            - document: 要分块的文档
        输出：
            - List[Chunk]: 分块结果列表
        """
        pass
    
    def _generate_chunk_id(self, doc_id: str, index: int) -> str:
        """生成块ID"""
        return f"{doc_id}_chunk_{index}"
