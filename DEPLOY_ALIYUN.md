# SamLang 阿里云部署文档

## 目录
1. [部署前准备](#部署前准备)
2. [国内镜像加速配置](#国内镜像加速配置)
3. [配置文件修改](#配置文件修改)
4. [Docker Compose 配置](#docker-compose-配置)
5. [部署步骤](#部署步骤)
6. [常见问题排查](#常见问题排查)
7. [后端 Agent 问题修复](#后端-agent-问题修复)

---

## 部署前准备

### 1. 服务器要求
- **操作系统**: CentOS 7+/Ubuntu 20.04+
- **内存**: 至少 4GB RAM（推荐 8GB）
- **磁盘**: 至少 50GB 可用空间
- **端口**: 80, 8000, 19530, 9091, 9000, 9001

### 2. 安装 Docker 和 Docker Compose

```bash
# 使用阿里云镜像安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 国内镜像加速配置

### 1. Docker 守护进程配置（/etc/docker/daemon.json）

创建或修改 Docker 配置文件：

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://ccr.ccs.tencentyun.com"
  ],
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 2. Dockerfile 镜像源替换

#### Dockerfile.backend（Python 后端）

```dockerfile
# Python 后端 Dockerfile - 阿里云适配版
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖（使用阿里云源）
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources \
    && sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources \
    && apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY pyproject.toml uv.lock* ./

# 配置 pip 使用阿里云镜像
RUN pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/ \
    && pip config set install.trusted-host mirrors.aliyun.com

# 安装 uv（如果不存在）
RUN pip install uv

# 配置 uv 使用阿里云镜像
ENV UV_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/
ENV UV_TRUSTED_HOST=mirrors.aliyun.com

# 使用 uv 安装依赖
RUN uv sync

# 复制源代码
COPY . .

# 创建数据目录
RUN mkdir -p /app/data/avatars

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Dockerfile.frontend（前端）

```dockerfile
# 前端 Nginx Dockerfile - 阿里云适配版
FROM node:20-alpine AS builder

# 使用阿里云 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app

# 复制 package 文件
COPY frontend/package*.json ./

# 安装依赖
RUN npm ci

# 复制前端源代码
COPY frontend/ ./

# 构建前端
RUN npm run build

# Nginx 阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 配置文件修改

### 1. 后端数据库路径修复

**问题**: 后端代码中数据库路径使用了相对路径 `../..`，在 Docker 容器中可能导致路径错误。

**修复方案**: 修改 `src/db/user.py` 和 `src/db/token_stats.py` 中的数据库路径配置：

#### src/db/user.py（第 10-16 行）

```python
import os

# 数据库文件路径 - 修改为使用环境变量或绝对路径
DB_PATH = os.getenv('DATABASE_URL', 'sqlite:///app/data/sam.db').replace('sqlite:///', '')
if not DB_PATH.startswith('/'):
    # 如果不是绝对路径，使用容器内的标准路径
    DB_PATH = '/app/data/sam.db'

# 确保数据目录存在
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
```

#### src/db/token_stats.py（第 10-16 行）

```python
import os

# 数据库文件路径 - 修改为使用环境变量或绝对路径
DB_PATH = os.getenv('DATABASE_URL', 'sqlite:///app/data/sam.db').replace('sqlite:///', '')
if not DB_PATH.startswith('/'):
    # 如果不是绝对路径，使用容器内的标准路径
    DB_PATH = '/app/data/sam.db'

# 确保数据目录存在
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
```

### 2. Milvus 配置修复

**问题**: Milvus 配置默认使用 `localhost`，在 Docker 网络中需要修改为服务名。

**修复方案**: 修改 `src/config/rag.py`：

```python
@dataclass
class MilvusConfig:
    """
    Milvus 向量数据库配置
    """
    host: str = "localhost"
    port: int = 19530

    def __post_init__(self):
        """从环境变量获取主机地址，优先级最高"""
        env_host = os.getenv("MILVUS_HOST", "")
        if env_host:
            self.host = env_host
        # Docker 环境下默认使用 milvus 服务名
        elif os.getenv("DOCKER_ENV", "") == "true":
            self.host = "milvus"
```

### 3. 配置文件路径修复

**问题**: `src/config/config.py` 中配置文件路径使用了相对路径。

**修复方案**: 修改 `src/config/config.py`：

```python
import os

# 获取配置文件路径，优先使用环境变量
CONFIG_PATH = os.getenv('CONFIG_PATH', 'config.yaml')

def get_config(config_path: str = None) -> Config:
    """
    获取全局配置实例（单例模式）
    """
    global _config_instance
    if _config_instance is None:
        path = config_path or CONFIG_PATH
        # 如果路径不是绝对路径，尝试从多个位置查找
        if not os.path.isabs(path):
            # 尝试当前目录
            if os.path.exists(path):
                pass
            # 尝试 /app 目录（Docker 容器）
            elif os.path.exists(f'/app/{path}'):
                path = f'/app/{path}'
            # 尝试 /app/src 目录
            elif os.path.exists(f'/app/src/{path}'):
                path = f'/app/src/{path}'
        _config_instance = Config.from_yaml(path)
    return _config_instance
```

### 4. 前端 API 地址配置

**问题**: 前端需要配置正确的后端 API 地址。

**修复方案**: 在服务器上创建 `frontend/.env.production`：

```bash
# 阿里云服务器部署时，将 localhost 替换为实际服务器 IP 或域名
VITE_API_URL=http://YOUR_SERVER_IP:8000
```

或者在构建时传入参数：

```bash
# Dockerfile.frontend 中修改构建命令
RUN VITE_API_URL=http://YOUR_SERVER_IP:8000 npm run build
```

---

## Docker Compose 配置

### docker-compose.aliyun.yaml（阿里云适配版）

```yaml
version: '3.8'

services:
  # Milvus 向量数据库
  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.5
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
      - ETCD_SNAPSHOT_COUNT=50000
    volumes:
      - etcd-data:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - sam-network

  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2023-03-20T20-16-18Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    ports:
      - "9001:9001"
      - "9000:9000"
    volumes:
      - minio-data:/minio_data
    command: minio server /minio_data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - sam-network

  milvus:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.4.15
    command: ["milvus", "run", "standalone"]
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    volumes:
      - milvus-data:/var/lib/milvus
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      etcd:
        condition: service_healthy
      minio:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - sam-network

  # 后端 API 服务
  backend:
    container_name: sam-backend
    build:
      context: .
      dockerfile: Dockerfile.backend.aliyun
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - EMBEDDING_API_KEY=${EMBEDDING_API_KEY}
      - RERANK_API_KEY=${RERANK_API_KEY}
      - PADDLEOCR_API_KEY=${PADDLEOCR_API_KEY}
      - TAVILY_API_KEY=${TAVILY_API_KEY}
      - YOUDAO_API_KEY=${YOUDAO_API_KEY}
      - YOUDAO_APP_SECRET=${YOUDAO_APP_SECRET}
      - JWT_SECRET=${JWT_SECRET:-your-secret-key-change-in-production}
      - MILVUS_HOST=milvus
      - MILVUS_PORT=19530
      - DATABASE_URL=sqlite:///app/data/sam.db
      - DOCKER_ENV=true
      - CONFIG_PATH=/app/config.yaml
      - UV_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/
      - UV_TRUSTED_HOST=mirrors.aliyun.com
    volumes:
      - backend-data:/app/data
      - ./config.yaml:/app/config.yaml:ro
    depends_on:
      milvus:
        condition: service_healthy
    networks:
      - sam-network
    restart: unless-stopped

  # 前端 Nginx 服务
  frontend:
    container_name: sam-frontend
    build:
      context: .
      dockerfile: Dockerfile.frontend.aliyun
      args:
        - VITE_API_URL=http://YOUR_SERVER_IP:8000  # 替换为实际服务器IP
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - sam-network
    restart: unless-stopped

volumes:
  etcd-data:
  minio-data:
  milvus-data:
  backend-data:

networks:
  sam-network:
    driver: bridge
```

---

## 部署步骤

### 1. 准备环境文件

在服务器上创建 `.env` 文件：

```bash
# OpenAI API 配置
OPENAI_API_KEY=your-openai-api-key

# Embedding API 配置 (SiliconFlow)
EMBEDDING_API_KEY=your-siliconflow-api-key

# Rerank API 配置
RERANK_API_KEY=your-rerank-api-key

# PaddleOCR API 配置
PADDLEOCR_API_KEY=your-paddleocr-api-key

# Tavily 搜索 API 配置
TAVILY_API_KEY=your-tavily-api-key

# 有道词典 API 配置
YOUDAO_API_KEY=your-youdao-api-key
YOUDAO_APP_SECRET=your-youdao-app-secret

# JWT 密钥 (生产环境请修改为强密码)
JWT_SECRET=your-secret-key-change-in-production
```

### 2. 准备配置文件

创建 `config.yaml`：

```yaml
# LLM 配置
llm:
  base_url: https://api.deepseek.com
  model_name: deepseek-reasoner
  temperature: 0.7
  max_tokens: 2000

# Agent 配置
agent:
  memory_type: buffer
  max_history: 10
  react_max_iterations: 6

# RAG 配置
rag:
  collection_name: rag_collection
  vector_dim: 1024
  chunk_size: 1024
  chunk_overlap: 0.1
  milvus:
    host: "milvus"  # Docker 服务名
    port: 19530

# Embedding 配置
embedding:
  model_name: BAAI/bge-large-zh-v1.5
  base_url: https://api.siliconflow.cn/v1/embeddings

# Rerank 配置
rerank:
  model_name: qwen-rerank
  base_url: https://api.deepseek.com

# OCR 配置
ocr:
  model_name: PaddleOCR-VL-1.5
  base_url: https://paddleocr.aistudio-app.com/api/v2/ocr/jobs

# 工具配置
tool:
  websearch:
    enabled: True
    api_url: "https://api.tavily.com"
  youdao_dictionary:
    enabled: True
    base_url: "https://openapi.youdao.com/v2/dict"

# 技能上传工具配置
skill:
  enabled: True
  url: "src/agent/skills/"
```

### 3. 上传代码到服务器

```bash
# 使用 rsync 或 scp 上传代码
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='__pycache__' \
  ./ root@YOUR_SERVER_IP:/opt/samlang/
```

### 4. 构建和启动服务

```bash
# 进入项目目录
cd /opt/samlang

# 构建并启动服务
docker-compose -f docker-compose.aliyun.yaml up -d --build

# 查看日志
docker-compose -f docker-compose.aliyun.yaml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.aliyun.yaml logs -f backend
```

### 5. 验证部署

```bash
# 检查容器状态
docker-compose -f docker-compose.aliyun.yaml ps

# 测试后端 API
curl http://localhost:8000/api/health

# 测试前端
curl http://localhost:80
```

---

## 常见问题排查

### 1. 镜像拉取失败

**症状**: `Error response from daemon: Get "https://registry-1.docker.io/v2/": net/http: request canceled`

**解决方案**:
```bash
# 检查镜像加速配置
cat /etc/docker/daemon.json

# 重启 Docker
sudo systemctl restart docker

# 手动拉取镜像测试
docker pull hello-world
```

### 2. 后端无法连接 Milvus

**症状**: `ConnectionError: 连接 Milvus 失败`

**解决方案**:
1. 检查 Milvus 是否健康运行：
```bash
docker-compose -f docker-compose.aliyun.yaml ps milvus
docker-compose -f docker-compose.aliyun.yaml logs milvus
```

2. 检查后端环境变量：
```bash
docker-compose -f docker-compose.aliyun.yaml exec backend env | grep MILVUS
```

3. 测试 Milvus 连接：
```bash
docker-compose -f docker-compose.aliyun.yaml exec backend python -c "
from pymilvus import connections
connections.connect(host='milvus', port='19530')
print('连接成功')
"
```

### 3. 前端无法访问后端 API

**症状**: 前端页面加载但 API 请求失败

**解决方案**:
1. 检查前端环境变量配置：
```bash
# 检查构建参数是否正确
docker-compose -f docker-compose.aliyun.yaml exec frontend cat /usr/share/nginx/html/assets/*.js | grep API_URL
```

2. 检查 Nginx 配置：
```bash
docker-compose -f docker-compose.aliyun.yaml exec frontend cat /etc/nginx/conf.d/default.conf
```

3. 检查后端是否可访问：
```bash
# 在容器内测试
docker-compose -f docker-compose.aliyun.yaml exec frontend wget -O- http://backend:8000/api/health
```

### 4. 数据库权限问题

**症状**: `sqlite3.OperationalError: unable to open database file`

**解决方案**:
```bash
# 检查数据目录权限
docker-compose -f docker-compose.aliyun.yaml exec backend ls -la /app/data/

# 修复权限
docker-compose -f docker-compose.aliyun.yaml exec backend chmod 755 /app/data
```

### 5. 内存不足

**症状**: Milvus 或后端容器频繁重启

**解决方案**:
```bash
# 查看系统内存
free -h

# 增加交换空间
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 后端 Agent 问题修复

### 1. 数据库路径问题

**文件**: `src/db/user.py` 和 `src/db/token_stats.py`

**修改内容**:
```python
# 原代码（第 13 行）
DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'samlang.db')

# 修改为
DB_PATH = os.getenv('DATABASE_URL', 'sqlite:///app/data/sam.db').replace('sqlite:///', '')
if not DB_PATH.startswith('/'):
    DB_PATH = '/app/data/sam.db'
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
```

### 2. 配置文件加载问题

**文件**: `src/config/config.py`

**修改内容**:
```python
# 在 get_config 函数中（第 123 行附近）
def get_config(config_path: str = "config.yaml") -> Config:
    global _config_instance
    if _config_instance is None:
        # 尝试多个路径
        paths_to_try = [
            config_path,
            '/app/config.yaml',
            '/app/src/config.yaml',
            os.path.join(os.path.dirname(__file__), '..', '..', 'config.yaml'),
        ]
        
        for path in paths_to_try:
            if os.path.exists(path):
                try:
                    _config_instance = Config.from_yaml(path)
                    logger.info(f"配置文件加载成功: {path}")
                    break
                except Exception as e:
                    logger.warning(f"尝试加载 {path} 失败: {e}")
                    continue
        else:
            raise FileNotFoundError(f"找不到有效的配置文件，尝试路径: {paths_to_try}")
    
    return _config_instance
```

### 3. Milvus 连接配置

**文件**: `src/config/rag.py`

**修改内容**:
```python
@dataclass
class MilvusConfig:
    host: str = "localhost"
    port: int = 19530

    def __post_init__(self):
        """从环境变量获取主机地址"""
        env_host = os.getenv("MILVUS_HOST", "")
        if env_host:
            self.host = env_host
            logger.info(f"从环境变量读取 Milvus 主机: {self.host}")
```

### 4. 技能文件路径

**文件**: `src/config/skill.py`

**检查内容**:
```python
# 确保技能路径在 Docker 容器内正确
@dataclass
class SkillUploadConfig:
    enabled: bool = True
    url: str = "src/agent/skills/"
    
    def __post_init__(self):
        # 转换为绝对路径
        if not os.path.isabs(self.url):
            # 尝试多个可能的路径
            possible_paths = [
                self.url,
                f'/app/{self.url}',
                f'/app/src/agent/skills/',
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    self.url = path
                    break
```

---

## 安全建议

1. **修改默认密码**: 修改所有默认密码和密钥
2. **配置防火墙**: 仅开放必要的端口（80, 443）
3. **使用 HTTPS**: 配置 SSL 证书
4. **定期备份**: 定期备份数据库和配置文件
5. **监控日志**: 配置日志轮转和监控

---

## 更新部署

```bash
# 拉取最新代码
cd /opt/samlang
git pull

# 重新构建并部署
docker-compose -f docker-compose.aliyun.yaml down
docker-compose -f docker-compose.aliyun.yaml up -d --build

# 清理旧镜像
docker image prune -f
```

---

## 联系支持

如有问题，请检查：
1. Docker 日志：`docker-compose logs`
2. 后端日志：`docker-compose logs backend`
3. Milvus 状态：`docker-compose ps milvus`
