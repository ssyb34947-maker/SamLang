"""
Skill 管理器
负责扫描、加载和管理所有 skills
"""

from pathlib import Path
from typing import List, Dict, Optional
from src.agent.util.skill_process import parse_skill_md
from src.config import get_config


class SkillManager:
    """
    Skill 管理器

    功能：
    - 扫描 skills 目录下的所有 .md 文件
    - 解析每个 skill 的 name 和 description
    - 提供格式化的 skills 列表用于 system prompt
    """

    def __init__(self, skills_dir: Optional[Path] = None):
        """
        初始化 Skill 管理器

        输入：
            skills_dir: skills 目录路径，如果不提供则使用默认路径
        输出：无
        """
        if skills_dir is None:
            # 默认路径：src/agent/skills/
            self.skills_dir = Path(__file__).parent.parent / "skills"
        else:
            self.skills_dir = Path(skills_dir)

        self._skills_cache: Optional[List[Dict]] = None

    def scan_skills(self, force_reload: bool = False) -> List[Dict]:
        """
        扫描 skills 目录，获取所有 skill 的信息

        输入：
            force_reload: 是否强制重新扫描（默认使用缓存）
        输出：
            skills 列表，每个元素是一个字典包含：
            - name: skill 名称
            - description: skill 描述
            - file_path: 文件路径
        """
        # 使用缓存
        if not force_reload and self._skills_cache is not None:
            return self._skills_cache

        skills = []

        # 检查目录是否存在
        if not self.skills_dir.exists():
            print(f"警告：skills 目录不存在：{self.skills_dir}")
            return skills

        # 扫描所有 .md 文件
        for skill_file in self.skills_dir.glob("*.md"):
            try:
                frontmatter, _ = parse_skill_md(skill_file)

                if frontmatter and isinstance(frontmatter, dict):
                    skill_info = {
                        "name": frontmatter.get("name", skill_file.stem),
                        "description": frontmatter.get("description", "无描述"),
                        "file_path": str(skill_file)
                    }
                    skills.append(skill_info)
                else:
                    # 没有 frontmatter，使用文件名
                    print(f"警告：{skill_file.name} 缺少 YAML frontmatter")
                    skills.append({
                        "name": skill_file.stem,
                        "description": "无描述",
                        "file_path": str(skill_file)
                    })

            except Exception as e:
                print(f"警告：解析 {skill_file.name} 失败：{e}")
                continue

        # 获取配置中启用的技能
        try:
            config = get_config()
            enabled_skill_names = set()
            if config.skill.skill_files:
                for skill_config in config.skill.skill_files:
                    if skill_config.enabled:
                        enabled_skill_names.add(skill_config.name)
            
            # 过滤出启用的技能
            if enabled_skill_names:
                enabled_skills = []
                for skill in skills:
                    if skill["name"] in enabled_skill_names:
                        enabled_skills.append(skill)
                skills = enabled_skills
        except Exception as e:
            print(f"警告：读取配置失败，使用所有技能：{e}")

        # 缓存结果
        self._skills_cache = skills
        return skills

    def get_skill_by_name(self, name: str) -> Optional[Dict]:
        """
        根据名称获取 skill 信息

        输入：
            name: skill 名称
        输出：
            skill 信息字典，如果不存在则返回 None
        """
        skills = self.scan_skills()
        for skill in skills:
            if skill["name"] == name:
                return skill
        return None

    def format_skills_for_prompt(self, format_type: str = "markdown") -> str:
        """
        格式化 skills 列表用于 system prompt

        输入：
            format_type: 格式类型，可选 "markdown" 或 "json"
        输出：
            格式化后的字符串
        """
        skills = self.scan_skills()

        if not skills:
            return "当前没有可用的技能。"

        if format_type == "json":
            # JSON 格式
            import json
            return json.dumps(skills, ensure_ascii=False, indent=2)
        else:
            # Markdown 格式（默认）
            lines = ["## 可用技能列表\n"]
            lines.append("以下是你可以使用的标准化操作流程（Skills）。当需要执行这些操作时，请使用 `download_skill` 工具获取详细步骤：\n")

            for i, skill in enumerate(skills, 1):
                lines.append(f"{i}. **{skill['name']}**")
                lines.append(f"   - 描述：{skill['description']}\n")

            lines.append("\n**使用方法**：当需要执行某个 skill 时，调用 `download_skill(skill_name)` 获取完整的 SOP 内容。")

            return "\n".join(lines)

    def get_skill_names(self) -> List[str]:
        """
        获取所有 skill 的名称列表

        输入：无
        输出：
            skill 名称列表
        """
        skills = self.scan_skills()
        return [skill["name"] for skill in skills]

    def get_skills_count(self) -> int:
        """
        获取 skills 总数

        输入：无
        输出：
            skills 数量
        """
        return len(self.scan_skills())


# 全局单例
_global_skill_manager: Optional[SkillManager] = None


def get_skill_manager() -> SkillManager:
    """
    获取全局 Skill 管理器单例

    输入：无
    输出：
        SkillManager 实例
    """
    global _global_skill_manager
    if _global_skill_manager is None:
        _global_skill_manager = SkillManager()
    return _global_skill_manager
