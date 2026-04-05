"""
RAG 配置数据类
"""

import os
from dataclasses import dataclass


@dataclass
class MilvusConfig:
    """
    Milvus 向量数据库配置
    """
    host: str = "localhost"
    port: int = 19530

    def __post_init__(self):
        """从环境变量获取主机地址"""
        env_host = os.getenv("MILVUS_HOST", "")
        if env_host:
            self.host = env_host


@dataclass
class RAGConfig:
    """
    RAG 全局配置
    """
    collection_name: str = "rag_collection"
    vector_dim: int = 1024
    chunk_size: int = 1024
    chunk_overlap: float = 0.1
    top_k: int = 10
    use_rerank: bool = True
    milvus: MilvusConfig = None

    def __post_init__(self):
        if self.milvus is None:
            self.milvus = MilvusConfig()
        if self.vector_dim <= 0:
            raise ValueError("vector_dim 必须大于 0")
        if self.chunk_size <= 0:
            raise ValueError("chunk_size 必须大于 0")
        if not 0 <= self.chunk_overlap < 1:
            raise ValueError("chunk_overlap 必须在 [0, 1) 范围内")
        if self.top_k <= 0:
            raise ValueError("top_k 必须大于 0")
