---
name: query_enhancement
description: 教授级Query改写与初步规划策略 - 作为启动技能，帮助Agent分析用户意图、改写查询并进行初步规划。注意：执行完此技能后，必须检查是否有其他专业skill可用。
metadata:
  tags: query-rewriting, tool-selection, search-strategy, professor-level, startup-skill
  author: SamCollege
  version: 2.0.0
tools:
  - websearch
  - dictionary
  - rag_search
  - read_file
  - exec_code
---

# Query Enhancement Skill (启动技能)

## ⚠️ 重要提示

**此技能是启动技能，仅用于初步规划和意图分析。执行完此技能后，你必须：**

1. **检查是否有其他专业skill可用** - 使用 `download_skill` 查看是否有针对当前任务的专门skill
2. **如果找到相关skill，优先使用该skill的完整流程**
3. **只有在没有其他skill适用时，才使用此skill的通用流程**

---

## 何时使用此技能

当用户提出任何问题时，**教授Agent必须首先使用此技能**来：
1. 分析用户真实意图
2. 判断是否需要工具增强
3. 改写查询以获得更好的结果
4. **初步规划后，检查是否有其他专业skill可用**

**不要直接回答用户问题**，先执行此技能的SOP流程。

---

# 核心流程（必须按顺序执行）

## Step 1: 意图分析 (Intent Analysis)

分析用户的输入，确定以下维度：

| 维度 | 问题 | 示例 |
|------|------|------|
| **主题领域** | 用户问的是什么领域？ | 编程、历史、科学、语言学习、视频生成 |
| **问题类型** | 这是什么类型的问题？ | 定义、比较、步骤、故障排查、创作 |
| **深度要求** | 需要多详细的回答？ | 概览、详细、专业级 |
| **时效性** | 需要最新信息吗？ | 历史事实 vs 最新技术 |
| **语言需求** | 需要特定语言资源？ | 英文单词、外文资料 |
| **是否需要代码执行** | 是否需要运行代码？ | 视频生成、数据分析、代码测试 |

### 意图分析输出格式

```
意图分析:
- 主题: [领域]
- 类型: [问题类型]
- 深度: [浅/中/深]
- 时效: [历史/当前/最新]
- 语言: [中文/英文/其他]
- 需代码执行: [是/否]
```

---

## Step 2: 检查专业Skill可用性 ⭐关键步骤

**在完成意图分析后，必须执行此步骤！**

基于意图分析的主题领域，检查是否有专门skill：

### 专业Skill匹配表

| 主题领域 | 可能的专业Skill | 检查命令 |
|---------|----------------|---------|
| 视频生成/Remotion | remotion | `download_skill("remotion")` |
| 单词学习/词汇记忆 | word_learning | `download_skill("word_learning")` |
| 作文/写作 | essay_writing | `download_skill("essay_writing")` |
| 其他专业领域 | [对应skill] | `download_skill("[skill_name]")` |

### 检查流程

```
1. 根据意图分析确定主题领域
2. 调用 download_skill 检查是否有对应专业skill
3. 如果存在：
   - 读取 SKILL.md 了解完整流程
   - 按照该skill的SOP执行
   - 此启动skill的任务完成
4. 如果不存在：
   - 继续使用此skill的通用流程
```

---

## Step 3: 工具选择决策树

**仅在确认没有其他专业skill适用时，才使用此决策树！**

基于意图分析，按以下决策树选择工具：

### 决策节点 1: 是否需要执行代码？
- **是** → 使用 `exec_code` 执行代码（支持Python/JavaScript/TypeScript）
  - 视频生成 → 使用 PPIO 沙箱 + Remotion
  - 数据分析 → 使用 Python
  - 代码测试 → 根据语言选择
- **否** → 继续下一步

### 决策节点 2: 是否涉及专业知识库？
- **是** → 使用 `rag_search` 检索知识库
- **否** → 继续下一步

### 决策节点 3: 是否涉及英文单词或术语？
- **是** → 使用 `dictionary` 获取准确释义
- **否** → 继续下一步

### 决策节点 4: 是否需要最新网络信息？
- **是** → 使用 `websearch` 搜索最新资料
- **否** → 基于已有知识回答

