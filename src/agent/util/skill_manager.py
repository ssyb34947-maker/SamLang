"""
Skill 管理器
负责扫描、加载和管理所有 skills
支持标准 skill 目录结构：每个 skill 一个文件夹，包含 SKILL.md 和子资源
"""

from pathlib import Path
from typing import List, Dict, Optional
from src.agent.util.skill_process import parse_skill_md
from src.config import get_config


class SkillManager:
    """
    Skill 管理器

    功能：
    - 扫描 skills 目录下的所有子文件夹（每个子文件夹是一个 skill）
    - 解析每个 skill 的 SKILL.md 文件
    - 提取 name、description 和子资源列表
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

    def _get_skill_resources(self, skill_dir: Path) -> List[Dict]:
        """
        获取 skill 的子资源列表

        输入：
            skill_dir: skill 目录路径
        输出：
            资源列表，每个元素包含：
            - type: 资源类型（如 rules, examples, assets）
            - path: 相对路径
            - files: 文件列表
        """
        resources = []
        
        if not skill_dir.exists():
            return resources
        
        # 扫描常见资源目录
        for subdir in skill_dir.iterdir():
            if subdir.is_dir() and not subdir.name.startswith('.'):
                # 获取该目录下的所有文件
                files = []
                for file_path in subdir.rglob('*'):
                    if file_path.is_file():
                        # 计算相对路径
                        rel_path = file_path.relative_to(skill_dir)
                        files.append(str(rel_path))
                
                if files:
                    resources.append({
                        "type": subdir.name,
                        "path": subdir.name,
                        "files": files[:10]  # 最多显示10个文件
                    })
        
        return resources

    def scan_skills(self, force_reload: bool = False) -> List[Dict]:
        """
        扫描 skills 目录，获取所有 skill 的信息

        输入：
            force_reload: 是否强制重新扫描（默认使用缓存）
        输出：
            skills 列表，每个元素是一个字典包含：
            - name: skill 名称（来自 frontmatter 或文件夹名）
            - description: skill 描述
            - file_path: SKILL.md 文件路径
            - resources: 子资源列表
        """
        # 使用缓存
        if not force_reload and self._skills_cache is not None:
            return self._skills_cache

        skills = []

        # 检查目录是否存在
        print(f"[SkillManager] 扫描目录: {self.skills_dir}")
        print(f"[SkillManager] 目录是否存在: {self.skills_dir.exists()}")
        if not self.skills_dir.exists():
            print(f"警告：skills 目录不存在：{self.skills_dir}")
            return skills

        # 扫描所有子目录（每个子目录是一个 skill）
        item_count = 0
        for skill_dir in self.skills_dir.iterdir():
            item_count += 1
            print(f"[SkillManager] 检查项目: {skill_dir.name} (is_dir: {skill_dir.is_dir()})")
            if not skill_dir.is_dir() or skill_dir.name.startswith('.'):
                continue
            
            # 查找 SKILL.md 文件
            skill_file = skill_dir / "SKILL.md"
            if not skill_file.exists():
                print(f"警告：{skill_dir.name} 目录下缺少 SKILL.md 文件")
                continue
            
            try:
                frontmatter, body = parse_skill_md(skill_file)
                print(f"[SkillManager] {skill_dir.name}/SKILL.md frontmatter: {frontmatter}")

                if frontmatter and isinstance(frontmatter, dict):
                    skill_info = {
                        "name": frontmatter.get("name", skill_dir.name),
                        "description": frontmatter.get("description", "无描述"),
                        "file_path": str(skill_file),
                        "resources": self._get_skill_resources(skill_dir)
                    }
                    skills.append(skill_info)
                    print(f"[SkillManager] 成功添加 skill: {skill_info['name']}")
                else:
                    # 没有 frontmatter，使用文件夹名
                    print(f"警告：{skill_file.name} 缺少 YAML frontmatter")
                    skills.append({
                        "name": skill_dir.name,
                        "description": "无描述",
                        "file_path": str(skill_file),
                        "resources": self._get_skill_resources(skill_dir)
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
        print(f"[SkillManager] format_skills_for_prompt 获取到 {len(skills)} 个 skill: {[s['name'] for s in skills]}")

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
