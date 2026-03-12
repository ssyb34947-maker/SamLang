"""
技能上传工具配置
"""

from dataclasses import dataclass
from typing import List

@dataclass
class SkillConfig:
    """
    单个技能配置

    功能：存储单个技能的配置
    输入：配置参数
    输出：配置数据类实例
    """
    name: str
    enabled: bool = True

@dataclass
class SkillUploadConfig:
    """
    技能上传工具配置

    功能：存储技能上传工具配置
    输入：配置参数
    输出：配置数据类实例
    """
    enabled: bool = False
    url: str = ""
    skill_files: List[SkillConfig] = None

    def __post_init__(self):
        if self.skill_files is None:
            self.skill_files = []