"""
混合检索器
结合向量检索和 BM25 关键词检索
"""

import math
import re
from collections import defaultdict
from typing import List, Optional, Dict, Any, Set, Tuple

from .base import BaseRetriever
from ..core.schemas import Chunk, RetrievalResult, SearchQuery, DocumentType
from ..embedding.base import BaseEmbedding
from ..vector_store.base import BaseVectorStore


class BM25Index:
    """
    内存中的 BM25 索引
    
    用于关键词检索
    """
    
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        """
        初始化 BM25 索引
        
        参数：
            - k1: 词频饱和参数
            - b: 文档长度归一化参数
        """
        self.k1 = k1
        self.b = b
        
        # 文档数据
        self.documents: Dict[str, str] = {}  # chunk_id -> content
        self.doc_lengths: Dict[str, int] = {}  # chunk_id -> token count
        
        # 倒排索引: term -> {chunk_id: tf}
        self.inverted_index: Dict[str, Dict[str, int]] = defaultdict(dict)
        
        # 统计信息
        self.total_docs = 0
        self.avg_doc_length = 0.0
        self.idf: Dict[str, float] = {}
    
    def add_document(self, chunk_id: str, content: str):
        """添加文档到索引"""
        # 分词（简单实现：按非字符分割）
        tokens = self._tokenize(content)
        
        self.documents[chunk_id] = content
        self.doc_lengths[chunk_id] = len(tokens)
        
        # 统计词频
        term_freq = defaultdict(int)
        for token in tokens:
            term_freq[token] += 1
        
        # 更新倒排索引
        for term, freq in term_freq.items():
            self.inverted_index[term][chunk_id] = freq
        
        self.total_docs += 1
        self._update_stats()
    
    def remove_document(self, chunk_id: str):
        """从索引中移除文档"""
        if chunk_id not in self.documents:
            return
        
        content = self.documents[chunk_id]
        tokens = self._tokenize(content)
        
        # 从倒排索引中移除
        for token in set(tokens):
            if chunk_id in self.inverted_index[token]:
                del self.inverted_index[token][chunk_id]
        
        del self.documents[chunk_id]
        del self.doc_lengths[chunk_id]
        self.total_docs -= 1
        self._update_stats()
    
    def _tokenize(self, text: str) -> List[str]:
        """简单的中文分词（按字符和英文单词）"""
        # 保留中文字符和英文单词
        tokens = re.findall(r'[\u4e00-\u9fa5]|[a-zA-Z]+', text.lower())
        return tokens
    
    def _update_stats(self):
        """更新统计信息"""
        if self.total_docs == 0:
            self.avg_doc_length = 0.0
            self.idf = {}
            return
        
        # 平均文档长度
        total_length = sum(self.doc_lengths.values())
        self.avg_doc_length = total_length / self.total_docs
        
        # 计算 IDF
        self.idf = {}
        for term, postings in self.inverted_index.items():
            df = len(postings)  # 包含该词的文档数
            # BM25 IDF 公式
            self.idf[term] = math.log(
                (self.total_docs - df + 0.5) / (df + 0.5) + 1
            )
    
    def search(self, query: str, top_k: int = 10) -> List[Tuple[str, float]]:
        """
        BM25 搜索
        
        输入：
            - query: 查询文本
            - top_k: 返回结果数量
        输出：
            - List[Tuple[str, float]]: (chunk_id, score) 列表
        """
        if not self.documents:
            return []
        
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []
        
        scores = defaultdict(float)
        
        for term in query_tokens:
            if term not in self.inverted_index:
                continue
            
            idf = self.idf.get(term, 0)
            postings = self.inverted_index[term]
            
            for chunk_id, tf in postings.items():
                doc_length = self.doc_lengths[chunk_id]
                
                # BM25 分数计算
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (
                    1 - self.b + self.b * doc_length / self.avg_doc_length
                )
                
                scores[chunk_id] += idf * numerator / denominator
        
        # 排序并返回 top_k
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_scores[:top_k]


