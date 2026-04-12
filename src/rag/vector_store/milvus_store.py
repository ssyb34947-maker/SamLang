"""
Milvus 向量存储实现
使用 Milvus 进行向量存储和检索
"""

import json
from typing import List, Optional, Dict, Any
from datetime import datetime

from loguru import logger

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
    | creator     | VARCHAR  | 创建者（用户ID）       |

    向量索引搜索算法：HNSW
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
        """确保 Collection 存在，如果不存在则创建"""
        if utility.has_collection(self.collection_name, using=self.alias):
            # 检查是否需要重建（字段不匹配）
            collection = Collection(self.collection_name, using=self.alias)
            existing_fields = {field.name for field in collection.schema.fields}
            required_fields = {"uid", "chunk_id", "doc_id", "vector", "chunk",
                             "type", "metadata", "update_time", "source", "creator"}

            if not required_fields.issubset(existing_fields):
                logger.warning(f"Collection {self.collection_name} 字段不匹配，正在重建...")
                self._recreate_collection()
            else:
                self.collection = collection
                self.collection.load()
        else:
            self._create_collection()

    def _recreate_collection(self):
        """删除并重新创建 Collection"""
        try:
            # 删除旧 collection
            if utility.has_collection(self.collection_name, using=self.alias):
                utility.drop_collection(self.collection_name, using=self.alias)
                logger.info(f"已删除旧 collection: {self.collection_name}")
        except Exception as e:
            logger.warning(f"删除旧 collection 失败: {e}")

        # 创建新 collection
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
            FieldSchema(name="creator", dtype=DataType.VARCHAR, max_length=256),
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
    
    def add_chunks(self, chunks: List[Chunk], creator: str = "") -> bool:
        """
        添加块到 Milvus（带详细日志）

        输入：
            - chunks: 块列表（需包含 vector）
            - creator: 创建者用户ID
        输出：是否成功
        """
        logger.info(f"[MilvusStore] ========== 添加块到 Milvus ==========")
        logger.info(f"[MilvusStore] Collection: {self.collection_name}")
        logger.info(f"[MilvusStore] 块数量: {len(chunks)}")
        logger.info(f"[MilvusStore] 创建者: {creator}")

        if not chunks:
            logger.info(f"[MilvusStore] 块列表为空，跳过")
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
            creators = []

            logger.info(f"[MilvusStore] 准备数据...")
            for i, chunk in enumerate(chunks):
                if chunk.vector is None:
                    logger.error(f"[MilvusStore] ❌ 块 {chunk.id} 没有向量")
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
                creators.append(creator)

                if i == 0:
                    logger.info(f"[MilvusStore] 第一个块信息:")
                    logger.info(f"[MilvusStore]   - chunk_id: {chunk.id}")
                    logger.info(f"[MilvusStore]   - doc_id: {chunk.doc_id}")
                    logger.info(f"[MilvusStore]   - type: {doc_type}")
                    logger.info(f"[MilvusStore]   - vector_dim: {len(chunk.vector)}")

            # 插入数据
            logger.info(f"[MilvusStore] 插入数据到 Milvus...")
            entities = [
                chunk_ids,
                doc_ids,
                vectors,
                contents,
                types,
                metadatas,
                update_times,
                sources,
                creators
            ]

            insert_result = self.collection.insert(entities)
            logger.info(f"[MilvusStore] 插入完成，刷新数据...")
            self.collection.flush()
            logger.info(f"[MilvusStore] ✅ 成功添加 {len(chunks)} 个块到 Milvus")

            return True

        except Exception as e:
            logger.error(f"[MilvusStore] ❌ 添加块到 Milvus 失败")
            logger.error(f"[MilvusStore]    异常类型: {type(e).__name__}")
            logger.error(f"[MilvusStore]    异常信息: {e}")
            import traceback
            logger.error(f"[MilvusStore]    堆栈跟踪:\n{traceback.format_exc()}")
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
            logger.info(f"[MilvusStore] 查询文档分块: doc_id={doc_id}")
            expr = f'doc_id == "{doc_id}"'
            logger.info(f"[MilvusStore] 查询表达式: {expr}")
            results = self.collection.query(
                expr=expr,
                output_fields=["chunk_id", "doc_id", "chunk", "type", "metadata", "source"]
            )
            logger.info(f"[MilvusStore] 查询结果数量: {len(results)}")
            
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
            logger.error(f"[MilvusStore] 获取文档块失败: {e}")
            return []
    
    def get_documents_by_creator(
        self,
        creator: Optional[str] = None,
        doc_type: Optional[str] = None,
        limit: int = 1000
    ) -> List[Dict[str, Any]]:
        """
        根据创建者获取文档列表（去重）

        Args:
            creator: 创建者用户ID，None 表示查询所有
            doc_type: 文档类型过滤
            limit: 最大返回数量

        Returns:
            List[Dict]: 文档信息列表
        """
        try:
            # 构建查询条件
            conditions = []
            if creator:
                conditions.append(f'creator == "{creator}"')
            if doc_type:
                conditions.append(f'type == "{doc_type}"')

            expr = " and ".join(conditions) if conditions else None
            logger.info(f"[MilvusStore] 查询文档列表: expr={expr}")

            # 查询所有匹配的块
            results = self.collection.query(
                expr=expr,
                output_fields=["doc_id", "source", "type", "metadata", "update_time", "creator"],
                limit=limit
            )
            logger.info(f"[MilvusStore] 文档列表查询结果: {len(results)} 条记录")

            # 按 doc_id 去重
            docs_map = {}
            for data in results:
                doc_id = data.get("doc_id")
                if doc_id not in docs_map:
                    metadata = json.loads(data.get("metadata", "{}"))
                    docs_map[doc_id] = {
                        "doc_id": doc_id,
                        "source": data.get("source", ""),
                        "name": metadata.get("doc_name", ""),
                        "type": data.get("type", "other"),
                        "creator": data.get("creator", ""),
                        "update_time": data.get("update_time", ""),
                        "chunk_count": 1
                    }
                else:
                    docs_map[doc_id]["chunk_count"] += 1

            logger.info(f"[MilvusStore] 去重后文档数量: {len(docs_map)}")
            for doc_id, doc in docs_map.items():
                logger.info(f"[MilvusStore]   - doc_id: {doc_id}, name: {doc['name']}")

            return list(docs_map.values())

        except Exception as e:
            logger.error(f"[MilvusStore] 获取文档列表失败: {e}")
            return []

    def get_document_creator(self, doc_id: str) -> Optional[str]:
        """
        获取文档的创建者

        Args:
            doc_id: 文档ID

        Returns:
            str: 创建者用户ID，失败返回 None
        """
        try:
            logger.info(f"[MilvusStore] 查询文档创建者: doc_id={doc_id}")
            expr = f'doc_id == "{doc_id}"'
            results = self.collection.query(
                expr=expr,
                output_fields=["creator"],
                limit=1
            )
            logger.info(f"[MilvusStore] 创建者查询结果: {len(results)} 条")

            if results:
                creator = results[0].get("creator", "")
                logger.info(f"[MilvusStore] 文档创建者: {creator}")
                return creator
            return None

        except Exception as e:
            logger.error(f"[MilvusStore] 获取文档创建者失败: {e}")
            return None

    def close(self):
        """关闭连接"""
        try:
            if self.collection:
                self.collection.release()
            connections.disconnect(self.alias)
        except Exception as e:
            print(f"关闭 Milvus 连接失败: {e}")
