"""
文档加载器基类
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Union

from ..core.schemas import Document, DocumentType


class BaseLoader(ABC):
    """
    文档加载器基类
    
    功能：定义文档加载的通用接口
    子类需要实现具体的加载逻辑
    """
    
    def __init__(self, doc_type: DocumentType = DocumentType.OTHER):
        self.doc_type = doc_type
    
    @abstractmethod
    def load(self, source: Union[str, Path]) -> Document:
        """
        加载文档
        
        输入：
            - source: 文档来源（文件路径或URL）
        输出：
            - Document: 加载的文档对象
        """
        pass
    
    @abstractmethod
    def supports(self, source: Union[str, Path]) -> bool:
        """
        检查是否支持该来源
        
        输入：
            - source: 文档来源
        输出：
            - bool: 是否支持
        """
        pass
