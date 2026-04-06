# SamLang 项目 Docker 部署指南

## 项目架构

这是一个全栈 AI 英语学习助手项目，包含：

- **前端**: React + Vite + TypeScript + TailwindCSS
- **后端**: FastAPI + Python 3.11
- **向量数据库**: Milvus (用于 RAG 知识库)
- **对象存储**: MinIO (Milvus 依赖)
- **服务发现**: etcd (Milvus 依赖)

## 部署步骤

### 1. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填入你的 API 密钥
nano .env
```

需要配置的 API 密钥：
- `OPENAI_API_KEY`: OpenAI 或 DeepSeek API 密钥
- `EMBEDDING_API_KEY`: SiliconFlow API 密钥 (用于文本嵌入)
- `RERANK_API_KEY`: Rerank API 密钥
- `PADDLEOCR_API_KEY`: PaddleOCR API 密钥 (用于图片 OCR)
- `TAVILY_API_KEY`: Tavily 搜索 API 密钥
- `YOUDAO_API_KEY` & `YOUDAO_APP_SECRET`: 有道词典 API 密钥

### 2. 构建并启动服务

```bash
# 构建所有镜像并启动
docker-compose up --build -d

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f milvus
```

### 3. 访问应用

- **前端界面**: http://localhost
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **Milvus 控制台**: http://localhost:9091
- **MinIO 控制台**: http://localhost:9001 (账号: minioadmin / 密码: minioadmin)

### 4. 常用命令

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷 (清空所有数据)
docker-compose down -v

# 重启服务
docker-compose restart

# 进入后端容器
docker-compose exec backend bash

# 查看容器状态
docker-compose ps
```

### 5. 生产环境注意事项

1. **修改 JWT 密钥**: 在 `.env` 文件中设置强密码
2. **配置 HTTPS**: 建议使用 Nginx 或 Traefik 作为反向代理，配置 SSL 证书
3. **修改 Milvus 和 MinIO 密码**: 生产环境不要使用默认密码
4. **数据备份**: 定期备份 `backend-data` 和 `milvus-data` 卷
5. **资源限制**: 根据服务器配置调整 Docker 容器资源限制

### 6. 配置文件说明

- `Dockerfile.backend`: 后端服务镜像构建配置
- `Dockerfile.frontend`: 前端服务镜像构建配置
- `nginx.conf`: Nginx 反向代理配置
- `docker-compose.yaml`: 服务编排配置
- `.env`: 环境变量配置 (需要手动创建)

### 7. 故障排查

**问题1**: Milvus 启动失败
- 检查端口 19530 是否被占用
- 确保有足够的磁盘空间

**问题2**: 后端无法连接 Milvus
- 检查 `MILVUS_HOST` 环境变量是否设置为 `milvus`
- 等待 Milvus 完全启动后再启动后端

**问题3**: 前端无法访问 API
- 检查 Nginx 配置中的后端服务名是否正确
- 确保后端服务已正常启动

## 系统要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 内存 (推荐 8GB+)
- 至少 20GB 磁盘空间
