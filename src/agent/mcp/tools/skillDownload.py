"""
Skill 下载工具
用于获取指定 skill 的完整内容
"""

from fastmcp import FastMCP
from pathlib import Path
from src.agent.util.skill_process import parse_skill_md

skill_mcp = FastMCP(name="skill")


class SkillDownloader:
    """
    Skill 下载器

    功能：
    - 根据 skill_name 获取对应的 skill.md 文件内容
    """

    def __init__(self):
        """
        初始化 Skill 下载器

        输入：无
        输出：无
        """
        # Skills 目录路径
        self.skills_dir = Path(__file__).parent.parent.parent / "skills"

    def download(self, skill_name: str) -> str:
        """
        获取指定 skill 的内容

        输入：
            skill_name: skill 名称（不含 .md 后缀）
        输出：
            skill 的正文内容，如果失败则返回错误信息
        """
        try:
            # 构建文件路径
            skill_file = self.skills_dir / f"{skill_name}.md"

            # 检查文件是否存在
            if not skill_file.exists():
                return f"错误：找不到名为 '{skill_name}' 的技能文件"

            # 解析 skill 文件
            frontmatter, body = parse_skill_md(skill_file)

            if body is None or len(body.strip()) == 0:
                return f"错误：技能 '{skill_name}' 的内容为空"

            return body

        except Exception as e:
            return f"获取技能 '{skill_name}' 失败：{str(e)}"


@skill_mcp.tool(
    name="download_skill",
    description="获取指定技能的完整 SOP 内容。当需要执行某个标准化操作流程时使用此工具。输入技能名称，返回详细的执行步骤和注意事项"
)
def download_skill(skill_name: str) -> str:
    """
    获取指定 skill 的 Markdown 内容

    输入：
        skill_name: skill 名称（例如 'order-refund-processing'）
    输出：
        skill 的完整正文内容
    """
    downloader = SkillDownloader()
    return downloader.download(skill_name)
