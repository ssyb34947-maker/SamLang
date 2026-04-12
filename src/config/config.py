"""
配置加载模块
统一加载和管理所有配置
"""

import os
import yaml
from pathlib import Path
from dataclasses import dataclass
from dotenv import load_dotenv

# 加载 .env 文件
env_path = Path(".env")
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

from .llm import LLMConfig
from .agent import AgentConfig
from .tool import (
    ToolConfig, 
    WebSearchConfig, 
    YoudaoDictionaryConfig,
    PPIOConfig,
    RemotionConfig,
    VideoStorageConfig,
)
from .skill import SkillUploadConfig, SkillConfig
from .rag import RAGConfig, MilvusConfig
from .embedding import EmbeddingConfig
from .rerank import RerankConfig
from .ocr import OCRConfig


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
    rag: RAGConfig
    embedding: EmbeddingConfig
    rerank: RerankConfig
    ocr: OCRConfig

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

        # LLM 配置
        llm_config = LLMConfig(**data["llm"])

        # Agent 配置
        agent_config = AgentConfig(**data["agent"])

        # 工具配置
        websearch_config = WebSearchConfig(**data["tool"]["websearch"])
        youdao_dictionary_config = YoudaoDictionaryConfig(**data["tool"]["youdao_dictionary"])
        
        # PPIO 沙箱配置
        ppio_data = data.get("tool", {}).get("ppio_sandbox", {})
        
        # Remotion 配置
        remotion_data = ppio_data.get("remotion", {})
        remotion_config = RemotionConfig(
            enabled=remotion_data.get("enabled", True),
            timeout=remotion_data.get("timeout", 600),
            default_template=remotion_data.get("default_template", "with-media"),
            available_templates=remotion_data.get("available_templates", ["hello-world", "with-media", "with-voiceover"]),
            runtimes=remotion_data.get("runtimes", {"default": "nodejs20", "available": ["nodejs18", "nodejs20"]}),
            quality_presets=remotion_data.get("quality_presets", ["720p", "1080p", "1440p", "4k"]),
            output_formats=remotion_data.get("output_formats", ["mp4", "webm", "prores"]),
        )
        
        # 视频存储配置
        storage_data = ppio_data.get("video_storage", {})
        video_storage_config = VideoStorageConfig(
            type=storage_data.get("type", "local"),
            local_path=storage_data.get("local_path", "./temp/videos"),
            local_url=storage_data.get("local_url", "/videos"),
            oss_bucket=storage_data.get("oss_bucket", ""),
            oss_endpoint=storage_data.get("oss_endpoint", ""),
            oss_access_key_id=os.getenv("OSS_ACCESS_KEY_ID", ""),
            oss_access_key_secret=os.getenv("OSS_ACCESS_KEY_SECRET", ""),
        )
        
        # PPIO 主配置
        ppio_config = PPIOConfig(
            enabled=ppio_data.get("enabled", False),
            api_key=os.getenv("PPIO_API_KEY", ppio_data.get("api_key", "")),
            base_url=ppio_data.get("base_url", "https://api.ppio.cloud"),
            default_timeout=ppio_data.get("default_timeout", 60),
            remotion=remotion_config,
            video_storage=video_storage_config,
        )
        
        tool_config = ToolConfig(
            websearch=websearch_config,
            youdao_dictionary=youdao_dictionary_config,
            ppio_sandbox=ppio_config,
        )

        # 技能配置
        skill_data = data["skill"].copy()
        if "skill_files" in skill_data:
            skill_files = []
            for skill in skill_data["skill_files"]:
                skill_files.append(SkillConfig(**skill))
            skill_data["skill_files"] = skill_files
        skill_config = SkillUploadConfig(**skill_data)

        # RAG 配置
        rag_data = data.get("rag", {})
        milvus_data = rag_data.get("milvus", {})
        milvus_config = MilvusConfig(**milvus_data)
        rag_config = RAGConfig(
            collection_name=rag_data.get("collection_name", "rag_collection"),
            vector_dim=rag_data.get("vector_dim", 1024),
            chunk_size=rag_data.get("chunk_size", 1024),
            chunk_overlap=rag_data.get("chunk_overlap", 0.1),
            top_k=rag_data.get("top_k", 10),
            milvus=milvus_config
        )

        # Embedding 配置
        embedding_data = data.get("embedding", {})
        embedding_config = EmbeddingConfig(**embedding_data)

        # Rerank 配置
        rerank_data = data.get("rerank", {})
        rerank_config = RerankConfig(**rerank_data)

        # OCR 配置
        ocr_data = data.get("ocr", {})
        ocr_config = OCRConfig(**ocr_data)

        return cls(
            llm=llm_config,
            agent=agent_config,
            tool=tool_config,
            skill=skill_config,
            rag=rag_config,
            embedding=embedding_config,
            rerank=rerank_config,
            ocr=ocr_config
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
