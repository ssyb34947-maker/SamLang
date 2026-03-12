"""
技能处理工具
"""

import yaml
import re
from pathlib import Path
from typing import Tuple, Dict, Optional


def parse_skill_md(file_path: str | Path) -> Tuple[Optional[Dict], str]:
    """
    读取 skill.md 文件，解析出 YAML frontmatter 和正文。

    参数:
        file_path: skill.md 文件的路径（字符串或 Path 对象）

    返回:
        Tuple[Dict | None, str]:
            - frontmatter: 解析出的 YAML 元数据（字典），如果没有或解析失败则为 None
            - body: Markdown 正文（字符串），去除了 frontmatter 部分

    示例:
        frontmatter, body = parse_skill_md("src/agent/skill/order-fulfillment.md")
        print(frontmatter)           # {'name': 'order-fulfillment', 'description': '...'}
        print(body[:100])            # 正文开头部分
    """
    file_path = Path(file_path)
    
    if not file_path.is_file():
        raise FileNotFoundError(f"文件不存在: {file_path}")
    
    if file_path.suffix.lower() != '.md':
        raise ValueError(f"文件不是 Markdown 文件: {file_path}")
    
    content = file_path.read_text(encoding='utf-8').strip()
    
    # 匹配以 --- 开头和结尾的 YAML frontmatter
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    
    if frontmatter_match:
        yaml_str = frontmatter_match.group(1).strip()
        try:
            frontmatter = yaml.safe_load(yaml_str)
            if not isinstance(frontmatter, dict):
                frontmatter = None
        except yaml.YAMLError as e:
            print(f"警告：YAML 解析失败 - {file_path}\n{e}")
            frontmatter = None
        
        # 正文是 frontmatter 之后的全部内容
        body_start = frontmatter_match.end()
        body = content[body_start:].strip()
    else:
        # 没有找到 frontmatter
        frontmatter = None
        body = content
    
    return frontmatter, body