# SamCollege

## 项目背景与使命

SamCollege（山姆学院）是一个面向全学科的 AI 教学平台。我们相信，优质的教育资源应该是普惠的、个性化的。通过先进的人工智能技术，SamCollege 致力于为每一位学习者提供专属的"数字教授"，让知识触手可及。

我们的任务是通过 AI 技术打破传统教育的时空限制，构建一个能够自更新、自适应的智能教学系统，为学习者提供真正个性化的学习体验。

**在线体验**：[https://samcollege.top](http://8.130.25.169:5173/) - 立即注册，开启你的智能学习之旅（备案中）

!\[home0]\(img/home0.png null)

<br />

***

## 核心功能

SamCollege 提供 12+ 核心功能，覆盖学习全流程：

**AI 教学**

- 教授授课 - 集成最前沿智能体算法的教授 AGENT，提供超越传统聊天机器人的教学体验
- 策略自迭代 - 基于 Open CLaw 的记忆系统，24 小时自动更新教学策略
- 全学科教学 - 覆盖数学、物理、化学、英语等全学科内容，支持输出教学视频等多模态教学

**智能系统**

- Open Claw 系统 - 系统级运行能力，深度集成操作系统
- Agent 终端助教 - 关注用户学习进度、反馈、需求，智能调整教学策略
- AI 数据分析 - 机器学习算法迭代，多维度洞察学习表现

**知识管理**

- 自支持知识库 - 上传文档、PDF、笔记，AI 自动整理、归纳、关联知识点
- 自更新知识库 - 知识库持续进化，AI 自动发现新知识、更新旧内容
- 笔记管理 - 内置 Markdown 编辑器，支持标注、笔记、AI 智能解析

**学习追踪**

- 学习看板 - 可视化展示学习进度、知识点掌握情况、学习时间分布
- 精准施教 - 基于机器学习算法，由 SKILL 驱动，动态调整教学策略
- 多风格系统+双语 - 支持 5 种风格和中英文双语系统

***

## 项目结构

```
SamCollege/
├── src/
│   ├── agent/
│   │   ├── core/
│   │   ├── mcp/
│   │   ├── skills/
│   │   ├── prompt/
│   │   ├── query/
│   │   ├── util/
│   │   ├── llm/
│   │   ├── agent.py
│   │   ├── factory.py
│   │   ├── memory.py
│   │   ├── planner.py
│   │   └── tools.py
│   ├── api/
│   │   ├── rag/
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── cold_start.py
│   │   ├── conversation.py
│   │   └── reset.py
│   ├── auth/
│   ├── config/
│   ├── db/
│   ├── rag/
│   │   ├── chunker/
│   │   ├── embedding/
│   │   ├── loader/
│   │   ├── reranker/
│   │   ├── retriever/
│   │   └── vector_store/
│   ├── schemas/
│   ├── service/
│   ├── ocr/
│   └── code_start/
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── services/
├── config.yaml
├── main.py
├── pyproject.toml
└── start.bat
```

***

## 项目启动

### 环境要求

- Python 3.11+
- Node.js 18+
- Milvus 向量数据库

### 后端启动

**一键启动（Windows）：**

```bash
start.bat
```

**手动启动：**

```bash
# 安装依赖
uv sync

# 启动服务
uv run -m main
```

后端服务将在 <http://localhost:8000> 运行

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端将在 <http://localhost:5173> 运行

### 配置说明

复制 `.env.example` 为 `.env`，填写以下关键配置：

- LLM API Key（DeepSeek 或其他兼容 OpenAI 接口的模型）
- 向量数据库连接信息
- 其他可选工具 API Key

***

SamCollege - 让每一分钟的学习都有价值