### 决策节点 5: 是否需要特定技能文档？
- **是** → 使用 `read_file` 读取技能子文档
- **否** → 继续下一步

---

## Step 4: Query改写策略

### 改写原则

1. **具体化**: 将模糊问题改为具体问题
   - ❌ "讲讲Python"
   - ✅ "Python 3.10 的新特性有哪些，特别是模式匹配语法的使用方法"

2. **结构化**: 添加结构化关键词
   - ❌ "怎么学习React"
   - ✅ "React 18 学习路线图：从Hooks到并发模式的最佳实践"

3. **上下文补充**: 补充必要的背景信息
   - ❌ "这个报错什么意思"
   - ✅ "React useEffect hook dependency警告：React Hook useEffect has a missing dependency"

4. **多语言扩展**: 对于技术问题，添加英文关键词
   - ❌ "解释闭包"
   - ✅ "JavaScript闭包(Closure)原理：作用域链与内存泄漏防范"

### 改写模板

```
原始Query: [用户原话]
改写后Query: [增强版本]
改写理由:
- [理由1]
- [理由2]
```

---

## Step 5: 工具调用SOP

### 工具调用顺序

**必须按以下优先级顺序调用：**

1. **exec_code** (代码执行) - 如果需要执行代码/生成视频
2. **rag_search** (知识库检索) - 如果有相关知识库
3. **dictionary** (词典查询) - 如果涉及术语
4. **websearch** (网络搜索) - 如果需要最新信息
5. **read_file** (读取文件) - 如果需要技能子文档

### exec_code 调用规范 ⭐新增

```
何时调用:
- 用户要求生成视频（Remotion）
- 需要执行Python/JavaScript代码
- 需要进行数据分析或处理
- 需要运行测试代码

参数说明:
- code: 代码字符串
- language: 语言类型 (python/javascript/typescript)
- execution_mode: 执行模式 (local/ppio/auto)
- project_type: 项目类型 (generic/remotion)
- dependencies: 额外依赖列表（JSON数组格式）
- render_config: 渲染配置（用于视频生成）

Remotion视频生成示例:
- language: "typescript"
- project_type: "remotion"
- execution_mode: "ppio"
- dependencies: '["@remotion/media"]'  
- render_config: '{"composition_id": "MyVideo", "output_format": "mp4", "quality": "1080p"}'
```

### rag_search 调用规范

```
何时调用:
- 问题涉及已建立的知识领域
- 需要准确的专业知识
- 用户询问特定技能相关内容

Query改写要点:
- 提取核心关键词
- 添加领域限定词
- 使用专业术语

示例:
原始: "怎么写好React代码"
改写: "React 18 最佳实践 性能优化 代码规范"
```

### dictionary 调用规范

```
何时调用:
- 用户询问英文单词含义
- 需要技术术语的准确定义
- 涉及词根词缀分析

Query改写要点:
- 提取待查询的单词
- 如果是技术术语，添加上下文

示例:
原始: "ephemeral是什么意思"
查询词: "ephemeral"
```

### websearch 调用规范

```
何时调用:
- 需要最新信息（2024年后）
- 问题涉及时事、新技术
- 知识库中没有相关内容

Query改写要点:
- 添加时间限定（如 "2024" "latest"）
- 使用英文关键词（技术问题）
- 添加权威来源限定（如 "site:github.com"）

示例:
原始: "React最新版本有什么新功能"
改写: "React 19 new features 2024 official documentation"
```

### read_file 调用规范

```
何时调用:
- 需要特定技能的详细规则
- 问题涉及技能子模块
- 需要代码示例或最佳实践

调用方式:
1. 先确定需要哪个技能
2. 确定需要哪个子文件
3. 调用 read_file(skill_name, file_path)

示例:
skill_name: "remotion"
file_path: "rules/animations.md"
```

---

## Step 6: 结果整合策略

### 整合流程

1. **收集所有工具结果**
2. **去重和冲突解决**
   - 多个来源的信息，优先使用权威来源
   - 时间冲突时，使用最新信息
3. **结构化组织**
   - 按逻辑顺序排列
   - 添加过渡语句
