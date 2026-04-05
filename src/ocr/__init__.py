"""
OCR 模块
提供图片和PDF的文本识别功能
"""

from .ocr import OCRClient, get_ocr_client

__all__ = ["OCRClient", "get_ocr_client"]
