"""
RAG 主模块

功能：
1. 文档加载和索引
2. 检索和重排序
3. 上下文生成

使用示例：
    ```python
    from src.config.config import get_config
    from src.rag.rag import RAG
    from src.ocr import get_ocr_client
    
    config = get_config()
    
    # 创建 OCR 客户端（使用 src.ocr 模块）
    ocr_client = get_ocr_client()
    
    rag = RAG.from_config(config.rag, ocr_client=ocr_client)
    
    # 添加文档（PDF 和图片会自动使用 OCR）
    rag.add_document("path/to/book.pdf", doc_type=DocumentType.BOOK)
    rag.add_document("path/to/image.png")
    
    # 检索
    results = rag.search("什么是机器学习？", top_k=5)
    
    # 生成上下文
    context = rag.generate_context("什么是机器学习？", top_k=5)
    ```
"""

from pathlib import Path
from typing import List, Optional, Union, Dict, Any, Callable

from .core.schemas import (
    Document, 
    Chunk, 
    RetrievalResult, 
    SearchQuery, 
    DocumentType
)
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
from loguru import logger

from .chunker import BaseChunker, RecursiveChunker
from .embedding import BaseEmbedding, SiliconFlowEmbedding
from .vector_store import BaseVectorStore, MilvusStore
from .retriever import BaseRetriever, HybridRetriever
from .reranker import BaseReranker, SiliconFlowReranker


