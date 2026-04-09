"""
Agent 类型 Skill 管理器
根据 Agent 身份（教授/助教/管理员）管理可用的 Skill
"""

from typing import Dict, List, Set, Optional
from dataclasses import dataclass
from loguru import logger

from .skill_manager import SkillManager, get_skill_manager
from ..mcp.agent_type_manager import AgentType


@dataclass
class SkillConfig:
    """Skill 配置"""
    name: str
    description: str
    enabled: bool = True


class AgentTypeSkillManager:
    """
    Agent 类型 Skill 管理器
    
    功能：
    - 按 Agent 身份管理可用的 Skill
    - 支持配置驱动的方式定义每个身份有哪些 Skill
    - 提供按身份获取 Skill 列表的接口
    
    使用示例：
        manager = AgentTypeSkillManager()
        # 为教授配置 Skill
        manager.configure_skills_for_agent_type(
            AgentType.PROFESSOR,
            ["word_learning", "essay_writing"]
        )
        # 获取教授可用的 Skill 提示词
        skill_prompt = manager.format_skills_for_prompt(AgentType.PROFESSOR)
    """
    
    def __init__(self, skill_manager: Optional[SkillManager] = None):
        self._skill_manager = skill_manager or get_skill_manager()
        
        # 每个 Agent 类型对应的 Skill 名称列表
        self._agent_type_skill_map: Dict[AgentType, Set[str]] = {
            AgentType.PROFESSOR: set(),
            AgentType.ASSISTANT: set(),
            AgentType.ADMIN: set(),
        }
        
        # 是否已初始化
        self._initialized = False
    
    def configure_skills_for_agent_type(self, agent_type: AgentType, 
                                         skill_names: List[str]) -> None:
        """
        为指定 Agent 类型配置可用的 Skill
        
        输入：
            agent_type: Agent 类型
            skill_names: Skill 名称列表
        """
        self._agent_type_skill_map[agent_type] = set(skill_names)
        logger.info(f"[AgentTypeSkillManager] 配置 {agent_type.name} 的 Skills: {skill_names}")
    
    def get_skills_for_agent_type(self, agent_type: AgentType) -> List[Dict]:
        """
        获取指定 Agent 类型可用的 Skill 列表
        
        输入：
            agent_type: Agent 类型
        输出：
            Skill 信息字典列表
        """
        skill_names = self._agent_type_skill_map.get(agent_type, set())
        all_skills = self._skill_manager.scan_skills()
        
        # 过滤出该 Agent 类型可用的 Skill
        return [
            skill for skill in all_skills 
            if skill["name"] in skill_names
        ]
    
    def get_skill_names_for_agent_type(self, agent_type: AgentType) -> List[str]:
        """
        获取指定 Agent 类型可用的 Skill 名称列表
        
        输入：
            agent_type: Agent 类型
        输出：
            Skill 名称列表
        """
        return list(self._agent_type_skill_map.get(agent_type, set()))
    
    def is_skill_available_for_agent_type(self, agent_type: AgentType, 
                                           skill_name: str) -> bool:
        """
        检查指定 Skill 是否对某个 Agent 类型可用
        
        输入：
            agent_type: Agent 类型
            skill_name: Skill 名称
        输出：
            是否可用
        """
        return skill_name in self._agent_type_skill_map.get(agent_type, set())
    
    def format_skills_for_prompt(self, agent_type: AgentType, 
                                  format_type: str = "markdown") -> str:
        """
        格式化指定 Agent 类型的 Skills 列表用于 system prompt
        
        输入：
            agent_type: Agent 类型
            format_type: 格式类型，可选 "markdown" 或 "json"
        输出：
            格式化后的字符串
        """
        skills = self.get_skills_for_agent_type(agent_type)
        
        if not skills:
            return ""
        
        if format_type == "json":
            import json
            return json.dumps(skills, ensure_ascii=False, indent=2)
        else:
            # Markdown 格式（默认）
            lines = ["## 可用技能列表\n"]
            lines.append("以下是你可以使用的标准化操作流程（Skills）。当需要执行这些操作时，请使用 `download_skill` 工具获取详细步骤：\n")
            
            for i, skill in enumerate(skills, 1):
                lines.append(f"{i}. **{skill['name']}**")
                lines.append(f"   - 描述：{skill['description']}")
                
                # 添加子资源信息
                if skill.get('resources'):
                    lines.append(f"   - 子资源：")
                    for resource in skill['resources']:
                        lines.append(f"     - {resource['path']}/: {len(resource['files'])} 个文件")
                lines.append("")
            
            lines.append("\n**使用方法**：")
            lines.append("1. 调用 `download_skill(skill_name)` 获取 SKILL.md 主文档")
            lines.append("2. 如需读取子资源（如 rules/animations.md），使用 `read_skill_file(skill_name, file_path)`")
            
            return "\n".join(lines)
    
    def initialize_default_config(self) -> None:
        """
        初始化默认配置
        为每个 Agent 类型配置默认的 Skill 集合
        """
        if self._initialized:
            return
        
        # 获取所有可用的 skills
        all_skills = self._skill_manager.scan_skills()
        all_skill_names = [skill["name"] for skill in all_skills]
        
        # 配置教授 Agent - 拥有所有技能
        self.configure_skills_for_agent_type(
            AgentType.PROFESSOR,
            all_skill_names
        )
        
        # 配置助教 Agent - 资料整理技能
        self.configure_skills_for_agent_type(
            AgentType.ASSISTANT,
            ["material_organizer"]  # 资料整理技能
        )
        
        # 配置管理员 Agent - 暂无特定技能
        self.configure_skills_for_agent_type(
            AgentType.ADMIN,
            []  # 暂时为空，后续可添加
        )
        
        self._initialized = True
        logger.info("[AgentTypeSkillManager] 默认配置初始化完成")
    
    def get_agent_type_from_int(self, agent_type_int: int) -> AgentType:
        """
        将整数转换为 AgentType
        
        输入：
            agent_type_int: Agent 类型整数 (1, 2, 3)
        输出：
            AgentType 枚举
        """
        try:
            return AgentType(agent_type_int)
        except ValueError:
            logger.warning(f"[AgentTypeSkillManager] 未知的 Agent 类型: {agent_type_int}，默认使用 PROFESSOR")
            return AgentType.PROFESSOR


# 全局单例
_global_agent_type_skill_manager: Optional[AgentTypeSkillManager] = None


def get_agent_type_skill_manager() -> AgentTypeSkillManager:
    """
    获取全局 Agent 类型 Skill 管理器单例
    
    输入：无
    输出：
        AgentTypeSkillManager 实例
    """
    global _global_agent_type_skill_manager
    if _global_agent_type_skill_manager is None:
        _global_agent_type_skill_manager = AgentTypeSkillManager()
        _global_agent_type_skill_manager.initialize_default_config()
    return _global_agent_type_skill_manager


def reset_agent_type_skill_manager() -> None:
    """
    重置全局单例（主要用于测试）
    """
    global _global_agent_type_skill_manager
    _global_agent_type_skill_manager = None
