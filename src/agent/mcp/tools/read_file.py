"""
Skill 子文件读取工具
用于安全地读取 skill 目录下的子文件（如 rules/*.md）
"""

from fastmcp import FastMCP
from pathlib import Path
import os

read_file_mcp = FastMCP(name="read_file")


class SkillFileReader:
    """
    Skill 文件读取器

    功能：
    - 安全地读取 skill 目录下的子文件
    - 禁止访问父目录（路径穿越保护）
    - 支持相对于 SKILL.md 的相对路径
    """

    def __init__(self):
        """
        初始化文件读取器

        输入：无
        输出：无
        """
        # Skills 目录路径
        self.skills_dir = Path(__file__).parent.parent.parent / "skills"

    def _resolve_path(self, skill_name: str, file_path: str) -> Path:
        """
        解析并验证文件路径

        输入：
            skill_name: skill 名称
            file_path: 相对于 SKILL.md 的文件路径（如 "rules/animations.md"）
        输出：
            解析后的绝对路径
        抛出：
            ValueError: 如果路径不合法或试图访问父目录
        """
        # 构建 skill 目录的绝对路径
        skill_dir = self.skills_dir / skill_name

        # 规范化文件路径（去除 .. 等）
        # 先作为相对路径处理
        target_path = skill_dir / file_path

        # 解析为绝对路径并规范化
        try:
            target_path = target_path.resolve()
        except (OSError, ValueError) as e:
            raise ValueError(f"无效的路径: {file_path}")

        # 安全检查：确保解析后的路径仍在 skill 目录内
        try:
            # 使用 relative_to 检查 target_path 是否是 skill_dir 的子路径
            target_path.relative_to(skill_dir.resolve())
        except ValueError:
            raise ValueError(
                f"访问被拒绝：路径 '{file_path}' 试图访问 skill 目录之外的区域。"
                f"只能访问 '{skill_name}' skill 目录内的文件。"
            )

        return target_path

    def _is_safe_path_component(self, component: str) -> bool:
        """
        检查路径组件是否安全

        输入：
            component: 路径组件（如文件名或目录名）
        输出：
            是否安全
        """
        # 禁止空组件
        if not component or component.strip() == '':
            return False

        # 禁止以 . 开头的隐藏文件/目录（除了 . 和 ..）
        if component.startswith('.') and component not in ('.', '..'):
            return False

        # 禁止包含路径分隔符的组件
        if '/' in component or '\\' in component:
            return False

        # 禁止特殊字符
        unsafe_chars = '<>:"|?*'
        if any(c in component for c in unsafe_chars):
            return False

        return True

    def read(self, skill_name: str, file_path: str) -> str:
        """
        读取指定 skill 下的子文件

        输入：
            skill_name: skill 名称（不含 .md 后缀，如 "remotion"）
            file_path: 相对于 SKILL.md 的文件路径（如 "rules/animations.md"）
        输出：
            文件内容，如果失败则返回错误信息

        安全限制：
            1. 只能访问指定 skill 目录内的文件
            2. 禁止使用 .. 访问父目录
            3. 禁止访问隐藏文件（以 . 开头）
            4. 禁止访问绝对路径
        """
        try:
            # 参数验证
            if not skill_name or not skill_name.strip():
                return "错误：skill_name 不能为空"

            if not file_path or not file_path.strip():
                return "错误：file_path 不能为空"

            # 清理输入
            skill_name = skill_name.strip()
            file_path = file_path.strip()

            # 检查是否为绝对路径
            if os.path.isabs(file_path):
                return f"错误：不允许使用绝对路径 '{file_path}'，请使用相对于 SKILL.md 的相对路径"

            # 检查路径组件安全性
            path_parts = Path(file_path).parts
            for part in path_parts:
                if part == '..' or part == '.':
                    continue  # 允许 . 和 ..，但会在 resolve 后检查
                if not self._is_safe_path_component(part):
                    return f"错误：路径包含不安全的组件 '{part}'"

            # 解析并验证路径
            try:
                target_path = self._resolve_path(skill_name, file_path)
            except ValueError as e:
                return f"错误：{str(e)}"

            # 检查文件是否存在
            if not target_path.exists():
                return f"错误：文件不存在 '{file_path}'（在 skill '{skill_name}' 中）"

            # 检查是否为文件（不是目录）
            if not target_path.is_file():
                return f"错误：路径不是文件 '{file_path}'"

            # 检查文件大小（限制为 5MB）
            max_size = 5 * 1024 * 1024  # 5MB
            file_size = target_path.stat().st_size
            if file_size > max_size:
                return f"错误：文件过大 ({file_size / 1024 / 1024:.2f}MB)，最大允许 5MB"

            # 读取文件内容
            try:
                content = target_path.read_text(encoding='utf-8')
                return content
            except UnicodeDecodeError:
                # 如果不是 UTF-8 文本，尝试以二进制方式读取并返回错误
                return f"错误：文件 '{file_path}' 不是有效的 UTF-8 文本文件"

        except Exception as e:
            return f"读取文件失败：{str(e)}"


@read_file_mcp.tool(
    name="read_skill_file",
    description="""读取 skill 目录下的子文件内容（如 rules/*.md）。

使用场景：
- 当 SKILL.md 中提到 "Read individual rule files for detailed explanations" 时
- 需要获取某个具体规则的详细说明和代码示例时

安全限制：
- 只能访问指定 skill 目录内的文件
- 禁止使用 .. 访问父目录
- 只能读取 UTF-8 文本文件，最大 5MB

示例：
- skill_name: "remotion"
- file_path: "rules/animations.md"
"""
)
def read_skill_file(skill_name: str, file_path: str) -> str:
    """
    读取 skill 目录下的子文件

    输入：
        skill_name: skill 名称（如 "remotion"）
        file_path: 相对于 SKILL.md 的文件路径（如 "rules/animations.md"）
    输出：
        文件内容，失败时返回错误信息
    """
    reader = SkillFileReader()
    return reader.read(skill_name, file_path)


if __name__ == "__main__":
    read_file_mcp.run(transport="sse")
