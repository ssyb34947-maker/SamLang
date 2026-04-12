"""
代码执行工具
用于在受限环境中执行 Python 或 JavaScript 代码
支持两种模式：
1. 执行代码字符串（Agent 生成的代码）
2. 执行 skill 目录下的代码文件

新增：支持 PPIO 云沙箱执行模式（用于 Remotion 视频生成）
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
from loguru import logger

# 导入 PPIO 沙箱模块
from .ppio_sandbox import (
    PPIOSandboxClient,
    RemotionExecutor,
    create_storage,
    PPIOError,
)
from src.config import get_config

exec_code_mcp = FastMCP(name="exec_code")


class Language(str, Enum):
    """支持的语言类型"""
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"


class ExecutionMode(str, Enum):
    """执行模式"""
    LOCAL = "local"
    PPIO = "ppio"
    AUTO = "auto"


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
    - 支持本地执行和 PPIO 云沙箱执行
    - 禁止访问父目录（路径穿越保护）
    - 限制执行时间和资源
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

        # PPIO 执行器（延迟初始化）
        self._ppio_executor: Optional[RemotionExecutor] = None

    def _get_ppio_executor(self) -> Optional[RemotionExecutor]:
        """获取 PPIO 执行器（延迟初始化）"""
        if self._ppio_executor is None:
            try:
                config = get_config()
                if not config.tool.ppio_sandbox.enabled:
                    return None

                ppio_config = config.tool.ppio_sandbox
                client = PPIOSandboxClient(
                    api_key=ppio_config.api_key,
                    base_url=ppio_config.base_url if ppio_config.base_url else None
                )
                storage = create_storage({
                    "type": ppio_config.video_storage.type,
                    "local_path": ppio_config.video_storage.local_path,
                    "local_url": ppio_config.video_storage.local_url,
                })
                self._ppio_executor = RemotionExecutor(client, storage, {})
                logger.info("[CodeExecutor] PPIO 执行器初始化成功")
            except Exception as e:
                logger.error(f"[CodeExecutor] PPIO 执行器初始化失败: {str(e)}")
                return None
        return self._ppio_executor

    def _select_execution_mode(
        self,
        code: str,
        language: str,
        project_type: str,
        user_mode: str
    ) -> ExecutionMode:
        """
        智能选择执行模式
        
        选择 PPIO 的条件：
        - project_type 为 remotion
        - 代码包含长时间运行特征
        - 需要网络访问
        - 需要文件系统操作
        """
        if user_mode != "auto":
            return ExecutionMode(user_mode)

        # Remotion 项目强制使用 PPIO
        if project_type == "remotion":
            return ExecutionMode.PPIO

        # TypeScript 代码默认使用 PPIO（需要 Node.js 环境）
        if language.lower() == "typescript":
            return ExecutionMode.PPIO

        # 包含长时间运行特征
        if any(kw in code for kw in ["render", "build", "compile", "ffmpeg"]):
            return ExecutionMode.PPIO

        # 需要网络访问
        if any(kw in code for kw in ["fetch", "axios", "request", "http"]):
            return ExecutionMode.PPIO

        # 默认本地执行
        return ExecutionMode.LOCAL

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
        import_patterns = [
            r'^import\s+([a-zA-Z_][a-zA-Z0-9_]*)',
            r'^from\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)',
            r'^import\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)',
        ]

        for line in code.split('\n'):
            line = line.strip()

            if not line or line.startswith('#'):
                continue

            for pattern in import_patterns:
                match = re.match(pattern, line)
                if match:
                    module_name = match.group(1).split('.')[0]
                    if module_name in blacklist:
                        return f"安全错误：禁止使用危险模块 '{module_name}'"

            dangerous_calls = [
                r'\beval\s*\(',
                r'\bexec\s*\(',
                r'\b__import__\s*\(',
                r'\bcompile\s*\(',
            ]

            for pattern in dangerous_calls:
                if re.search(pattern, line):
                    func_name = pattern.replace(r'\b', '').replace(r'\s*\(', '')
                    return f"安全错误：禁止使用危险函数 '{func_name}'"

        return None

    def _check_javascript_safety(self, code: str, blacklist: Set[str]) -> Optional[str]:
        """检查 JavaScript 代码安全性"""
        require_pattern = r"require\s*\(\s*['\"]([^'\"]+)['\"]\s*\)"
        import_patterns = [
            r"import\s+.*?\s+from\s+['\"]([^'\"]+)['\"]",
            r"import\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",
        ]

        for line in code.split('\n'):
            line = line.strip()

            if not line or line.startswith('//') or line.startswith('/*'):
                continue

            matches = re.finditer(require_pattern, line)
            for match in matches:
                module_name = match.group(1)
                top_module = module_name.split('/')[0]
                if top_module in blacklist or module_name in blacklist:
                    return f"安全错误：禁止使用危险模块 '{module_name}'"

            for pattern in import_patterns:
                match = re.search(pattern, line)
                if match:
                    module_name = match.group(1)
                    top_module = module_name.split('/')[0]
                    if top_module in blacklist or module_name in blacklist:
                        return f"安全错误：禁止使用危险模块 '{module_name}'"

            dangerous_patterns = [
                r'\beval\s*\(',
                r'\bFunction\s*\(',
                r'new\s+Function\s*\(',
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
            raise ValueError(f"不支持的语言 '{language}'，支持的语言: python, javascript, typescript")

    def _prepare_environment(
        self,
        lang_config: Dict,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """准备执行环境变量"""
        env = os.environ.copy()
        env['PATH'] = '/usr/bin:/bin:/usr/local/bin'
        env.update(lang_config.get("env_vars", {}))

        if params:
            env['SKILL_PARAMS'] = json.dumps(params, ensure_ascii=False)

        return env

    def _execute_code_local(
        self,
        code: str,
        language: Language,
        work_dir: Optional[Path] = None,
        params: Optional[Dict[str, Any]] = None,
        timeout: Optional[int] = None
    ) -> str:
        """本地执行代码"""
        if len(code) > self.max_code_size:
            return f"错误：代码过大 ({len(code) / 1024:.2f}KB)，最大允许 {self.max_code_size / 1024:.2f}KB"

        safety_error = self._check_code_safety(code, language)
        if safety_error:
            return safety_error

        lang_config = self.language_config.get(language, self.language_config[Language.PYTHON])
        exec_timeout = timeout or self.timeout

        import tempfile
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            code_file = temp_path / f"main{lang_config['extension']}"
            code_file.write_text(code, encoding='utf-8')

            env = self._prepare_environment(lang_config, params)
            cwd = str(work_dir) if work_dir else str(temp_path)

            try:
                cmd = lang_config["command"] + [str(code_file)]
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=exec_timeout,
                    env=env,
                    cwd=cwd,
                )

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
        timeout: Optional[int] = None,
        execution_mode: str = "auto",
        project_type: str = "generic",
        dependencies: Optional[List[str]] = None,
        assets: Optional[Dict[str, Any]] = None,
        render_config: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> str:
        """
        执行代码字符串

        输入：
            code: 代码字符串
            language: 语言类型
            params: 参数字典
            timeout: 超时时间
            execution_mode: 执行模式 (local/ppio/auto)
            project_type: 项目类型
            dependencies: 额外依赖
            assets: 素材文件
            render_config: 渲染配置
            user_id: 用户ID（系统注入）
        """
        try:
            if not code or not code.strip():
                return "错误：code 不能为空"

            # 选择执行模式
            mode = self._select_execution_mode(code, language, project_type, execution_mode)
            logger.info(f"[CodeExecutor] 执行模式: {mode}, 语言: {language}, 项目类型: {project_type}")

            # PPIO 模式
            if mode == ExecutionMode.PPIO:
                ppio_executor = self._get_ppio_executor()
                if ppio_executor is None:
                    return "错误：PPIO 执行器未初始化，请检查配置"

                if not user_id:
                    return "错误：user_id 未提供（系统注入失败）"

                result = ppio_executor.execute(
                    user_id=user_id,
                    code=code.strip(),
                    language=language,
                    project_type=project_type,
                    dependencies=dependencies,
                    assets=assets,
                    render_config=render_config,
                    timeout=timeout or 600
                )

                return json.dumps(result, ensure_ascii=False)

            # 本地模式
            else:
                lang = self._validate_language(language)
                return self._execute_code_local(code.strip(), lang, None, params, timeout)

        except Exception as e:
            logger.error(f"[CodeExecutor] 执行失败: {str(e)}")
            return f"执行代码失败：{str(e)}"


# 创建执行器实例
executor = CodeExecutor()


@exec_code_mcp.tool(
    name="execute_code_string",
    description="""执行代码字符串（Agent 生成的代码）。

