# Query Enhancement Skill 使用示例

## 示例 1: 技术问题 - React useEffect

### 用户输入
```
"React useEffect怎么用"
```

### 教授 Agent 执行流程

#### Step 1: 下载 Skill
```
download_skill("query_enhancement")
```

#### Step 2: 意图分析
```
意图分析:
- 主题: 前端开发 / React
- 类型: 教程/使用方法
- 深度: 中
- 时效: 当前
- 语言: 中文
```

#### Step 3: 工具选择决策
- ✅ rag_search: 是（检索React知识库）
- ❌ dictionary: 否
- ✅ websearch: 是（获取最新最佳实践）
- ❌ read_file: 否

#### Step 4: Query改写
```
原始Query: "React useEffect怎么用"
改写后Query: "React useEffect hook complete guide 2024 best practices dependencies"
改写理由:
- 添加"complete guide"获取全面教程
- 添加"best practices"获取最佳实践
- 添加"dependencies"强调依赖管理这个关键点
- 添加"2024"确保获取最新信息
```

#### Step 5: 工具执行
```
rag_search: "React useEffect 使用指南 依赖项"
websearch: "React useEffect hook complete guide 2024 best practices"
```

#### Step 6: 结果整合
结合知识库的基础概念 + 网络搜索的最新模式 + 教授级建议

---

## 示例 2: 语言学习 - 单词记忆

### 用户输入
```
"transport这个词怎么记"
```

### 教授 Agent 执行流程

#### Step 1: 意图分析
```
意图分析:
- 主题: 英语学习
- 类型: 词汇记忆
- 深度: 中
- 时效: 历史
- 语言: 英文
```

#### Step 2: 工具选择决策
- ❌ rag_search: 否
- ✅ dictionary: 是（必须查询定义）
- ❌ websearch: 否
- ✅ download_skill: word_learning（词汇学习专用skill）

#### Step 3: Query改写
无需改写，直接查询单词

#### Step 4: 工具执行
```
dictionary: "transport"
download_skill: "word_learning"
```

#### Step 5: 结果整合
- dictionary 提供：定义、发音、词性
- word_learning skill 提供：记忆技巧、词根分析
- 教授添加：trans(跨越) + port(携带) = 运输

---

## 示例 3: 复杂问题 - 代码优化

### 用户输入
```
"帮我优化这段代码：
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}"
```

### 教授 Agent 执行流程

#### Step 1: 意图分析
```
意图分析:
- 主题: 编程 / 算法优化
- 类型: 代码审查/性能优化
- 深度: 深
- 时效: 当前
- 语言: JavaScript
```

#### Step 2: 工具选择决策
- ✅ rag_search: 是（检索算法优化知识）
- ❌ dictionary: 否
- ✅ websearch: 是（查找最新优化技巧）
- ❌ read_file: 否

#### Step 3: Query改写
```
原始Query: "优化斐波那契数列递归实现"
改写后Query: "JavaScript fibonacci algorithm optimization memoization dynamic programming 2024"
改写理由:
- 识别出这是斐波那契数列
- 添加"memoization"和"dynamic programming"关键词
- 使用英文关键词获取更专业的结果
- 添加"2024"获取最新优化方案
```

#### Step 4: 工具执行
```
rag_search: "斐波那契数列 优化 动态规划 记忆化"
websearch: "JavaScript fibonacci algorithm optimization memoization dynamic programming"
```

#### Step 5: 结果整合
- 解释当前递归实现的问题：时间复杂度 O(2^n)
- 提供优化方案：记忆化（O(n)时间，O(n)空间）
- 提供进一步优化：动态规划（O(n)时间，O(1)空间）
- 教授级建议：何时使用哪种方案

---

## 示例 4: 需要特定技能的问题

### 用户输入
```
"怎么用Remotion做文字打字机效果"
```

### 教授 Agent 执行流程

#### Step 1: 意图分析
```
意图分析:
- 主题: 视频制作 / Remotion
- 类型: 教程/代码示例
- 深度: 中
- 时效: 当前
- 语言: 中文
```

#### Step 2: 工具选择决策
- ❌ rag_search: 否
- ❌ dictionary: 否
- ❌ websearch: 否（优先使用skill）
- ✅ read_file: 是（需要remotion skill的具体规则）

#### Step 3: Query改写
无需改写，直接读取skill文档

#### Step 4: 工具执行
```
download_skill: "remotion-best-practices"
read_file: ("remotion-best-practices", "rules/text-animations.md")
```

#### Step 5: 结果整合
- 使用skill提供的最佳实践
- 给出完整的代码示例
- 解释关键概念

---

## 关键要点

1. **不要跳过意图分析** - 这是选择正确工具的基础
2. **合理改写query** - 提高搜索质量和相关性
3. **按优先级调用工具** - rag_search → dictionary → websearch → read_file
4. **整合而非堆砌** - 将多个工具的结果有机结合
5. **添加教授级洞察** - 提供背景知识、最佳实践和常见误区
