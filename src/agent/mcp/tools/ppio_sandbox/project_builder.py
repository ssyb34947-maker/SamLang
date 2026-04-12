"""
Remotion 项目构建器
用于在沙箱中创建和配置 Remotion 项目
"""

import json
from typing import Dict, List, Optional
from dataclasses import dataclass
from loguru import logger

from .client import PPIOSandboxClient, SandboxInfo


# Remotion 项目模板
REMOTION_TEMPLATES = {
    "hello-world": {
        "description": "基础模板，单组件",
        "dependencies": [
            "remotion",
            "@remotion/cli",
            "react",
            "react-dom"
        ],
        "dev_dependencies": [
            "@types/react",
            "typescript"
        ]
    },
    "with-media": {
        "description": "包含媒体支持的模板",
        "dependencies": [
            "remotion",
            "@remotion/cli",
            "@remotion/media",
            "react",
            "react-dom"
        ],
        "dev_dependencies": [
            "@types/react",
            "typescript"
        ]
    },
    "with-voiceover": {
        "description": "包含配音生成的模板",
        "dependencies": [
            "remotion",
            "@remotion/cli",
            "@remotion/media",
            "react",
            "react-dom"
        ],
        "dev_dependencies": [
            "@types/react",
            "typescript"
        ],
        "env_vars": ["ELEVENLABS_API_KEY"]
    }
}


@dataclass
class SandboxProject:
    """沙箱项目信息"""
    sandbox_id: str
    project_name: str
    project_path: str
    template: str
    runtime: str


