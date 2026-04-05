"""
代码执行工具
用于在受限环境中执行 Python 或 JavaScript 代码
支持两种模式：
1. 执行代码字符串（Agent 生成的代码）
2. 执行 skill 目录下的代码文件

注意：实际执行环境由 Docker 镜像提供，需要预先配置好支持 Python 和 Node.js 的镜像
"""

from fastmcp import FastMCP
from pathlib import Path
import subprocess
import os
import sys
import json
import re
from typing import Optional, Dict, Any, List, Set
from enum import Enum

exec_code_mcp = FastMCP(name="exec_code")


class Language(str, Enum):
    """支持的语言类型"""
    PYTHON = "python"
    JAVASCRIPT = "javascript"


# 危险模块/库黑名单
BLACKLIST = {
    Language.PYTHON: {
        # 系统操作
        'os', 'sys', 'subprocess', 'platform', 'pwd', 'grp', 'spwd',
        # 文件系统
        'pathlib', 'shutil', 'glob', 'fnmatch',
        # 网络
        'socket', 'http', 'urllib', 'ftplib', 'smtplib', 'telnetlib',
        # 进程管理
        'multiprocessing', 'threading', 'concurrent', 'asyncio.subprocess',
        # 代码执行
        'eval', 'exec', 'compile', '__import__', 'importlib',
        # 其他危险模块
        'ctypes', 'mmap', 'resource', 'signal', 'pty', 'tty',
        'pickle', 'cPickle', 'shelve', 'marshal',
    },
    Language.JAVASCRIPT: {
        # Node.js 核心模块
        'child_process', 'cluster', 'dgram', 'dns', 'http', 'https',
        'net', 'os', 'path', 'process', 'readline', 'repl',
        'tls', 'tty', 'v8', 'vm', 'worker_threads',
        # 文件系统
        'fs', 'fs/promises',
        # 动态执行
        'eval', 'Function', 'setImmediate', 'setInterval',
        # 其他危险模块
        'module', 'require', 'import',
    }
}


