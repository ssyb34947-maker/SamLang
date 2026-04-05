"""
文档加载器模块

支持的格式：
- PDF (.pdf) - 支持文本提取和 OCR
- Word (.docx, .doc) - 转换为 Markdown
- 文本 (.txt, .md) - 纯文本
- JSON (.json, .jsonl) - 结构化数据
- CSV (.csv) - 表格数据，转换为 Markdown 表格
- Excel (.xlsx, .xls) - 表格数据，转换为 Markdown 表格
- 图片 (.png, .jpg, .jpeg, .gif, .bmp, .tiff, .webp) - 通过 OCR 识别
"""

from .base import BaseLoader
from .pdf_loader import PDFLoader
from .word_loader import WordLoader
from .text_loader import TextLoader, JSONLoader
from .excel_loader import CSVLoader, ExcelLoader
from .image_loader import ImageLoader

__all__ = [
    "BaseLoader",
    "PDFLoader",
    "WordLoader",
    "TextLoader",
    "JSONLoader",
    "CSVLoader",
    "ExcelLoader",
    "ImageLoader",
]
