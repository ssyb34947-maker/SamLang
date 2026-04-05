"""
文本文件加载器
支持 txt, md, json, jsonl 等文本格式
"""

import json
import uuid
from pathlib import Path
from typing import Union
from datetime import datetime

from .base import BaseLoader
from ..core.schemas import Document, DocumentType


class TextLoader(BaseLoader):
    """
    纯文本加载器
    
    功能：加载 .txt, .md 等纯文本文件
    """
    
    SUPPORTED_EXTENSIONS = {'.txt', '.md', '.markdown', '.rst'}
    
    def __init__(self, doc_type: DocumentType = DocumentType.NOTE, encoding: str = 'utf-8'):
        super().__init__(doc_type)
        self.encoding = encoding
    
    def load(self, source: Union[str, Path]) -> Document:
        """加载文本文件"""
        source = Path(source)
        
        if not source.exists():
            raise FileNotFoundError(f"文件不存在：{source}")
        
        content = source.read_text(encoding=self.encoding)
        
        return Document(
            id=str(uuid.uuid4()),
            source=str(source),
            name=source.stem,
            content=content,
            type=self.doc_type,
            metadata={
                "file_type": source.suffix.lower(),
                "file_size": source.stat().st_size,
                "encoding": self.encoding,
            },
            create_time=datetime.now(),
            update_time=datetime.now()
        )
    
    def supports(self, source: Union[str, Path]) -> bool:
        """检查是否为支持的文本文件"""
        source = Path(source)
        return source.suffix.lower() in self.SUPPORTED_EXTENSIONS


class JSONLoader(BaseLoader):
    """
    JSON/JSONL 加载器
    
    功能：加载 JSON 或 JSONL 格式的文档
    """
    
    def __init__(
        self, 
        doc_type: DocumentType = DocumentType.PROBLEM,
        content_key: str = "content",
        name_key: str = "name",
        jq_schema: str = None
    ):
        super().__init__(doc_type)
        self.content_key = content_key
        self.name_key = name_key
        self.jq_schema = jq_schema
    
    def load(self, source: Union[str, Path]) -> Document:
        """加载 JSON/JSONL 文件"""
        source = Path(source)
        
        if not source.exists():
            raise FileNotFoundError(f"文件不存在：{source}")
        
        content_parts = []
        metadata_list = []
        
        with open(source, 'r', encoding='utf-8') as f:
            if source.suffix.lower() == '.jsonl':
                # JSONL 格式：每行一个 JSON 对象
                for line in f:
                    line = line.strip()
                    if line:
                        data = json.loads(line)
                        content_parts.append(self._extract_content(data))
                        metadata_list.append(data)
            else:
                # JSON 格式
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        content_parts.append(self._extract_content(item))
                        metadata_list.append(item)
                else:
                    content_parts.append(self._extract_content(data))
                    metadata_list.append(data)
        
        full_content = "\n\n".join(content_parts)
        
        return Document(
            id=str(uuid.uuid4()),
            source=str(source),
            name=source.stem,
            content=full_content,
            type=self.doc_type,
            metadata={
                "file_type": source.suffix.lower(),
                "items_count": len(content_parts),
                "items": metadata_list,
            },
            create_time=datetime.now(),
            update_time=datetime.now()
        )
    
    def _extract_content(self, data: dict) -> str:
        """从 JSON 数据中提取内容"""
        if isinstance(data, dict):
            if self.content_key in data:
                return str(data[self.content_key])
            # 如果没有指定 key，尝试合并所有字符串值
            return "\n".join(str(v) for v in data.values() if isinstance(v, str))
        return str(data)
    
    def supports(self, source: Union[str, Path]) -> bool:
        """检查是否为 JSON/JSONL 文件"""
        source = Path(source)
        return source.suffix.lower() in {'.json', '.jsonl'}
