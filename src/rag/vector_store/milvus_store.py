"""
Milvus 向量存储实现
使用 Milvus 进行向量存储和检索
"""

import json
from typing import List, Optional, Dict, Any
from datetime import datetime

try:
    from pymilvus import (
        connections, 
        Collection, 
        CollectionSchema, 
        FieldSchema, 
        DataType,
        utility
    )
    MILVUS_AVAILABLE = True
except ImportError:
    MILVUS_AVAILABLE = False

from .base import BaseVectorStore
from ..core.schemas import Chunk, DocumentType


class MilvusStore(BaseVectorStore):
    """
    Milvus 向量存储
    
    Collection 结构：
    | 字段名       | 类型      | 说明                  |
    |-------------|----------|---------------------|
    | uid         | INT64    | 主键，自增            |
    | chunk_id    | VARCHAR  | 块唯一标识            |
    | doc_id      | VARCHAR  | 所属文档ID            |
    | vector      | FLOAT_VECTOR | 向量表示          |
    | chunk       | VARCHAR  | 块内容                |
    | type        | VARCHAR  | 文档类型              |
    | metadata    | VARCHAR  | JSON 格式的元数据      |
    | update_time | VARCHAR  | 更新时间              |
    | source      | VARCHAR  | 来源                  |
    
    索引：HNSW（适合小数据集）
    """
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 19530,
        collection_name: str = "rag_collection",
        vector_dim: int = 1024,
        alias: str = "default"
    ):
        if not MILVUS_AVAILABLE:
            raise ImportError(
                "Milvus 存储需要 pymilvus。"
                "请安装：pip install pymilvus"
            )
        
        self.host = host
        self.port = port
        self.collection_name = collection_name
        self.vector_dim = vector_dim
        self.alias = alias
        self.collection = None
        
        self._connect()
        self._ensure_collection()
    
    def _connect(self):
        """连接到 Milvus 服务器"""
        try:
            connections.connect(
                alias=self.alias,
                host=self.host,
                port=self.port
            )
        except Exception as e:
            raise ConnectionError(f"连接 Milvus 失败: {e}")
    
    def _ensure_collection(self):
        """确保 Collection 存在"""
        if utility.has_collection(self.collection_name, using=self.alias):
            self.collection = Collection(self.collection_name, using=self.alias)
        else:
            self._create_collection()
    
    def _create_collection(self):
        """创建 Collection"""
        # 定义字段
        fields = [
            FieldSchema(name="uid", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="chunk_id", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="doc_id", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=self.vector_dim),
            FieldSchema(name="chunk", dtype=DataType.VARCHAR, max_length=65535),
            FieldSchema(name="type", dtype=DataType.VARCHAR, max_length=64),
            FieldSchema(name="metadata", dtype=DataType.VARCHAR, max_length=4096),
            FieldSchema(name="update_time", dtype=DataType.VARCHAR, max_length=64),
            FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=512),
        ]
        
        schema = CollectionSchema(fields, description="RAG 向量存储")
        self.collection = Collection(self.collection_name, schema, using=self.alias)
        
        # 创建 HNSW 索引
        index_params = {
            "metric_type": "COSINE",  # 使用余弦相似度
            "index_type": "HNSW",
            "params": {
                "M": 16,  # 每个节点的最大连接数
                "efConstruction": 200  # 构建时的搜索范围
            }
        }
        self.collection.create_index(field_name="vector", index_params=index_params)
        self.collection.load()
    
    def add_chunks(self, chunks: List[Chunk]) -> bool:
        """
        添加块到 Milvus
        
        输入：块列表（需包含 vector）
        输出：是否成功
        """
        if not chunks:
            return True
        
        try:
            # 准备数据
            chunk_ids = []
            doc_ids = []
            vectors = []
            contents = []
            types = []
            metadatas = []
            update_times = []
            sources = []
            
            for chunk in chunks:
                if chunk.vector is None:
                    raise ValueError(f"块 {chunk.id} 没有向量")
                
                chunk_ids.append(chunk.id)
                doc_ids.append(chunk.doc_id)
                vectors.append(chunk.vector)
                contents.append(chunk.content[:65535])  # 限制长度
                
                # 从 metadata 中提取 type 和 source
                doc_type = chunk.metadata.get("type", "other")
                source = chunk.metadata.get("source", "")
                
                types.append(doc_type)
                sources.append(source)
                metadatas.append(json.dumps(chunk.metadata, ensure_ascii=False))
                update_times.append(datetime.now().isoformat())
            
            # 插入数据
            entities = [
                chunk_ids,
                doc_ids,
                vectors,
                contents,
                types,
                metadatas,
                update_times,
                sources
            ]
            
            self.collection.insert(entities)
            self.collection.flush()
            
            return True
            
        except Exception as e:
            print(f"添加块到 Milvus 失败: {e}")
            return False
    
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
            - filters: 过滤条件，如 {"type": "book"}
        输出：
            - List[tuple]: (chunk_id, score) 列表
        """
        try:
            # 构建过滤表达式
            expr = None
            if filters:
                conditions = []
                for key, value in filters.items():
                    if isinstance(value, str):
                        conditions.append(f'{key} == "{value}"')
                    else:
                        conditions.append(f'{key} == {value}')
                expr = " and ".join(conditions)
            
            # 搜索参数
            search_params = {
                "metric_type": "COSINE",
                "params": {"ef": 64}  # 搜索时的范围
            }
            
            results = self.collection.search(
                data=[query_vector],
                anns_field="vector",
                param=search_params,
                limit=top_k,
                expr=expr,
                output_fields=["chunk_id"]
            )
            
            # 解析结果
            matches = []
            for result in results:
                for hit in result:
                    chunk_id = hit.entity.get("chunk_id")
                    score = hit.score
                    matches.append((chunk_id, float(score)))
            
            return matches
            
        except Exception as e:
            print(f"Milvus 搜索失败: {e}")
            return []
    
    def delete_by_doc_id(self, doc_id: str) -> bool:
        """根据文档ID删除所有相关块"""
        try:
            expr = f'doc_id == "{doc_id}"'
            self.collection.delete(expr)
            return True
        except Exception as e:
            print(f"删除文档失败: {e}")
            return False
    
    def get_chunk_by_id(self, chunk_id: str) -> Optional[Chunk]:
        """根据ID获取块"""
        try:
            expr = f'chunk_id == "{chunk_id}"'
            results = self.collection.query(
                expr=expr,
                output_fields=["chunk_id", "doc_id", "chunk", "type", "metadata", "source"]
            )
            
            if not results:
                return None
            
            data = results[0]
            metadata = json.loads(data.get("metadata", "{}"))
            metadata["type"] = data.get("type", "other")
            metadata["source"] = data.get("source", "")
            
            return Chunk(
                id=data["chunk_id"],
                doc_id=data["doc_id"],
                content=data["chunk"],
                metadata=metadata
            )
            
        except Exception as e:
            print(f"获取块失败: {e}")
            return None
    
    def get_all_chunks_by_doc_id(self, doc_id: str) -> List[Chunk]:
        """获取文档的所有块"""
        try:
            expr = f'doc_id == "{doc_id}"'
            results = self.collection.query(
                expr=expr,
                output_fields=["chunk_id", "doc_id", "chunk", "type", "metadata", "source"]
            )
            
            chunks = []
            for data in results:
                metadata = json.loads(data.get("metadata", "{}"))
                metadata["type"] = data.get("type", "other")
                metadata["source"] = data.get("source", "")
                
                chunks.append(Chunk(
                    id=data["chunk_id"],
                    doc_id=data["doc_id"],
                    content=data["chunk"],
                    metadata=metadata
                ))
            
            return chunks
            
        except Exception as e:
            print(f"获取文档块失败: {e}")
            return []
    
    def close(self):
        """关闭连接"""
        try:
            if self.collection:
                self.collection.release()
            connections.disconnect(self.alias)
        except Exception as e:
            print(f"关闭 Milvus 连接失败: {e}")