class CodeExecutor:
    """
    代码执行器

    功能：
    - 执行代码字符串（Agent 生成）
    - 执行 skill 目录下的代码文件
    - 支持 Python 和 JavaScript
    - 禁止访问父目录（路径穿越保护）
    - 限制执行时间和资源

    执行环境要求：
    - 本地 subprocess（当前实现）
    - 或 Docker 容器（推荐，更安全）
    """

    def __init__(self):
        # Skills 目录路径
        self.skills_dir = Path(__file__).parent.parent.parent / "skills"

        # 执行限制
        self.timeout = 60  # 默认超时时间（秒）
        self.max_output_size = 1024 * 1024  # 最大输出大小（1MB）
        self.max_code_size = 1024 * 1024  # 最大代码大小（1MB）

        # 语言配置
        self.language_config = {
            Language.PYTHON: {
                "extension": ".py",
                "command": [sys.executable],  # 当前 Python 解释器
                "env_vars": {
                    "PYTHONDONTWRITEBYTECODE": "1",
                    "PYTHONUNBUFFERED": "1",
                }
            },
            Language.JAVASCRIPT: {
                "extension": ".js",
                "command": ["node"],  # 需要系统安装 Node.js
                "env_vars": {}
            }
        }

    def _resolve_path(self, skill_name: str, code_file: str) -> Path:
        """
        解析并验证文件路径
        """
        skill_dir = self.skills_dir / skill_name
        target_path = skill_dir / code_file

        try:
            target_path = target_path.resolve()
        except (OSError, ValueError) as e:
            raise ValueError(f"无效的路径: {code_file}")

        try:
            target_path.relative_to(skill_dir.resolve())
        except ValueError:
            raise ValueError(
                f"访问被拒绝：路径 '{code_file}' 试图访问 skill 目录之外的区域。"
                f"只能访问 '{skill_name}' skill 目录内的文件。"
            )

        return target_path

    def _is_safe_path_component(self, component: str) -> bool:
        """检查路径组件是否安全"""
        if not component or component.strip() == '':
            return False

        if component.startswith('.') and component not in ('.', '..'):
            return False

        if '/' in component or '\\' in component:
            return False

        unsafe_chars = '<>:"|?*'
        if any(c in component for c in unsafe_chars):
            return False

        return True

    def _check_code_safety(self, code: str, language: Language) -> Optional[str]:
        """
        检查代码是否包含危险操作

        输入：
            code: 代码字符串
            language: 语言类型
        输出：
            如果检测到危险操作，返回错误信息；否则返回 None
        """
        blacklist = BLACKLIST.get(language, set())

        if language == Language.PYTHON:
            return self._check_python_safety(code, blacklist)
        elif language == Language.JAVASCRIPT:
            return self._check_javascript_safety(code, blacklist)

        return None

    def _check_python_safety(self, code: str, blacklist: Set[str]) -> Optional[str]:
        """检查 Python 代码安全性"""
        # 检查 import 语句
        # 匹配 import xxx 或 import xxx.yyy 或 from xxx import yyy
        import_patterns = [
            r'^import\s+([a-zA-Z_][a-zA-Z0-9_]*)',  # import os
            r'^from\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)',  # from os.path import xxx
            r'^import\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)',  # import os.path
        ]

        for line in code.split('\n'):
            line = line.strip()

            # 跳过注释和空行
            if not line or line.startswith('#'):
                continue

            for pattern in import_patterns:
                match = re.match(pattern, line)
                if match:
                    module_name = match.group(1).split('.')[0]  # 获取顶级模块名
                    if module_name in blacklist:
                        return f"安全错误：禁止使用危险模块 '{module_name}'"

            # 检查直接调用危险函数
            dangerous_calls = [
                r'\beval\s*\(',  # eval(
                r'\bexec\s*\(',  # exec(
                r'\b__import__\s*\(',  # __import__(
                r'\bcompile\s*\(',  # compile(
            ]

            for pattern in dangerous_calls:
                if re.search(pattern, line):
                    func_name = pattern.replace(r'\b', '').replace(r'\s*\(', '')
                    return f"安全错误：禁止使用危险函数 '{func_name}'"

        return None

    def _check_javascript_safety(self, code: str, blacklist: Set[str]) -> Optional[str]:
        """检查 JavaScript 代码安全性"""
        # 检查 require 语句
        require_pattern = r"require\s*\(\s*['\"]([^'\"]+)['\"]\s*\)"

        # 检查 ES6 import 语句
        import_patterns = [
            r"import\s+.*?\s+from\s+['\"]([^'\"]+)['\"]",  # import xxx from 'module'
            r"import\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",  # import('module')
        ]

        for line in code.split('\n'):
            line = line.strip()

            # 跳过注释和空行
            if not line or line.startswith('//') or line.startswith('/*'):
                continue

            # 检查 require
            matches = re.finditer(require_pattern, line)
            for match in matches:
                module_name = match.group(1)
                # 处理 require('fs/promises') 这样的情况
                top_module = module_name.split('/')[0]
                if top_module in blacklist or module_name in blacklist:
                    return f"安全错误：禁止使用危险模块 '{module_name}'"

            # 检查 ES6 import
            for pattern in import_patterns:
                match = re.search(pattern, line)
                if match:
                    module_name = match.group(1)
                    top_module = module_name.split('/')[0]
                    if top_module in blacklist or module_name in blacklist:
                        return f"安全错误：禁止使用危险模块 '{module_name}'"

            # 检查直接调用危险函数
            dangerous_patterns = [
                r'\beval\s*\(',  # eval(
                r'\bFunction\s*\(',  # Function(
                r'new\s+Function\s*\(',  # new Function(
            ]

            for pattern in dangerous_patterns:
                if re.search(pattern, line):
                    func_name = 'eval/Function' if 'eval' in pattern else 'Function'
                    return f"安全错误：禁止使用危险函数 '{func_name}'"

        return None

    def _validate_language(self, language: str) -> Language:
        """验证并返回语言类型"""
        try:
            return Language(language.lower())
        except ValueError:
            raise ValueError(f"不支持的语言 '{language}'，支持的语言: python, javascript")

    def _prepare_environment(
        self,
        lang_config: Dict,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """准备执行环境变量"""
        env = os.environ.copy()

        # 设置安全的 PATH
        env['PATH'] = '/usr/bin:/bin:/usr/local/bin'

        # 语言特定的环境变量
        env.update(lang_config.get("env_vars", {}))

        # 将参数转换为 JSON 字符串，通过环境变量传递
        if params:
            env['SKILL_PARAMS'] = json.dumps(params, ensure_ascii=False)

        return env

    def _execute_code(
        self,
        code: str,
        language: Language,
        work_dir: Optional[Path] = None,
        params: Optional[Dict[str, Any]] = None,
        timeout: Optional[int] = None
    ) -> str:
        """
        执行代码字符串的核心方法
        """
        # 检查代码大小
        if len(code) > self.max_code_size:
            return f"错误：代码过大 ({len(code) / 1024:.2f}KB)，最大允许 {self.max_code_size / 1024:.2f}KB"

        # 安全检查：检查危险模块和函数
        safety_error = self._check_code_safety(code, language)
        if safety_error:
            return safety_error

        lang_config = self.language_config[language]
        exec_timeout = timeout or self.timeout

        # 创建临时目录
        import tempfile
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # 写入代码文件
            code_file = temp_path / f"main{lang_config['extension']}"
            code_file.write_text(code, encoding='utf-8')

            # 准备环境
            env = self._prepare_environment(lang_config, params)

            # 设置工作目录
            cwd = str(work_dir) if work_dir else str(temp_path)

            try:
                # 执行代码
                cmd = lang_config["command"] + [str(code_file)]
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=exec_timeout,
                    env=env,
                    cwd=cwd,
                )

                # 组合输出
                output_parts = []

                if result.stdout:
                    stdout = result.stdout
                    if len(stdout) > self.max_output_size:
                        stdout = stdout[:self.max_output_size] + "\n... [输出被截断，超过最大限制]"
                    output_parts.append(f"[标准输出]\n{stdout}")

                if result.stderr:
                    stderr = result.stderr
                    if len(stderr) > self.max_output_size:
                        stderr = stderr[:self.max_output_size] + "\n... [错误输出被截断]"
                    output_parts.append(f"[错误输出]\n{stderr}")

                if result.returncode != 0:
                    output_parts.append(f"[退出码] {result.returncode}")

                return "\n\n".join(output_parts) if output_parts else "[无输出]"

            except subprocess.TimeoutExpired:
                return f"错误：代码执行超时（超过 {exec_timeout} 秒）"
            except FileNotFoundError as e:
                if language == Language.JAVASCRIPT:
                    return "错误：未找到 Node.js，请确保已安装 Node.js 并添加到 PATH"
                return f"错误：未找到执行命令 - {str(e)}"
            except Exception as e:
                return f"执行失败：{str(e)}"

    def execute_code_string(
        self,
        code: str,
        language: str,
        params: Optional[Dict[str, Any]] = None,
        timeout: Optional[int] = None
    ) -> str:
        """
        执行代码字符串（Agent 生成的代码）

        输入：
            code: 代码字符串
            language: 语言类型 (python 或 javascript)
            params: 传递给代码的参数（字典格式）
            timeout: 执行超时时间（秒）
        """
        try:
            if not code or not code.strip():
                return "错误：code 不能为空"

            lang = self._validate_language(language)
            return self._execute_code(code.strip(), lang, None, params, timeout)

        except Exception as e:
            return f"执行代码失败：{str(e)}"

    def execute_skill_file(
        self,
        skill_name: str,
        file_path: str,
        language: str,
        params: Optional[Dict[str, Any]] = None,
        timeout: Optional[int] = None
    ) -> str:
        """
        执行 skill 目录下的代码文件

        输入：
            skill_name: skill 名称
            file_path: 相对于 SKILL.md 的代码文件路径
            language: 语言类型 (python 或 javascript)
            params: 传递给代码的参数（字典格式）
            timeout: 执行超时时间（秒）
        """
        try:
            # 参数验证
            if not skill_name or not skill_name.strip():
                return "错误：skill_name 不能为空"

            if not file_path or not file_path.strip():
                return "错误：file_path 不能为空"

            skill_name = skill_name.strip()
            file_path = file_path.strip()

            # 验证语言
            lang = self._validate_language(language)

            # 检查是否为绝对路径
            if os.path.isabs(file_path):
                return f"错误：不允许使用绝对路径 '{file_path}'"

            # 检查文件扩展名
            expected_ext = self.language_config[lang]["extension"]
            if not file_path.endswith(expected_ext):
                return f"错误：{language} 代码文件应该以 {expected_ext} 结尾"

            # 检查路径组件安全性
            path_parts = Path(file_path).parts
            for part in path_parts:
                if part == '..' or part == '.':
                    continue
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

            if not target_path.is_file():
                return f"错误：路径不是文件 '{file_path}'"

            # 检查文件大小
            file_size = target_path.stat().st_size
            if file_size > self.max_code_size:
                return f"错误：代码文件过大 ({file_size / 1024:.2f}KB)，最大允许 {self.max_code_size / 1024:.2f}KB"

            # 读取代码内容
            try:
                code = target_path.read_text(encoding='utf-8')
            except UnicodeDecodeError:
                return f"错误：文件 '{file_path}' 不是有效的 UTF-8 文本文件"

            # 执行代码，工作目录设为文件所在目录
            return self._execute_code(code, lang, target_path.parent, params, timeout)

        except Exception as e:
            return f"执行代码失败：{str(e)}"