使用场景：
- Agent 生成了 Python 或 JavaScript 代码，需要立即执行
- 需要运行动态生成的代码片段
- Remotion 视频生成（使用 TypeScript）

⚠️ 重要：以下参数由系统自动注入，Agent 请勿填写：
- _user_id: 当前用户ID（系统自动从登录会话获取）

Agent 可填参数：
- code: 代码内容
- language: 编程语言 (python/javascript/typescript)
- project_type: 项目类型 (generic/remotion/python/nodejs)
- dependencies: 额外依赖列表（JSON数组格式）
- assets: 素材文件（JSON对象，文件名->内容/URL）
- render_config: 渲染配置（Remotion项目，包含 composition_id, output_format, quality）

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
- typescript: TypeScript/Remotion (使用 PPIO 沙箱)

执行模式：
- local: 本地执行（简单代码）
- ppio: 派欧云沙箱（视频生成、长时间任务）
- auto: 自动选择（默认）

安全限制：
- 禁止使用的 Python 模块：os, sys, subprocess, pathlib, shutil, socket, urllib, eval, exec 等
- 禁止使用的 JavaScript 模块：fs, child_process, os, path, process, http, eval 等
- 执行时间限制（默认 60 秒，视频渲染 600 秒）
- 输出大小限制（1MB）
- 代码大小限制（1MB）

