"""
递归文本分块器
使用递归方式按分隔符进行分块，保持语义完整性
"""

import re
from typing import List

from .base import BaseChunker
from ..core.schemas import Document, Chunk


class RecursiveChunker(BaseChunker):
    """
    递归文本分块器
    
    功能：
    - 优先按段落分割
    - 段落过长则按句子分割
    - 句子过长则按固定长度分割
    - 保持 10% 的重叠
    
    分隔符优先级：\n\n > \n > 。 > ； > 空格
    """
    
    DEFAULT_SEPARATORS = ["\n\n", "\n", "。", "；", "；", " ", ""]
    
    def __init__(
        self, 
        chunk_size: int = 512, 
        chunk_overlap: float = 0.1,
        separators: List[str] = None
    ):
        super().__init__(chunk_size, chunk_overlap)
        self.separators = separators or self.DEFAULT_SEPARATORS
    
    def split(self, document: Document) -> List[Chunk]:
        """
        递归分块文档
        
        算法：
        1. 尝试用当前分隔符分割文本
        2. 如果某段超过 chunk_size，用下一个更细粒度的分隔符分割
        3. 如果所有分隔符都试过仍超长，则强制截断
        4. 添加重叠内容
        """
        chunks = []
        chunk_index = 0
        
        # 首先按第一个分隔符分割
        initial_splits = self._split_by_separator(document.content, self.separators[0])
        
        for split in initial_splits:
            split_chunks = self._recursive_split(
                split, 
                document.id, 
                chunk_index, 
                0  # 从第一个分隔符开始
            )
            chunks.extend(split_chunks)
            chunk_index += len(split_chunks)
        
        # 添加重叠
        chunks = self._add_overlap(chunks)
        
        return chunks
    
    def _recursive_split(
        self, 
        text: str, 
        doc_id: str, 
        start_index: int, 
        separator_idx: int
    ) -> List[Chunk]:
        """
        递归分割文本
        
        参数：
            - text: 要分割的文本
            - doc_id: 文档ID
            - start_index: 起始块索引
            - separator_idx: 当前使用的分隔符索引
        """
        chunks = []
        
        # 如果文本长度在限制内，直接返回
        if len(text) <= self.chunk_size:
            chunk = Chunk(
                id=self._generate_chunk_id(doc_id, start_index),
                doc_id=doc_id,
                content=text.strip(),
                start_pos=0,
                end_pos=len(text)
            )
            return [chunk]
        
        # 如果还有更细粒度的分隔符，尝试使用
        if separator_idx < len(self.separators) - 1:
            separator = self.separators[separator_idx]
            sub_splits = self._split_by_separator(text, separator)
            
            current_chunk_text = ""
            current_start = 0
            chunk_index = start_index
            
            for sub_split in sub_splits:
                # 如果当前子分割可以加入当前块
                if len(current_chunk_text) + len(sub_split) <= self.chunk_size:
                    if current_chunk_text:
                        current_chunk_text += separator
                    current_chunk_text += sub_split
                else:
                    # 保存当前块
                    if current_chunk_text:
                        chunks.append(Chunk(
                            id=self._generate_chunk_id(doc_id, chunk_index),
                            doc_id=doc_id,
                            content=current_chunk_text.strip(),
                            start_pos=current_start,
                            end_pos=current_start + len(current_chunk_text)
                        ))
                        chunk_index += 1
                    
                    # 如果子分割本身还超长，递归分割
                    if len(sub_split) > self.chunk_size:
                        sub_chunks = self._recursive_split(
                            sub_split, doc_id, chunk_index, separator_idx + 1
                        )
                        chunks.extend(sub_chunks)
                        chunk_index += len(sub_chunks)
                        current_chunk_text = ""
                    else:
                        current_chunk_text = sub_split
                        current_start = text.find(sub_split, current_start)
            
            # 处理最后一个块
            if current_chunk_text:
                chunks.append(Chunk(
                    id=self._generate_chunk_id(doc_id, chunk_index),
                    doc_id=doc_id,
                    content=current_chunk_text.strip(),
                    start_pos=current_start,
                    end_pos=current_start + len(current_chunk_text)
                ))
        else:
            # 没有更细的分隔符了，强制截断
            chunks = self._force_split(text, doc_id, start_index)
        
        return chunks
    
    def _split_by_separator(self, text: str, separator: str) -> List[str]:
        """按分隔符分割文本"""
        if not separator:
            return list(text)
        return [s for s in text.split(separator) if s.strip()]
    
    def _force_split(self, text: str, doc_id: str, start_index: int) -> List[Chunk]:
        """强制按固定长度分割（最后的手段）"""
        chunks = []
        for i in range(0, len(text), self.chunk_size):
            chunk_text = text[i:i + self.chunk_size].strip()
            if chunk_text:
                chunks.append(Chunk(
                    id=self._generate_chunk_id(doc_id, start_index + len(chunks)),
                    doc_id=doc_id,
                    content=chunk_text,
                    start_pos=i,
                    end_pos=min(i + self.chunk_size, len(text))
                ))
        return chunks
    
    def _add_overlap(self, chunks: List[Chunk]) -> List[Chunk]:
        """为块添加重叠内容"""
        if len(chunks) <= 1 or self.overlap_size == 0:
            return chunks
        
        for i in range(1, len(chunks)):
            prev_chunk = chunks[i - 1]
            current_chunk = chunks[i]
            
            # 从前一个块末尾取重叠内容
            overlap_text = prev_chunk.content[-self.overlap_size:]
            if overlap_text:
                current_chunk.content = overlap_text + current_chunk.content
        
        return chunks
