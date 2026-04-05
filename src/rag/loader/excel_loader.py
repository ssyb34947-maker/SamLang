"""
CSV 和 Excel 加载器
支持 .csv, .xlsx, .xls 格式
输出 Markdown 表格
"""

import uuid
import csv
from pathlib import Path
from typing import Union, List
from datetime import datetime

try:
    import pandas as pd
    PANDAS_SUPPORT = True
except ImportError:
    PANDAS_SUPPORT = False

try:
    import openpyxl
    OPENPYXL_SUPPORT = True
except ImportError:
    OPENPYXL_SUPPORT = False

from .base import BaseLoader
from ..core.schemas import Document, DocumentType


class CSVLoader(BaseLoader):
    """
    CSV 文件加载器
    
    功能：加载 CSV 文件并转换为 Markdown 表格
    依赖：标准库 csv
    """
    
    def __init__(
        self, 
        doc_type: DocumentType = DocumentType.OTHER,
        encoding: str = 'utf-8',
        delimiter: str = None
    ):
        super().__init__(doc_type)
        self.encoding = encoding
        self.delimiter = delimiter
    
    def load(self, source: Union[str, Path]) -> Document:
        """加载 CSV 文件"""
        source = Path(source)
        
        if not source.exists():
            raise FileNotFoundError(f"文件不存在：{source}")
        
        content = self._load_csv(source)
        
        return Document(
            id=str(uuid.uuid4()),
            source=str(source),
            name=source.stem,
            content=content,
            type=self.doc_type,
            metadata={
                "file_type": ".csv",
                "file_size": source.stat().st_size,
                "format": "markdown",
                "encoding": self.encoding
            },
            create_time=datetime.now(),
            update_time=datetime.now()
        )
    
    def _load_csv(self, source: Path) -> str:
        """读取 CSV 并转换为 Markdown"""
        # 自动检测分隔符
        delimiter = self.delimiter
        if delimiter is None:
            delimiter = self._detect_delimiter(source)
        
        rows = []
        with open(source, 'r', encoding=self.encoding, errors='replace') as f:
            reader = csv.reader(f, delimiter=delimiter)
            for row in reader:
                rows.append(row)
        
        return self._rows_to_markdown(rows)
    
    def _detect_delimiter(self, source: Path) -> str:
        """检测 CSV 分隔符"""
        with open(source, 'r', encoding=self.encoding, errors='replace') as f:
            first_line = f.readline()
            # 常见分隔符
            delimiters = [',', '\t', ';', '|']
            counts = {d: first_line.count(d) for d in delimiters}
            return max(counts, key=counts.get)
    
    def _rows_to_markdown(self, rows: List[List[str]]) -> str:
        """将行数据转换为 Markdown 表格"""
        if not rows:
            return ""
        
        md_lines = []
        
        # 表头
        header = rows[0]
        md_lines.append("| " + " | ".join(header) + " |")
        md_lines.append("| " + " | ".join(["---"] * len(header)) + " |")
        
        # 数据行
        for row in rows[1:]:
            # 补齐列数
            while len(row) < len(header):
                row.append("")
            md_lines.append("| " + " | ".join(row[:len(header)]) + " |")
        
        return "\n".join(md_lines)
    
    def supports(self, source: Union[str, Path]) -> bool:
        """检查是否为 CSV 文件"""
        source = Path(source)
        return source.suffix.lower() == '.csv'


class ExcelLoader(BaseLoader):
    """
    Excel 文件加载器
    
    功能：加载 .xlsx 和 .xls 文件并转换为 Markdown
    依赖：pandas, openpyxl (for .xlsx), xlrd (for .xls)
    
    输出格式：
    - 每个 Sheet 作为一个 Markdown 表格
    - Sheet 名称作为二级标题
    """
    
    SUPPORTED_EXTENSIONS = {'.xlsx', '.xls'}
    
    def __init__(
        self, 
        doc_type: DocumentType = DocumentType.OTHER,
        sheet_name: Union[str, int, None] = None,  # None 表示所有 sheet
        header_row: int = 0
    ):
        super().__init__(doc_type)
        self.sheet_name = sheet_name
        self.header_row = header_row
    
    def load(self, source: Union[str, Path]) -> Document:
        """加载 Excel 文件"""
        source = Path(source)
        
        if not source.exists():
            raise FileNotFoundError(f"文件不存在：{source}")
        
        if not PANDAS_SUPPORT:
            raise ImportError(
                "Excel 加载需要 pandas。"
                "请安装：pip install pandas openpyxl xlrd"
            )
        
        content = self._load_excel(source)
        
        return Document(
            id=str(uuid.uuid4()),
            source=str(source),
            name=source.stem,
            content=content,
            type=self.doc_type,
            metadata={
                "file_type": source.suffix.lower(),
                "file_size": source.stat().st_size,
                "format": "markdown"
            },
            create_time=datetime.now(),
            update_time=datetime.now()
        )
    
    def _load_excel(self, source: Path) -> str:
        """读取 Excel 并转换为 Markdown"""
        import pandas as pd
        
        md_parts = []
        
        # 读取所有 sheet 或指定 sheet
        if self.sheet_name is None:
            # 读取所有 sheet
            xl_file = pd.ExcelFile(source)
            sheet_names = xl_file.sheet_names
            
            for sheet_name in sheet_names:
                df = pd.read_excel(source, sheet_name=sheet_name, header=self.header_row)
                md_parts.append(f"## Sheet: {sheet_name}\n")
                md_parts.append(self._dataframe_to_markdown(df))
                md_parts.append("")
        else:
            # 读取指定 sheet
            df = pd.read_excel(source, sheet_name=self.sheet_name, header=self.header_row)
            md_parts.append(self._dataframe_to_markdown(df))
        
        return "\n".join(md_parts)
    
    def _dataframe_to_markdown(self, df) -> str:
        """将 DataFrame 转换为 Markdown 表格"""
        if df.empty:
            return "*(空表格)*"
        
        md_lines = []
        
        # 表头
        headers = [str(col) for col in df.columns]
        md_lines.append("| " + " | ".join(headers) + " |")
        md_lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
        
        # 数据行
        for _, row in df.iterrows():
            values = [str(val) if pd.notna(val) else "" for val in row]
            # 处理换行符
            values = [v.replace('\n', ' ').replace('\r', '') for v in values]
            md_lines.append("| " + " | ".join(values) + " |")
        
        return "\n".join(md_lines)
    
    def supports(self, source: Union[str, Path]) -> bool:
        """检查是否为 Excel 文件"""
        source = Path(source)
        return source.suffix.lower() in self.SUPPORTED_EXTENSIONS
