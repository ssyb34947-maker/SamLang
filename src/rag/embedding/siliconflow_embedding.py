"""
硅基流动 Embedding 实现
使用 SiliconFlow API 进行文本向量化
"""

import requests
from typing import List

from .base import BaseEmbedding


class SiliconFlowEmbedding(BaseEmbedding):
    """
    硅基流动 Embedding 模型
    
    功能：调用 SiliconFlow API 将文本转换为向量
    默认模型：BAAI/bge-large-zh-v1.5
    
    特点：
    - 免费额度充足
    - 中文效果优秀
    - 向量维度：1024
    """
    
    def __init__(
        self,
        api_key: str,
        model_name: str = "BAAI/bge-large-zh-v1.5",
        base_url: str = "https://api.siliconflow.cn/v1/embeddings",
        vector_dim: int = 1024
    ):
        super().__init__(model_name, vector_dim)
        self.api_key = api_key
        self.embed_url = base_url.rstrip('/')
    
    def embed(self, texts: List[str]) -> List[List[float]]:
        """
        批量获取文本的向量表示
        
        输入：文本列表
        输出：向量列表
        """
        if not texts:
            return []
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        vectors = []
        
        # SiliconFlow API 支持批量，但为保险起见，分批处理
        batch_size = 10
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            payload = {
                "model": self.model_name,
                "input": batch,
                "encoding_format": "float"
            }
            
            try:
                response = requests.post(
                    self.embed_url,
                    headers=headers,
                    json=payload,
                    timeout=60
                )
                response.raise_for_status()
                
                data = response.json()
                
                # 解析返回的向量
                if "data" in data:
                    for item in data["data"]:
                        vectors.append(item["embedding"])
                else:
                    raise ValueError(f"API 返回格式错误: {data}")
                    
            except requests.exceptions.RequestException as e:
                raise RuntimeError(f"Embedding API 调用失败: {e}")
            except (KeyError, IndexError) as e:
                raise ValueError(f"解析 Embedding 结果失败: {e}")
        
        return vectors
    
    def embed_query(self, query: str) -> List[float]:
        """
        获取查询文本的向量表示
        
        对于查询，添加指令前缀以获得更好的检索效果
        """
        # BGE 模型推荐使用指令前缀
        instruction = "为这个句子生成表示以用于检索相关文章："
        query_with_instruction = f"{instruction}{query}"
        return super().embed_query(query_with_instruction)
