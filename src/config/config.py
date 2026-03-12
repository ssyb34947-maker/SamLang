"""
配置加载模块
统一加载和管理所有配置
"""

import os
import yaml
from pathlib import Path
from dataclasses import dataclass

from .llm import LLMConfig
from .agent import AgentConfig
from .tool import ToolConfig, WebSearchConfig, YoudaoDictionaryConfig
from .skill import SkillUploadConfig



@dataclass
class Config:
    """
    全局配置

    功能：统一管理所有配置
    输入：配置文件路径
    输出：配置实例
    """
    llm: LLMConfig
    agent: AgentConfig
    tool: ToolConfig
    skill: SkillUploadConfig
        
    @classmethod
    def from_yaml(cls, config_path: str = "config.yaml") -> "Config":
        """
        从 YAML 文件加载配置

        输入：config_path - 配置文件路径
        输出：Config 实例
        """
        config_file = Path(config_path)
        if not config_file.exists():
            raise FileNotFoundError(f"配置文件不存在：{config_path}")

        with open(config_file, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        llm_config = LLMConfig(**data["llm"])
        agent_config = AgentConfig(**data["agent"])

        websearch_config = WebSearchConfig(**data["tool"]["websearch"])
        youdao_dictionary_config = YoudaoDictionaryConfig(**data["tool"]["youdao_dictionary"])
        
        tool_config = ToolConfig(websearch=websearch_config, youdao_dictionary=youdao_dictionary_config)

        skill_config = SkillUploadConfig(**data["skill"])



        return cls(
            llm=llm_config,
            agent=agent_config,
            tool=tool_config,
            skill=skill_config
        )


_config_instance = None


def get_config(config_path: str = "config.yaml") -> Config:
    """
    获取全局配置实例（单例模式）

    输入：config_path - 配置文件路径
    输出：Config 实例
    """
    global _config_instance
    if _config_instance is None:
        _config_instance = Config.from_yaml(config_path)
    return _config_instance


def reload_config(config_path: str = "config.yaml") -> Config:
    """
    重新加载配置

    输入：config_path - 配置文件路径
    输出：Config 实例
    """
    global _config_instance
    _config_instance = Config.from_yaml(config_path)
    return _config_instance
