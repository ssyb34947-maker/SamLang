"""
Skill 下载工具
用于获取指定 skill 的完整内容，包括 SKILL.md 主文档和子资源列表
"""

from fastmcp import FastMCP
from pathlib import Path
from src.agent.util.skill_process import parse_skill_md

skill_mcp = FastMCP(name="skill")


class SkillDownloader:
    """
    Skill 下载器

    功能：
    - 根据 skill_name 获取对应的 SKILL.md 文件内容
    - 扫描并列出 skill 目录下的子资源（如 rules/, examples/ 等）
    """

    def __init__(self):
        """
        初始化 Skill 下载器

        输入：无
        输出：无
        """
        # Skills 目录路径
        self.skills_dir = Path(__file__).parent.parent.parent / "skills"

    def _get_skill_resources(self, skill_dir: Path) -> str:
        """
        获取 skill 的子资源列表，格式化为文本

        输入：
            skill_dir: skill 目录路径
        输出：
            格式化的资源列表文本
        """
        resources_text = []
        
        if not skill_dir.exists():
            return ""
        
        # 扫描子目录
        for subdir in skill_dir.iterdir():
            if not subdir.is_dir() or subdir.name.startswith('.'):
                continue
            
            # 获取该目录下的文件列表
            files = []
            for file_path in subdir.rglob('*'):
                if file_path.is_file():
                    rel_path = file_path.relative_to(skill_dir)
                    files.append(str(rel_path))
            
            if files:
                resources_text.append(f"\n### {subdir.name}/ 目录")
                resources_text.append(f"包含 {len(files)} 个文件：")
                for f in files[:15]:  # 最多显示15个文件
                    resources_text.append(f"  - {f}")
                if len(files) > 15:
                    resources_text.append(f"  ... 还有 {len(files) - 15} 个文件")
        
        return "\n".join(resources_text) if resources_text else ""

    def download(self, skill_name: str) -> str:
        """
        获取指定 skill 的内容

        输入：
            skill_name: skill 名称（文件夹名）
        输出：
            skill 的正文内容 + 子资源列表，如果失败则返回错误信息
        """
        try:
            # 构建 skill 目录路径
            skill_dir = self.skills_dir / skill_name
            skill_file = skill_dir / "SKILL.md"

            # 检查文件是否存在
            if not skill_file.exists():
                return f"错误：找不到名为 '{skill_name}' 的技能文件"

            # 解析 skill 文件
            frontmatter, body = parse_skill_md(skill_file)

            if body is None:
                body = ""

            # 获取子资源列表
            resources = self._get_skill_resources(skill_dir)
            
            # 组合输出
            result = [body]
            
            if resources:
                result.append("\n\n---\n")
                result.append("## 可用子资源\n")
                result.append("如需读取以下子资源，请使用 `read_skill_file` 工具：\n")
                result.append(resources)
                result.append(f"\n\n**示例**：`read_skill_file(skill_name='{skill_name}', file_path='rules/animations.md')`")
            
            return "\n".join(result)

        except Exception as e:
            return f"获取技能 '{skill_name}' 失败：{str(e)}"


@skill_mcp.tool(
    name="download_skill",
    description="""获取指定技能的完整 SOP 内容和子资源列表。

使用场景：
- 当需要执行某个标准化操作流程（Skill）时
- 获取 SKILL.md 主文档和子资源（rules/, examples/ 等）列表

使用方法：
1. 调用此工具获取 SKILL.md 主文档内容
2. 查看返回的子资源列表
3. 如需读取具体子资源文件，使用 `read_skill_file` 工具

示例：
- skill_name: "remotion"
- 返回：SKILL.md 内容 + rules/ 目录下的文件列表
"""
)
def download_skill(skill_name: str) -> str:
    """
    获取指定 skill 的 Markdown 内容和子资源列表

    输入：
        skill_name: skill 名称（如 "remotion", "word_learning"）
    输出：
        skill 的完整正文内容 + 子资源列表
    """
    downloader = SkillDownloader()
    return downloader.download(skill_name)