# 创建执行器实例
executor = CodeExecutor()


@exec_code_mcp.tool(
    name="execute_code_string",
    description="""执行代码字符串（Agent 生成的代码）。

使用场景：
- Agent 生成了 Python 或 JavaScript 代码，需要立即执行
- 需要运行动态生成的代码片段

参数传递：
- 通过 params 参数传递字典，代码中可以通过环境变量 SKILL_PARAMS 获取
- Python 示例：
  import json
  params = json.loads(os.environ.get('SKILL_PARAMS', '{}'))
- JavaScript 示例：
  const params = JSON.parse(process.env.SKILL_PARAMS || '{}')

支持的语言：
- python: Python 3.x
- javascript: Node.js (需要系统已安装 Node.js)

安全限制：
- 禁止使用的 Python 模块：os, sys, subprocess, pathlib, shutil, socket, urllib, eval, exec 等
- 禁止使用的 JavaScript 模块：fs, child_process, os, path, process, http, eval 等
- 执行时间限制（默认 60 秒）
- 输出大小限制（1MB）
- 代码大小限制（1MB）

示例：
- code: "print('Hello, World!')"
- language: "python"
- params: {"name": "Sam"}
"""
)
def execute_code_string(
    code: str,
    language: str,
    params: str = "{}"
) -> str:
    """
    执行代码字符串

    输入：
        code: 代码字符串
        language: 语言类型 (python 或 javascript)
        params: JSON 格式的参数字符串
    输出：
        执行结果
    """
    try:
        params_dict = json.loads(params) if params else {}
    except json.JSONDecodeError:
        return f"错误：params 参数不是有效的 JSON 格式: {params}"

    return executor.execute_code_string(code, language, params_dict)


