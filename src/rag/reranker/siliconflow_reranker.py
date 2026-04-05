"""
硅基流动 Reranker 实现
使用 SiliconFlow API 进行重排序
"""

import requests
from typing import List, Tuple

from .base import BaseReranker
from ..core.schemas import Chunk


class SiliconFlowReranker(BaseReranker):
    """
    硅基流动 Reranker 模型
    
    功能：调用 SiliconFlow API 对检索结果进行重排序
    默认模型：BAAI/bge-reranker-v2-m3
    
    特点：
    - 专门用于重排序任务
    - 可以更准确地判断 query 和 document 的相关性
    """
    
    def __init__(
        self, 
        api_key: str,
        model_name: str = "BAAI/bge-reranker-v2-m3",
        base_url: str = "https://api.siliconflow.cn/v1",
        top_k: int = 10
    ):
        super().__init__(model_name, top_k)
        self.api_key = api_key
        self.rerank_url = base_url.rstrip('/')
    
    def rerank(
        self, 
        query: str, 
        chunks: List[Chunk],
        initial_scores: List[float] = None
    ) -> List[Tuple[Chunk, float]]:
        """
        对块进行重排序
        
        输入：
            - query: 查询文本
            - chunks: 候选块列表
            - initial_scores: 初始分数（可选，当前未使用）
        输出：
            - List[Tuple[Chunk, float]]: (块, 相关性分数) 列表
        """
        if not chunks:
            return []
        
        # 准备文档列表
        documents = [chunk.content for chunk in chunks]
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model_name,
            "query": query,
            "documents": documents,
            "top_n": min(self.top_k, len(chunks)),
            "return_documents": False  # 只返回分数和索引
        }
        
        try:
            response = requests.post(
                self.rerank_url,
                headers=headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            
            data = response.json()
            
            # 解析结果
            results = []
            for item in data.get("results", []):
                index = item.get("index", 0)
                score = item.get("relevance_score", 0.0)
                
                if 0 <= index < len(chunks):
                    results.append((chunks[index], float(score)))
            
            # 按分数降序排列
            results.sort(key=lambda x: x[1], reverse=True)
            
            return results
            
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Reranker API 调用失败: {e}")
        except (KeyError, IndexError) as e:
            raise ValueError(f"解析 Reranker 结果失败: {e}")
