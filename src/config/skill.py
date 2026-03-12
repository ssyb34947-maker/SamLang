"""
技能上传工具配置
"""

from dataclasses import dataclass

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