class RemotionProjectBuilder:
    """
    Remotion 项目构建器
    
    功能：
    - 在沙箱中创建 Remotion 项目结构
    - 安装依赖
    - 配置项目文件
    """
    
    def __init__(self, client: PPIOSandboxClient):
        """
        初始化项目构建器
        
        输入：
            client: PPIO 沙箱客户端
        """
        self.client = client
    
    def create_project(
        self,
        sandbox_id: str,
        project_name: str,
        template: str = "hello-world",
        additional_deps: Optional[List[str]] = None
    ) -> SandboxProject:
        """
        创建 Remotion 项目
        
        输入：
            sandbox_id: 沙箱 ID
            project_name: 项目名称
            template: 项目模板（hello-world, with-media, with-voiceover）
            additional_deps: 额外依赖列表
        
        输出：
            SandboxProject 对象
        """
        logger.info(f"[ProjectBuilder] 创建项目: name={project_name}, template={template}")
        
        # 获取模板配置
        template_config = REMOTION_TEMPLATES.get(template, REMOTION_TEMPLATES["hello-world"])
        
        # 创建项目目录
        project_path = f"/home/sandbox/{project_name}"
        self._create_directory_structure(sandbox_id, project_path)
        
        # 创建 package.json
        self._create_package_json(sandbox_id, project_path, template_config, additional_deps)
        
        # 创建 tsconfig.json
        self._create_tsconfig(sandbox_id, project_path)
        
        # 创建 remotion.config.ts
        self._create_remotion_config(sandbox_id, project_path)
        
        # 创建 src 目录结构
        self._create_src_directory(sandbox_id, project_path)
        
        # 创建 public 目录
        self._create_public_directory(sandbox_id, project_path)
        
        # 安装依赖
        self._install_dependencies(sandbox_id, project_path)
        
        project = SandboxProject(
            sandbox_id=sandbox_id,
            project_name=project_name,
            project_path=project_path,
            template=template,
            runtime="nodejs20"
        )
        
        logger.info(f"[ProjectBuilder] 项目创建完成: {project_path}")
        return project
    
    def _create_directory_structure(self, sandbox_id: str, project_path: str) -> None:
        """创建项目目录结构"""
        commands = [
            f"mkdir -p {project_path}",
            f"mkdir -p {project_path}/src",
            f"mkdir -p {project_path}/public"
        ]
        
        for cmd in commands:
            result = self.client.execute_command(sandbox_id, cmd, timeout=10)
            if result.exit_code != 0:
                logger.warning(f"[ProjectBuilder] 创建目录警告: {result.stderr}")
    
    def _create_package_json(
        self,
        sandbox_id: str,
        project_path: str,
        template_config: Dict,
        additional_deps: Optional[List[str]] = None
    ) -> None:
        """创建 package.json"""
        
        # 合并依赖
        dependencies = template_config["dependencies"].copy()
        if additional_deps:
            dependencies.extend(additional_deps)
            dependencies = list(set(dependencies))  # 去重
        
        package_json = {
            "name": "remotion-video",
            "version": "1.0.0",
            "private": True,
            "scripts": {
                "dev": "remotion studio",
                "build": "remotion render",
                "upgrade": "remotion upgrade"
            },
            "dependencies": {dep: "latest" for dep in dependencies},
            "devDependencies": {dep: "latest" for dep in template_config["dev_dependencies"]}
        }
        
        content = json.dumps(package_json, indent=2)
        remote_path = f"{project_path}/package.json"
        
        self.client.upload_file(sandbox_id, remote_path, content.encode('utf-8'))
        logger.info(f"[ProjectBuilder] 创建 package.json")
    
    def _create_tsconfig(self, sandbox_id: str, project_path: str) -> None:
        """创建 tsconfig.json"""
        tsconfig = {
            "compilerOptions": {
                "target": "ES2020",
                "module": "commonjs",
                "lib": ["ES2020", "DOM", "DOM.Iterable"],
                "jsx": "react-jsx",
                "strict": True,
                "noUnusedLocals": True,
                "noUnusedParameters": True,
                "noImplicitReturns": True,
                "noFallthroughCasesInSwitch": True,
                "esModuleInterop": True,
                "skipLibCheck": True,
                "allowSyntheticDefaultImports": True,
                "forceConsistentCasingInFileNames": True,
                "moduleResolution": "node",
                "resolveJsonModule": True,
                "isolatedModules": True
            },
            "include": ["src"]
        }
        
        content = json.dumps(tsconfig, indent=2)
        remote_path = f"{project_path}/tsconfig.json"
        
        self.client.upload_file(sandbox_id, remote_path, content.encode('utf-8'))
        logger.info(f"[ProjectBuilder] 创建 tsconfig.json")
    
    def _create_remotion_config(self, sandbox_id: str, project_path: str) -> None:
        """创建 remotion.config.ts"""
        config_content = """import {Config} from '@remotion/cli/config';

export const config: Config = {
  logLevel: 'verbose',
  ffmpegExecutable: null,
  ffprobeExecutable: null,
};
"""
        remote_path = f"{project_path}/remotion.config.ts"
        self.client.upload_file(sandbox_id, remote_path, config_content.encode('utf-8'))
        logger.info(f"[ProjectBuilder] 创建 remotion.config.ts")
    
    def _create_src_directory(self, sandbox_id: str, project_path: str) -> None:
        """创建 src 目录基础文件"""
        # 创建 index.ts
        index_content = """export * from './Root';
"""
        self.client.upload_file(
            sandbox_id,
            f"{project_path}/src/index.ts",
            index_content.encode('utf-8')
        )
        
        # 创建占位 Root.tsx
        root_content = """import {Composition} from 'remotion';

// 此文件将由 Agent 生成的代码替换
export const RemotionRoot = () => {
  return null;
};
"""
        self.client.upload_file(
            sandbox_id,
            f"{project_path}/src/Root.tsx",
            root_content.encode('utf-8')
        )
        
        logger.info(f"[ProjectBuilder] 创建 src 目录结构")
    
    def _create_public_directory(self, sandbox_id: str, project_path: str) -> None:
        """创建 public 目录"""
        # 创建 .gitkeep 保持目录
        self.client.upload_file(
            sandbox_id,
            f"{project_path}/public/.gitkeep",
            b""
        )
        logger.info(f"[ProjectBuilder] 创建 public 目录")
    
    def _install_dependencies(self, sandbox_id: str, project_path: str) -> None:
        """安装项目依赖"""
        logger.info(f"[ProjectBuilder] 开始安装依赖...")
        
        # 使用 npm install
        result = self.client.execute_command(
            sandbox_id,
            f"cd {project_path} && npm install",
            timeout=300
        )
        
        if result.exit_code != 0:
            logger.error(f"[ProjectBuilder] 依赖安装失败: {result.stderr}")
            raise RuntimeError(f"npm install 失败: {result.stderr}")
        
        logger.info(f"[ProjectBuilder] 依赖安装完成")
    
    def write_component_code(
        self,
        project: SandboxProject,
        root_code: str,
        component_code: Optional[str] = None
    ) -> None:
        """
        写入组件代码
        
        输入：
            project: 项目信息
            root_code: Root.tsx 代码
            component_code: 其他组件代码（可选）
        """
        # 写入 Root.tsx
        root_path = f"{project.project_path}/src/Root.tsx"
        self.client.upload_file(
            project.sandbox_id,
            root_path,
            root_code.encode('utf-8')
        )
        logger.info(f"[ProjectBuilder] 写入 Root.tsx")
        
        # 如果有其他组件代码，也写入
        if component_code:
            # 这里可以扩展支持多个组件文件
            pass
    
    def upload_asset(
        self,
        project: SandboxProject,
        filename: str,
        content: bytes
    ) -> str:
        """
        上传素材文件到 public 目录
        
        输入：
            project: 项目信息
            filename: 文件名
            content: 文件内容
        
        输出：
            文件在 public 目录中的路径
        """
        remote_path = f"{project.project_path}/public/{filename}"
        self.client.upload_file(project.sandbox_id, remote_path, content)
        
        logger.info(f"[ProjectBuilder] 上传素材: {filename}")
        return f"public/{filename}"
    
    @staticmethod
    def get_available_templates() -> Dict[str, str]:
        """获取可用模板列表"""
        return {
            name: config["description"]
            for name, config in REMOTION_TEMPLATES.items()
        }