@exec_code_mcp.tool(
    name="execute_skill_code_file",
    description="""执行 skill 目录下的代码文件。

使用场景：
- 需要运行 skill 中预定义的代码文件
- 执行 skill 中的工具脚本或生成器

支持的语言：
- python: .py 文件
- javascript: .js 文件

参数传递：
- 通过 params 参数传递字典，代码中通过环境变量 SKILL_PARAMS 获取
- 工作目录自动设置为代码文件所在目录

安全限制：
- 只能访问指定 skill 目录内的文件
- 禁止使用 .. 访问父目录
- 禁止使用的 Python 模块：os, sys, subprocess, pathlib, shutil, socket, urllib, eval, exec 等
- 禁止使用的 JavaScript 模块：fs, child_process, os, path, process, http, eval 等
- 执行时间限制（默认 60 秒）
- 输出大小限制（1MB）

示例：
- skill_name: "remotion"
- file_path: "code/generate_video.py"
- language: "python"
- params: {"duration": 30, "fps": 30}
"""
)
def execute_skill_code_file(
    skill_name: str,
    file_path: str,
    language: str,
    params: str = "{}"
) -> str:
    """
    执行 skill 目录下的代码文件

    输入：
        skill_name: skill 名称
        file_path: 相对于 SKILL.md 的代码文件路径
        language: 语言类型 (python 或 javascript)
        params: JSON 格式的参数字符串
    输出：
        执行结果
    """
    try:
        params_dict = json.loads(params) if params else {}
    except json.JSONDecodeError:
        return f"错误：params 参数不是有效的 JSON 格式: {params}"

    return executor.execute_skill_file(skill_name, file_path, language, params_dict)


if __name__ == "__main__":
    exec_code_mcp.run(transport="sse")
