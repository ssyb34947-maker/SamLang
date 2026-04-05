"""
Word 文档加载器
支持 .doc 和 .docx 格式
"""

import uuid
from pathlib import Path
from typing import Union
from datetime import datetime

try:
    import docx
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

try:
    import olefile
    OLE_SUPPORT = True
except ImportError:
    OLE_SUPPORT = False

from .base import BaseLoader
from ..core.schemas import Document, DocumentType


class WordLoader(BaseLoader):
    """
    Word 文档加载器
    
    功能：加载 .docx 和 .doc 文件内容
    依赖：python-docx (for .docx), olefile (for .doc)
    
    输出格式：Markdown
    - 标题转换为 # 格式
    - 表格转换为 Markdown 表格
    - 段落保持文本格式
    """
    
    SUPPORTED_EXTENSIONS = {'.docx', '.doc'}
    
    def __init__(self, doc_type: DocumentType = DocumentType.BOOK, encoding: str = 'utf-8'):
        super().__init__(doc_type)
        self.encoding = encoding
    
    def load(self, source: Union[str, Path]) -> Document:
        """
        加载 Word 文档
        
        输入：Word 文件路径
        输出：Document 对象（content 为 Markdown 格式）
        """
        source = Path(source)
        
        if not source.exists():
            raise FileNotFoundError(f"文件不存在：{source}")
        
        suffix = source.suffix.lower()
        
        if suffix == '.docx':
            if not DOCX_SUPPORT:
                raise ImportError(
                    "DOCX 加载需要 python-docx。"
                    "请安装：pip install python-docx"
                )
            content = self._load_docx(source)
        elif suffix == '.doc':
            content = self._load_doc(source)
        else:
            raise ValueError(f"不支持的 Word 格式：{suffix}")
        
        return Document(
            id=str(uuid.uuid4()),
            source=str(source),
            name=source.stem,
            content=content,
            type=self.doc_type,
            metadata={
                "file_type": suffix,
                "file_size": source.stat().st_size,
                "format": "markdown"
            },
            create_time=datetime.now(),
            update_time=datetime.now()
        )
    
    def _load_docx(self, source: Path) -> str:
        """加载 .docx 文件并转换为 Markdown"""
        import docx
        
        doc = docx.Document(source)
        md_parts = []
        
        # 处理段落和表格
        for element in doc.element.body:
            if element.tag.endswith('p'):  # 段落
                paragraph = docx.text.paragraph.Paragraph(element, doc)
                md_text = self._paragraph_to_md(paragraph)
                if md_text:
                    md_parts.append(md_text)
            elif element.tag.endswith('tbl'):  # 表格
                table = docx.table.Table(element, doc)
                md_table = self._table_to_md(table)
                if md_table:
                    md_parts.append(md_table)
        
        return "\n\n".join(md_parts)
    
    def _paragraph_to_md(self, paragraph) -> str:
        """将段落转换为 Markdown"""
        text = paragraph.text.strip()
        if not text:
            return ""
        
        # 判断标题级别（通过样式名称）
        style_name = paragraph.style.name.lower() if paragraph.style else ""
        
        if 'heading 1' in style_name or '标题 1' in style_name:
            return f"# {text}"
        elif 'heading 2' in style_name or '标题 2' in style_name:
            return f"## {text}"
        elif 'heading 3' in style_name or '标题 3' in style_name:
            return f"### {text}"
        elif 'heading 4' in style_name or '标题 4' in style_name:
            return f"#### {text}"
        elif 'heading 5' in style_name or '标题 5' in style_name:
            return f"##### {text}"
        elif 'heading 6' in style_name or '标题 6' in style_name:
            return f"###### {text}"
        
        # 处理粗体和斜体
        md_text = ""
        for run in paragraph.runs:
            run_text = run.text
            if run.bold and run.italic:
                run_text = f"***{run_text}***"
            elif run.bold:
                run_text = f"**{run_text}**"
            elif run.italic:
                run_text = f"*{run_text}*"
            md_text += run_text
        
        return md_text if md_text else text
    
    def _table_to_md(self, table) -> str:
        """将表格转换为 Markdown 格式"""
        if not table.rows:
            return ""
        
        md_lines = []
        
        # 表头
        header_cells = [cell.text.strip() for cell in table.rows[0].cells]
        md_lines.append("| " + " | ".join(header_cells) + " |")
        md_lines.append("| " + " | ".join(["---"] * len(header_cells)) + " |")
        
        # 数据行
        for row in table.rows[1:]:
            cells = [cell.text.strip() for cell in row.cells]
            md_lines.append("| " + " | ".join(cells) + " |")
        
        return "\n".join(md_lines)
    
    def _load_doc(self, source: Path) -> str:
        """加载 .doc 文件（旧格式）"""
        # 尝试使用 antiword 或 textract
        try:
            import subprocess
            result = subprocess.run(
                ['antiword', str(source)],
                capture_output=True,
                text=True,
                encoding=self.encoding
            )
            if result.returncode == 0:
                return result.stdout
        except (FileNotFoundError, subprocess.SubprocessError):
            pass
        
        # 尝试使用 olefile 提取文本
        if OLE_SUPPORT:
            return self._load_doc_with_ole(source)
        
        raise ImportError(
            "DOC 格式需要额外工具。"
            "请安装：pip install olefile "
            "或安装 antiword: apt-get install antiword"
        )
    
    def _load_doc_with_ole(self, source: Path) -> str:
        """使用 olefile 从 .doc 中提取文本"""
        import olefile
        
        ole = olefile.OleFileIO(source)
        
        # 尝试读取 WordDocument 流
        if ole.exists('WordDocument'):
            data = ole.openstream('WordDocument').read()
            # 简单提取可打印字符
            text = ""
            for i in range(0, len(data) - 1, 2):
                try:
                    char = data[i:i+2].decode('utf-16-le', errors='ignore')
                    if char.isprintable() or char in '\n\r\t':
                        text += char
                except:
                    pass
            ole.close()
            return text
        
        ole.close()
        return ""
    
    def supports(self, source: Union[str, Path]) -> bool:
        """检查是否为 Word 文件"""
        source = Path(source)
        return source.suffix.lower() in self.SUPPORTED_EXTENSIONS
