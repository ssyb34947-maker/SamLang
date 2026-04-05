"""
PDF 文档加载器
直接通过 OCR 识别 PDF 内容
"""

import uuid
from pathlib import Path
from typing import Union, Optional, Callable
from datetime import datetime

from .base import BaseLoader
from ..core.schemas import Document, DocumentType


class PDFLoader(BaseLoader):
    """
    PDF 文档加载器
    
    功能：直接调用 OCR 客户端识别 PDF 内容
    
    依赖：OCR 客户端（外部提供，推荐使用 src.ocr.OCRClient）
    
    输出格式：Markdown
    """
    
    def __init__(
        self, 
        doc_type: DocumentType = DocumentType.BOOK,
        ocr_client: Optional[Callable] = None
    ):
        """
        初始化 PDF 加载器
        
        参数：
            - doc_type: 文档类型
            - ocr_client: OCR 客户端，接收文件路径，返回 markdown 文本
                         推荐使用 src.ocr.OCRClient.recognize 方法
        """
        super().__init__(doc_type)
        self.ocr_client = ocr_client
    
    def load(self, source: Union[str, Path]) -> Document:
        """
        加载 PDF 文档
        
        流程：直接调用 OCR 客户端识别整个 PDF 文件
        
        输入：PDF 文件路径
        输出：Document 对象（content 为 Markdown 格式）
        """
        source = Path(source)
        
        if not source.exists():
            raise FileNotFoundError(f"文件不存在：{source}")
        
        if not self.ocr_client:
            raise ValueError("PDF 加载需要提供 OCR 客户端")
        
        # 直接调用 OCR 识别整个 PDF
        try:
            content = self._recognize_with_ocr(source)
        except Exception as e:
            raise RuntimeError(f"OCR 识别失败: {e}")
        
        return Document(
            id=str(uuid.uuid4()),
            source=str(source),
            name=source.stem,
            content=content,
            type=self.doc_type,
            metadata={
                "file_type": "pdf",
                "file_size": source.stat().st_size,
                "format": "markdown",
                "ocr_used": True
            },
            create_time=datetime.now(),
            update_time=datetime.now()
        )
    
    def _recognize_with_ocr(self, source: Path) -> str:
        """
        使用 OCR 识别 PDF 内容
        
        调用配置的 ocr_client 进行识别
        """
        try:
            # 调用 OCR 客户端
            if hasattr(self.ocr_client, 'recognize'):
                result = self.ocr_client.recognize(str(source))
            else:
                # 直接调用函数
                result = self.ocr_client(str(source))
            
            return result or ""
            
        except Exception as e:
            raise RuntimeError(f"OCR 调用失败: {e}")
    
    def supports(self, source: Union[str, Path]) -> bool:
        """检查是否为 PDF 文件"""
        source = Path(source)
        return source.suffix.lower() == '.pdf'