class RAG:
    """
    RAG (Retrieval-Augmented Generation) 主类
    
    功能：
    - 文档加载：支持 PDF、Word、Excel、CSV、TXT、MD、JSON、图片等格式
    - PDF/图片 OCR：调用 OCR 客户端将扫描件转换为 Markdown
    - 文档分块：使用递归分块策略，10% 重叠
    - 向量化：使用硅基流动 Embedding API
    - 存储：使用 Milvus 向量数据库
    - 检索：混合检索（向量 + BM25）
    - 重排序：使用 Reranker 模型优化结果
    
    属性：
        - embedding: Embedding 模型
        - vector_store: 向量存储
        - retriever: 检索器
        - reranker: 重排序器（可选）
        - chunker: 分块器
        - ocr_client: OCR 客户端函数
    """
    
    def __init__(
        self,
        embedding: BaseEmbedding,
        vector_store: BaseVectorStore,
        retriever: BaseRetriever,
        chunker: BaseChunker,
        reranker: Optional[BaseReranker] = None,
        enable_rerank: bool = True,
        ocr_client: Optional[Callable] = None
    ):
        """
        初始化 RAG 系统
        
        参数：
            - embedding: Embedding 模型实例
            - vector_store: 向量存储实例
            - retriever: 检索器实例
            - chunker: 分块器实例
            - reranker: 重排序器实例（可选）
            - enable_rerank: 是否启用重排序
            - ocr_client: OCR 客户端函数，用于 PDF 和图片识别
        """
        self.embedding = embedding
        self.vector_store = vector_store
        self.retriever = retriever
        self.chunker = chunker
        self.reranker = reranker
        self.enable_rerank = enable_rerank and reranker is not None
        self.ocr_client = ocr_client
        
        # 初始化加载器
        self._init_loaders()
    
    def _init_loaders(self):
        """初始化所有支持的加载器"""
        self._loaders: List[BaseLoader] = [
            # 图片加载器（需要 OCR）
            ImageLoader(ocr_client=self.ocr_client),
            # PDF 加载器（支持 OCR）
            PDFLoader(ocr_client=self.ocr_client),
            # Word 加载器
            WordLoader(),
            # Excel 加载器
            ExcelLoader(),
            # CSV 加载器
            CSVLoader(),
            # 文本加载器
            TextLoader(),
            # JSON 加载器
            JSONLoader(),
        ]
    
    @classmethod
    def from_config(
        cls,
        rag_config,
        embedding_config,
        rerank_config,
        ocr_client: Optional[Callable] = None
    ) -> "RAG":
        """
        从配置创建 RAG 实例

        参数：
            - rag_config: RAGConfig 配置对象
            - embedding_config: EmbeddingConfig 配置对象
            - rerank_config: RerankConfig 配置对象
            - ocr_client: OCR 客户端函数（可选）
        返回：
            - RAG 实例
        """
        # 1. 创建 Embedding 模型
        embedding = SiliconFlowEmbedding(
            api_key=embedding_config.api_key,
            model_name=embedding_config.model_name,
            base_url=embedding_config.base_url,
            vector_dim=rag_config.vector_dim
        )

        # 2. 创建向量存储
        vector_store = MilvusStore(
            host=rag_config.milvus.host,
            port=rag_config.milvus.port,
            collection_name=rag_config.collection_name,
            vector_dim=rag_config.vector_dim
        )

        # 3. 创建检索器（使用默认权重）
        retriever = HybridRetriever(
            embedding_model=embedding,
            vector_store=vector_store,
            top_k=10,
            vector_weight=0.75,
            bm25_weight=0.25
        )

        # 4. 创建分块器
        chunker = RecursiveChunker(
            chunk_size=rag_config.chunk_size,
            chunk_overlap=rag_config.chunk_overlap
        )

        # 5. 创建重排序器（可选）
        reranker = None
        if rerank_config.api_key:
            reranker = SiliconFlowReranker(
                api_key=rerank_config.api_key,
                model_name=rerank_config.model_name,
                base_url=rerank_config.base_url,
                top_k=10
            )

        return cls(
            embedding=embedding,
            vector_store=vector_store,
            retriever=retriever,
            chunker=chunker,
            reranker=reranker,
            enable_rerank=reranker is not None,
            ocr_client=ocr_client
        )
    
    def add_document(
        self,
        source: Union[str, Path],
        doc_type: Optional[DocumentType] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        添加文档到 RAG 系统（带详细日志）

        流程：
        1. 根据文件类型选择合适的加载器
        2. 加载文档内容（PDF/图片会调用 OCR）
        3. 对文档进行分块
        4. 计算块的向量表示
        5. 存储到向量数据库

        参数：
            - source: 文档路径
            - doc_type: 文档类型（book/problem/note/other）
            - metadata: 额外元数据（包含 creator）
        返回：
            - bool: 是否添加成功
        """
        source_path = str(source)
        logger.info(f"[RAG] ========== 开始添加文档: {source_path} ==========")

        # 从 metadata 中提取 creator
        creator = metadata.get("creator", "") if metadata else ""
        logger.info(f"[RAG] 创建者: {creator}")

        try:
            # 1. 选择加载器
            logger.info(f"[RAG] Step 1/5: 选择加载器...")
            loader = self._get_loader(source)
            if loader is None:
                logger.error(f"[RAG] ❌ 不支持的文件类型: {source_path}")
                raise ValueError(f"不支持的文件类型: {source}")
            logger.info(f"[RAG] ✅ 加载器: {type(loader).__name__}")

            # 2. 加载文档
            logger.info(f"[RAG] Step 2/5: 加载文档内容...")
            if doc_type:
                loader.doc_type = doc_type
            document = loader.load(source)

            # 添加额外元数据
            if metadata:
                document.metadata.update(metadata)
                # 如果 metadata 中提供了 doc_name，更新 document.name
                if "doc_name" in metadata and metadata["doc_name"]:
                    old_name = document.name
                    document.name = metadata["doc_name"]
                    logger.info(f"[RAG] 文档名称已更新: '{old_name}' -> '{document.name}'")
                else:
                    logger.warning(f"[RAG] ⚠️ metadata 中没有提供 doc_name，使用默认名称: {document.name}")

            content_length = len(document.content) if document.content else 0
            logger.info(f"[RAG] ✅ 文档加载成功")
            logger.info(f"[RAG]    - 名称: {document.name}")
            logger.info(f"[RAG]    - 类型: {document.type.value}")
            logger.info(f"[RAG]    - 内容长度: {content_length} 字符")

            # 3. 分块
            logger.info(f"[RAG] Step 3/5: 文档分块...")
            chunks = self.chunker.split(document)
            logger.info(f"[RAG] ✅ 分块完成: {len(chunks)} 个块")

            if len(chunks) == 0:
                logger.warning(f"[RAG] ⚠️ 文档内容为空，没有生成任何块")
                return False

            # 4. 计算向量
            logger.info(f"[RAG] Step 4/5: 计算向量嵌入...")
            chunk_texts = [chunk.content for chunk in chunks]
            logger.info(f"[RAG]    - 调用 Embedding API，文本数: {len(chunk_texts)}")
            vectors = self.embedding.embed(chunk_texts)
            logger.info(f"[RAG] ✅ 向量计算完成: {len(vectors)} 个向量")

            for chunk, vector in zip(chunks, vectors):
                chunk.vector = vector
                # 添加元数据
                chunk.metadata["type"] = document.type.value
                chunk.metadata["source"] = document.source
                chunk.metadata["doc_name"] = document.name
            
            logger.info(f"[RAG] 已设置 {len(chunks)} 个 chunk 的 metadata，doc_name='{document.name}'")

            # 5. 添加到检索器（传递 creator）
            logger.info(f"[RAG] Step 5/5: 存储到向量数据库...")
            success = self.retriever.add_document(chunks, creator)

            if success:
                logger.info(f"[RAG] ✅ 文档添加成功: {document.name}")
            else:
                logger.error(f"[RAG] ❌ 文档添加失败: {document.name}")

            return success

        except Exception as e:
            logger.error(f"[RAG] ❌ 添加文档失败: {source_path}")
            logger.error(f"[RAG]    异常类型: {type(e).__name__}")
            logger.error(f"[RAG]    异常信息: {e}")
            import traceback
            logger.error(f"[RAG]    堆栈跟踪:\n{traceback.format_exc()}")
            return False
    
    def add_documents(
        self, 
        sources: List[Union[str, Path]],
        doc_type: Optional[DocumentType] = None
    ) -> Dict[str, bool]:
        """
        批量添加文档
        
        参数：
            - sources: 文档路径列表
            - doc_type: 文档类型
        返回：
            - Dict[str, bool]: 每个文档的添加结果
        """
        results = {}
        for source in sources:
            results[str(source)] = self.add_document(source, doc_type)
        return results
    
    def search(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        doc_types: Optional[List[DocumentType]] = None,
        use_rerank: Optional[bool] = None
    ) -> List[RetrievalResult]:
        """
        检索相关文档块
        
        流程：
        1. 使用混合检索器获取候选结果
        2. 如启用重排序，使用 Reranker 优化结果
        
        参数：
            - query: 查询文本
            - top_k: 返回结果数量
            - filters: 过滤条件
            - doc_types: 指定文档类型
            - use_rerank: 是否使用重排序（默认使用配置值）
        返回：
            - List[RetrievalResult]: 检索结果列表
        """
        # 构建查询
        search_query = SearchQuery(
            query=query,
            top_k=top_k * 2 if self.enable_rerank else top_k,  # 如果重排序，获取更多候选
            filters=filters,
            doc_types=doc_types
        )
        
        # 检索
        results = self.retriever.retrieve(search_query)
        
        # 重排序
        should_rerank = use_rerank if use_rerank is not None else self.enable_rerank
        if should_rerank and self.reranker and len(results) > 0:
            chunks = [r.chunk for r in results]
            reranked = self.reranker.rerank(query, chunks)
            
            # 重新构建结果
            results = []
            for rank, (chunk, score) in enumerate(reranked[:top_k], 1):
                results.append(RetrievalResult(
                    chunk=chunk,
                    score=score,
                    rank=rank,
                    retrieval_type="hybrid+rerank"
                ))
        else:
            # 截断到 top_k
            results = results[:top_k]
        
        return results
    
    def generate_context(
        self,
        query: str,
        top_k: int = 5,
        max_length: int = 3000,
        include_source: bool = True
    ) -> str:
        """
        生成检索上下文
        
        用于提供给 LLM 的上下文信息
        
        参数：
            - query: 查询文本
            - top_k: 检索结果数量
            - max_length: 最大上下文长度
            - include_source: 是否包含来源信息
        返回：
            - str: 格式化的上下文文本
        """
        results = self.search(query, top_k=top_k)
        
        if not results:
            return ""
        
        context_parts = []
        current_length = 0
        
        for i, result in enumerate(results, 1):
            chunk = result.chunk
            
            # 构建块文本
            part = f"[文档 {i}]\n"
            if include_source:
                source = chunk.metadata.get("source", "未知来源")
                doc_name = chunk.metadata.get("doc_name", "")
                part += f"来源: {doc_name or source}\n"
            part += f"内容: {chunk.content}\n"
            part += f"相关度: {result.score:.3f}\n\n"
            
            # 检查长度限制
            if current_length + len(part) > max_length:
                break
            
            context_parts.append(part)
            current_length += len(part)
        
        return "".join(context_parts)
    
    def delete_document(self, doc_id: str) -> bool:
        """
        删除文档

        参数：
            - doc_id: 文档ID
        返回：
            - bool: 是否删除成功
        """
        return self.retriever.delete_document(doc_id)

    def get_user_documents(
        self,
        user_id: str,
        include_system: bool = True,
        doc_type: Optional[DocumentType] = None
    ) -> List[Dict[str, Any]]:
        """
        获取用户的知识列表

        参数：
            - user_id: 用户ID
            - include_system: 是否包含系统知识
            - doc_type: 文档类型过滤
        返回：
            - List[Dict]: 文档信息列表
        """
        try:
            logger.info(f"[RAG] 获取用户文档列表: user_id={user_id}, include_system={include_system}")
            
            # 获取用户自己的文档
            user_docs = self.vector_store.get_documents_by_creator(
                creator=user_id,
                doc_type=doc_type.value if doc_type else None
            )
            logger.info(f"[RAG] 用户文档数量: {len(user_docs)}")

            # 标记来源
            for doc in user_docs:
                doc["is_system"] = False
                doc["owner"] = user_id

            # 如果需要系统知识
            system_docs = []
            if include_system:
                # 系统知识的 creator 为空或 "system"
                all_system = self.vector_store.get_documents_by_creator(
                    creator="system",
                    doc_type=doc_type.value if doc_type else None
                )
                logger.info(f"[RAG] 系统文档数量: {len(all_system)}")
                for doc in all_system:
                    if doc["doc_id"] not in [d["doc_id"] for d in user_docs]:
                        doc["is_system"] = True
                        doc["owner"] = "system"
                        system_docs.append(doc)

            all_docs = user_docs + system_docs
            logger.info(f"[RAG] 总文档数量: {len(all_docs)}")
            return all_docs

        except Exception as e:
            logger.error(f"[RAG] 获取用户文档失败: {e}")
            return []

    def can_delete_document(self, doc_id: str, user_id: str) -> tuple[bool, str]:
        """
        检查用户是否有权限删除文档

        参数：
            - doc_id: 文档ID
            - user_id: 用户ID
        返回：
            - (bool, str): (是否可以删除, 原因)
        """
        try:
            creator = self.vector_store.get_document_creator(doc_id)

            if creator is None:
                return False, "文档不存在"

            if creator == "system" or creator == "":
                return False, "系统知识不允许删除"

            if creator != user_id:
                return False, "只能删除自己上传的知识"

            return True, "可以删除"

        except Exception as e:
            return False, f"检查权限失败: {e}"

    def delete_user_document(self, doc_id: str, user_id: str) -> tuple[bool, str]:
        """
        用户删除自己的文档

        参数：
            - doc_id: 文档ID
            - user_id: 用户ID
        返回：
            - (bool, str): (是否成功, 消息)
        """
        # 检查权限
        can_delete, message = self.can_delete_document(doc_id, user_id)

        if not can_delete:
            return False, message

        # 执行删除
        success = self.delete_document(doc_id)

        if success:
            return True, "删除成功"
        else:
            return False, "删除失败"

    def get_document_chunks(
        self,
        doc_id: str,
        user_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        获取文档的所有分块内容

        参数：
            - doc_id: 文档ID
            - user_id: 用户ID（用于权限验证，可选）
        返回：
            - List[Dict]: 分块信息列表，每个分块包含content、metadata等
        """
        try:
            logger.info(f"[RAG] 获取文档分块: doc_id={doc_id}, user_id={user_id}")
            
            # 如果提供了user_id，验证权限
            if user_id:
                creator = self.vector_store.get_document_creator(doc_id)
                logger.info(f"[RAG] 文档创建者: {creator}")
                if creator is None:
                    logger.warning(f"[RAG] 文档不存在: {doc_id}")
                    return []
                if creator != user_id and creator != "system":
                    logger.warning(f"[RAG] 无权访问文档: {doc_id}, creator={creator}, user_id={user_id}")
                    return []  # 无权访问

            # 获取所有chunks
            chunks = self.vector_store.get_all_chunks_by_doc_id(doc_id)
            logger.info(f"[RAG] 获取到chunks数量: {len(chunks)}")

            # 转换为可序列化的格式
            result = []
            for i, chunk in enumerate(chunks):
                result.append({
                    "index": i + 1,
                    "chunk_id": chunk.id,
                    "doc_id": chunk.doc_id,
                    "content": chunk.content,
                    "metadata": chunk.metadata,
                    "start_pos": chunk.start_pos,
                    "end_pos": chunk.end_pos
                })

            return result

        except Exception as e:
            logger.error(f"[RAG] 获取文档分块失败: {e}")
            return []

    def _get_loader(self, source: Union[str, Path]) -> Optional[BaseLoader]:
        """
        根据文件类型获取合适的加载器
        
        参数：
            - source: 文件路径
        返回：
            - BaseLoader: 加载器实例，不支持则返回 None
        """
        for loader in self._loaders:
            if loader.supports(source):
                return loader
        return None
    
    def register_loader(self, loader: BaseLoader):
        """
        注册自定义加载器
        
        参数：
            - loader: 加载器实例
        """
        self._loaders.insert(0, loader)
    
    def set_ocr_client(self, ocr_client: Callable):
        """
        设置/更新 OCR 客户端
        
        参数：
            - ocr_client: OCR 客户端函数
        """
        self.ocr_client = ocr_client
        # 重新初始化加载器以使用新的 OCR 客户端
        self._init_loaders()
    
    def close(self):
        """关闭资源"""
        self.vector_store.close()
