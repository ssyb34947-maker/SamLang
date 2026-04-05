"""
RAG (Retrieval-Augmented Generation) 模块

提供完整的检索增强生成功能，包括：
- 文档加载：支持 PDF、Word、Excel、CSV、TXT、MD、JSON、图片等格式
- PDF/图片 OCR：调用 OCR 客户端将扫描件转换为 Markdown
- 文档分块：递归分块，支持重叠
- 向量化：使用硅基流动 Embedding API
- 向量存储：Milvus 向量数据库
- 混合检索：向量检索 + BM25 关键词检索
- 重排序：使用 Reranker 优化结果

主要类：
    - RAG: 主入口类
    - Document: 文档模型
    - Chunk: 文本块模型
    - RetrievalResult: 检索结果模型

使用示例：
    ```python
    from src.config.config import get_config
    from src.rag import RAG, DocumentType
    
    # 从配置创建
    config = get_config()
    rag = RAG.from_config(config.rag)
    
    # 添加教科书（PDF）
    rag.add_document("math_textbook.pdf", doc_type=DocumentType.BOOK)
    
    # 添加 Word 文档
    rag.add_document("notes.docx", doc_type=DocumentType.NOTE)
    
    # 添加 Excel 表格
    rag.add_document("data.xlsx", doc_type=DocumentType.OTHER)
    
    # 添加图片（需要 OCR 客户端）
    rag.add_document("scan.png")
    
    # 检索
    results = rag.search("求解一元二次方程", top_k=5)
    
    # 生成上下文给 LLM
    context = rag.generate_context("求解一元二次方程", top_k=5)
    ```
"""

from .rag import RAG
from .core.schemas import Document, Chunk, RetrievalResult, SearchQuery, DocumentType
from .loader import (
    BaseLoader, 
    PDFLoader, 
    WordLoader,
    TextLoader, 
    JSONLoader,
    CSVLoader,
    ExcelLoader,
    ImageLoader
)
from .chunker import BaseChunker, RecursiveChunker
from .embedding import BaseEmbedding, SiliconFlowEmbedding
from .vector_store import BaseVectorStore, MilvusStore
from .retriever import BaseRetriever, HybridRetriever
from .reranker import BaseReranker, SiliconFlowReranker

__version__ = "0.1.0"

__all__ = [
    # 主类
    "RAG",
    
    # 数据模型
    "Document",
    "Chunk",
    "RetrievalResult",
    "SearchQuery",
    "DocumentType",
    
    # 加载器
    "BaseLoader",
    "PDFLoader",
    "WordLoader",
    "TextLoader",
    "JSONLoader",
    "CSVLoader",
    "ExcelLoader",
    "ImageLoader",
    
    # 分块器
    "BaseChunker",
    "RecursiveChunker",
    
    # Embedding
    "BaseEmbedding",
    "SiliconFlowEmbedding",
    
    # 向量存储
    "BaseVectorStore",
    "MilvusStore",
    
    # 检索器
    "BaseRetriever",
    "HybridRetriever",
    
    # Reranker
    "BaseReranker",
    "SiliconFlowReranker",
]
