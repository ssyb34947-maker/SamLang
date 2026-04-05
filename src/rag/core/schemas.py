"""
RAG 核心数据模型
定义文档、块、检索结果等数据结构
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    """文档类型"""
    BOOK = "book"           # 教科书
    PROBLEM = "problem"     # 考题
    NOTE = "note"           # 笔记
    OTHER = "other"         # 其他


@dataclass
class Document:
    """
    文档模型
    
    功能：表示一个原始文档
    属性：
        - id: 文档唯一标识
        - source: 文档来源（文件路径或URL）
        - name: 文档名称
        - content: 文档内容
        - type: 文档类型
        - metadata: 额外元数据
        - create_time: 创建时间
        - update_time: 更新时间
    """
    id: str
    source: str
    name: str
    content: str
    type: DocumentType = DocumentType.OTHER
    metadata: Dict[str, Any] = field(default_factory=dict)
    create_time: datetime = field(default_factory=datetime.now)
    update_time: datetime = field(default_factory=datetime.now)


@dataclass
class Chunk:
    """
    文本块模型
    
    功能：表示文档的一个分块
    属性：
        - id: 块唯一标识
        - doc_id: 所属文档ID
        - content: 块内容
        - vector: 向量表示（可选）
        - start_pos: 在原文档中的起始位置
        - end_pos: 在原文档中的结束位置
        - metadata: 额外元数据
    """
    id: str
    doc_id: str
    content: str
    vector: Optional[List[float]] = None
    start_pos: int = 0
    end_pos: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RetrievalResult:
    """
    检索结果模型
    
    功能：表示一次检索的结果
    属性：
        - chunk: 检索到的块
        - score: 相似度分数
        - rank: 排名
        - retrieval_type: 检索类型（vector/bm25/hybrid）
    """
    chunk: Chunk
    score: float
    rank: int
    retrieval_type: str = "hybrid"


@dataclass
class SearchQuery:
    """
    搜索查询模型
    
    功能：封装搜索查询参数
    属性：
        - query: 查询文本
        - top_k: 返回结果数量
        - filters: 过滤条件
        - doc_types: 指定文档类型
    """
    query: str
    top_k: int = 10
    filters: Optional[Dict[str, Any]] = None
    doc_types: Optional[List[DocumentType]] = None