示例：
- code: "print('Hello, World!')"
- language: "python"
- params: {"name": "Sam"}

Remotion 视频生成示例：
- code: "import {Composition} from 'remotion'; ..."
- language: "typescript"
- project_type: "remotion"
- dependencies: '["@remotion/media"]'
- render_config: '{"composition_id": "MyVideo", "output_format": "mp4", "quality": "1080p"}'
"""
)
def execute_code_string(
    code: str,
    language: str,
    params: str = "{}",
    execution_mode: str = "auto",
    project_type: str = "generic",
    dependencies: str = "[]",
    assets: str = "{}",
    render_config: str = "{}",
    _user_id: str = ""  # 系统注入，Agent 不可见
) -> str:
    """
    执行代码字符串

    输入：
        code: 代码字符串
        language: 语言类型
        params: JSON 格式的参数字符串
        execution_mode: 执行模式
        project_type: 项目类型
        dependencies: 额外依赖列表（JSON数组）
        assets: 素材文件（JSON对象）
        render_config: 渲染配置（JSON对象）
        _user_id: 用户ID（系统自动注入）
    输出：
        执行结果
    """
    try:
        params_dict = json.loads(params) if params else {}
        dependencies_list = json.loads(dependencies) if dependencies else []
        assets_dict = json.loads(assets) if assets else {}
        render_config_dict = json.loads(render_config) if render_config else {}
    except json.JSONDecodeError as e:
        return f"错误：参数不是有效的 JSON 格式: {str(e)}"

    return executor.execute_code_string(
        code=code,
        language=language,
        params=params_dict,
        timeout=None,
        execution_mode=execution_mode,
        project_type=project_type,
        dependencies=dependencies_list,
        assets=assets_dict,
        render_config=render_config_dict,
        user_id=_user_id if _user_id else None
    )


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
        language: 语言类型
        params: JSON 格式的参数字符串
    输出：
        执行结果
    """
    try:
        params_dict = json.loads(params) if params else {}
    except json.JSONDecodeError:
        return f"错误：params 参数不是有效的 JSON 格式: {params}"

    # 使用本地执行模式执行 skill 文件
    try:
        if not skill_name or not skill_name.strip():
            return "错误：skill_name 不能为空"

        if not file_path or not file_path.strip():
            return "错误：file_path 不能为空"

        skill_name = skill_name.strip()
        file_path = file_path.strip()

        lang = executor._validate_language(language)

        if os.path.isabs(file_path):
            return f"错误：不允许使用绝对路径 '{file_path}'"

        expected_ext = executor.language_config.get(lang, {}).get("extension", ".py")
        if not file_path.endswith(expected_ext):
            return f"错误：{language} 代码文件应该以 {expected_ext} 结尾"

        path_parts = Path(file_path).parts
        for part in path_parts:
            if part == '..' or part == '.':
                continue
            if not executor._is_safe_path_component(part):
                return f"错误：路径包含不安全的组件 '{part}'"

        try:
            target_path = executor._resolve_path(skill_name, file_path)
        except ValueError as e:
            return f"错误：{str(e)}"

        if not target_path.exists():
            return f"错误：文件不存在 '{file_path}'（在 skill '{skill_name}' 中）"

        if not target_path.is_file():
            return f"错误：路径不是文件 '{file_path}'"

        file_size = target_path.stat().st_size
        if file_size > executor.max_code_size:
            return f"错误：代码文件过大 ({file_size / 1024:.2f}KB)，最大允许 {executor.max_code_size / 1024:.2f}KB"

        try:
            code = target_path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            return f"错误：文件 '{file_path}' 不是有效的 UTF-8 文本文件"

        return executor._execute_code_local(code, lang, target_path.parent, params_dict)

    except Exception as e:
        return f"执行代码失败：{str(e)}"


if __name__ == "__main__":
    exec_code_mcp.run(transport="sse")