class HybridRetriever(BaseRetriever):
    """
    混合检索器
    
    结合向量检索和 BM25 关键词检索
    权重：向量检索 0.75，BM25 检索 0.25
    
    流程：
    1. 同时进行向量检索和 BM25 检索
    2. 对两组结果进行加权融合
    3. 返回融合后的排序结果
    """
    
    def __init__(
        self,
        embedding_model: BaseEmbedding,
        vector_store: BaseVectorStore,
        top_k: int = 10,
        vector_weight: float = 0.75,
        bm25_weight: float = 0.25,
        bm25_k1: float = 1.5,
        bm25_b: float = 0.75
    ):
        super().__init__(top_k)
        self.embedding_model = embedding_model
        self.vector_store = vector_store
        self.vector_weight = vector_weight
        self.bm25_weight = bm25_weight
        
        # BM25 内存索引
        self.bm25_index = BM25Index(k1=bm25_k1, b=bm25_b)
        
        # 缓存 chunk 数据
        self._chunk_cache: Dict[str, Chunk] = {}
    
    def add_document(self, chunks: List[Chunk], creator: str = "") -> bool:
        """
        添加文档块到检索索引

        同时更新向量存储和 BM25 索引

        Args:
            chunks: 文档块列表
            creator: 创建者用户ID
        """
        if not chunks:
            return True

        try:
            # 1. 添加到向量存储（传递 creator）
            success = self.vector_store.add_chunks(chunks, creator)
            if not success:
                return False

            # 2. 添加到 BM25 索引
            for chunk in chunks:
                self.bm25_index.add_document(chunk.id, chunk.content)
                self._chunk_cache[chunk.id] = chunk

            return True

        except Exception as e:
            print(f"添加文档到检索器失败: {e}")
            return False
    
    def retrieve(self, query: SearchQuery) -> List[RetrievalResult]:
        """
        混合检索
        
        流程：
        1. 向量检索获取候选
        2. BM25 检索获取候选
        3. 加权融合排序
        4. 返回 top_k 结果
        """
        # 1. 获取查询向量
        query_vector = self.embedding_model.embed_query(query.query)
        
        # 2. 构建过滤条件
        filters = query.filters or {}
        if query.doc_types:
            filters["type"] = [t.value for t in query.doc_types]
        
        # 3. 向量检索
        vector_results = self._vector_search(
            query_vector, 
            top_k=query.top_k * 2,  # 获取更多候选用于融合
            filters=filters
        )
        
        # 4. BM25 检索
        bm25_results = self._bm25_search(
            query.query,
            top_k=query.top_k * 2
        )
        
        # 5. 融合排序
        fused_results = self._fuse_results(
            vector_results, 
            bm25_results,
            query.top_k
        )
        
        return fused_results
    
    def _vector_search(
        self, 
        query_vector: List[float], 
        top_k: int,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, float]:
        """向量检索"""
        results = self.vector_store.search(
            query_vector=query_vector,
            top_k=top_k,
            filters=filters
        )
        
        # 转换为字典: chunk_id -> score
        # Milvus 返回的是余弦相似度，已经是 0-1 范围
        return {chunk_id: score for chunk_id, score in results}
    
    def _bm25_search(self, query: str, top_k: int) -> Dict[str, float]:
        """BM25 检索"""
        results = self.bm25_index.search(query, top_k=top_k)
        
        # 转换为字典: chunk_id -> score
        # BM25 分数需要归一化
        if not results:
            return {}
        
        max_score = max(score for _, score in results) if results else 1.0
        if max_score == 0:
            max_score = 1.0
        
        return {chunk_id: score / max_score for chunk_id, score in results}
    
    def _fuse_results(
        self,
        vector_results: Dict[str, float],
        bm25_results: Dict[str, float],
        top_k: int
    ) -> List[RetrievalResult]:
        """
        融合向量检索和 BM25 检索结果
        
        使用加权求和：final_score = w1 * vector_score + w2 * bm25_score
        """
        # 收集所有候选 ID
        all_ids = set(vector_results.keys()) | set(bm25_results.keys())
        
        # 计算融合分数
        fused_scores = {}
        for chunk_id in all_ids:
            v_score = vector_results.get(chunk_id, 0.0)
            b_score = bm25_results.get(chunk_id, 0.0)
            
            # 加权融合
            final_score = (
                self.vector_weight * v_score + 
                self.bm25_weight * b_score
            )
            fused_scores[chunk_id] = final_score
        
        # 排序
        sorted_results = sorted(
            fused_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:top_k]
        
        # 构建 RetrievalResult
        results = []
        for rank, (chunk_id, score) in enumerate(sorted_results, 1):
            chunk = self._get_chunk(chunk_id)
            if chunk:
                results.append(RetrievalResult(
                    chunk=chunk,
                    score=score,
                    rank=rank,
                    retrieval_type="hybrid"
                ))
        
        return results
    
    def _get_chunk(self, chunk_id: str) -> Optional[Chunk]:
        """获取块数据（优先从缓存，否则从存储）"""
        if chunk_id in self._chunk_cache:
            return self._chunk_cache[chunk_id]
        
        chunk = self.vector_store.get_chunk_by_id(chunk_id)
        if chunk:
            self._chunk_cache[chunk_id] = chunk
        
        return chunk
    
    def delete_document(self, doc_id: str) -> bool:
        """删除文档及其所有块"""
        try:
            # 1. 从向量存储删除
            success = self.vector_store.delete_by_doc_id(doc_id)
            if not success:
                return False
            
            # 2. 从 BM25 索引和缓存中删除
            chunks_to_remove = [
                chunk_id for chunk_id, chunk in self._chunk_cache.items()
                if chunk.doc_id == doc_id
            ]
            
            for chunk_id in chunks_to_remove:
                self.bm25_index.remove_document(chunk_id)
                del self._chunk_cache[chunk_id]
            
            return True
            
        except Exception as e:
            print(f"删除文档失败: {e}")
            return False