4. **补充教授级洞察**
   - 添加背景知识
   - 提供最佳实践建议
   - 指出常见误区

### 输出格式

```
## 思考过程

### 1. 意图分析
[分析结果]

### 2. 专业Skill检查
- 检查skill: [skill名称]
- 是否可用: [是/否]
- 使用策略: [使用专业skill / 使用通用流程]

### 3. 工具选择
- 选择工具: [工具列表]
- 选择理由: [理由]

### 4. Query改写
- 原始: [原query]
- 改写: [改写后]
- 理由: [改写理由]

### 5. 工具执行
[工具调用过程和结果摘要]

### 6. 最终答案
[整合后的完整回答]
```

---

# 示例场景

## 示例 1: 视频生成请求 ⭐使用exec_code

**用户**: "帮我生成一个介绍React的视频"

**执行流程**:

1. **意图分析**:
   - 主题: 视频生成 / React
   - 类型: 创作/生成
   - 深度: 中
   - 时效: 当前
   - 语言: 中文
   - 需代码执行: **是**

2. **检查专业Skill**:
   - 调用 `download_skill("remotion")`
   - 发现存在remotion skill
   - **切换到remotion skill执行完整流程**

---

## 示例 2: 技术问题

**用户**: "React useEffect怎么用"

**执行流程**:

1. **意图分析**:
   - 主题: 前端开发 / React
   - 类型: 教程/使用方法
   - 深度: 中
   - 时效: 当前
   - 语言: 中文
   - 需代码执行: 否

2. **检查专业Skill**:
   - 调用 `download_skill("react_learning")` - 不存在
   - 调用 `download_skill("frontend")` - 不存在
   - **无专业skill，使用通用流程**

3. **工具选择**:
   - rag_search: 是（如果有React知识库）
   - websearch: 是（获取最新最佳实践）
   - dictionary: 否
   - exec_code: 否

4. **Query改写**:
   - 原始: "React useEffect怎么用"
   - 改写: "React useEffect hook complete guide 2024 best practices dependencies"
   - 理由: 添加"complete guide"获取全面教程，"best practices"获取最佳实践，"dependencies"强调依赖管理

5. **工具执行**:
   ```
   rag_search: "React useEffect 使用指南 依赖项"
   websearch: "React useEffect hook complete guide 2024 best practices"
   ```

6. **结果整合**:
   - 结合知识库的基础概念
   - 补充网络搜索的最新模式
   - 添加教授级建议：常见错误、性能优化

## 示例 3: 语言学习

**用户**: "transport这个词怎么记"

**执行流程**:

1. **意图分析**:
   - 主题: 英语学习
   - 类型: 词汇记忆
   - 深度: 中
   - 时效: 历史
   - 语言: 英文
   - 需代码执行: 否

2. **检查专业Skill**:
   - 调用 `download_skill("word_learning")`
   - 发现存在word_learning skill
   - **切换到word_learning skill执行完整流程**

---

# 注意事项

## DO
- ✅ 始终先执行意图分析
- ✅ **必须检查专业skill可用性**
- ✅ 如有专业skill，优先使用其完整流程
- ✅ 按优先级顺序调用工具
- ✅ 改写query以提高搜索质量
- ✅ 整合多个工具的结果
- ✅ 添加教授级的深度见解

## DON'T
- ❌ 直接回答而不分析意图
- ❌ **忘记检查其他skill可用性**
- ❌ 在有专业skill时仍用通用流程
- ❌ 随意调用工具而不改写query
- ❌ 忽视工具返回的错误
- ❌ 简单堆砌工具结果
- ❌ 忽略用户的真实需求

---

# 工具调用检查清单

在最终回答前，确认：

- [ ] 是否已完成意图分析？
- [ ] **是否已检查专业skill可用性？**
- [ ] **如果存在专业skill，是否已切换使用？**
- [ ] 是否选择了合适的工具？
- [ ] 是否改写了query？
- [ ] 是否按顺序调用了工具？
- [ ] 是否整合了所有结果？
- [ ] 是否添加了教授级建议？
- [ ] 是否检查了工具调用的成功状态？
