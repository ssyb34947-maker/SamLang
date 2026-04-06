// 学习看板类型定义

// 时间范围类型
export type TimeRange = '7d' | '30d' | '90d' | '1y';

// 技能分类
export type SkillCategory = 
  | 'programming'      // 编程
  | 'algorithm'        // 算法
  | 'data-structure'   // 数据结构
  | 'system-design'    // 系统设计
  | 'tools'            // 工具使用
  | 'theory'           // 理论知识
  | 'practice';        // 实践应用

// 心情枚举
export type Mood = 
  | 'great'      // 很好 😄
  | 'good'       // 不错 🙂
  | 'neutral'    // 一般 😐
  | 'tired'      // 疲惫 😴
  | 'frustrated' // 沮丧 😤
  | 'excited';   // 兴奋 🤩

// 连续学习记录
export interface StreakRecord {
  startDate: string;            // ISO 日期格式
  endDate: string;
  days: number;
}

// 趋势数据点
export interface TrendDataPoint {
  date: string;                 // YYYY-MM-DD
  hours: number;                // 当天学习时长
  conversations: number;        // 当天对话次数
}

// 技能数据
export interface SkillData {
  name: string;                 // 技能名称
  level: number;                // 当前水平 (0-100)
  target: number;               // 目标水平 (0-100)
  category: SkillCategory;      // 技能分类
}

// 活动数据点（热力图）
export interface ActivityDataPoint {
  date: string;                 // YYYY-MM-DD
  count: number;                // 活跃度计数（学习时长或次数）
  level: 0 | 1 | 2 | 3 | 4;     // 活跃度等级
}

// 主题分布
export interface TopicDistribution {
  name: string;                 // 主题名称
  count: number;                // 出现次数
  percentage: number;           // 占比
  color?: string;               // 图表颜色（可选）
}

// 学习统计数据接口
export interface StudyStats {
  // 时间范围
  timeRange: TimeRange;
  
  // 学习时长统计
  totalHours: number;           // 总学习时长（小时）
  weeklyHours: number;          // 本周学习时长
  monthlyHours: number;         // 本月学习时长
  dailyAverage: number;         // 日均学习时长
  
  // 连续学习统计
  streakDays: number;           // 当前连续学习天数
  maxStreak: number;            // 历史最高连续天数
  streakHistory: StreakRecord[]; // 连续学习历史
  
  // 知识点统计
  knowledgePoints: number;      // 已学知识点数量
  masteredPoints: number;       // 已掌握知识点数量
  masteryRate: number;          // 掌握率（百分比）
  
  // 对话统计
  totalConversations: number;   // 总对话次数
  weeklyConversations: number;  // 本周对话次数
  avgRating: number;            // 平均对话评分
  
  // 趋势数据
  trend: TrendDataPoint[];      // 学习趋势数据
  skills: SkillData[];          // 技能数据
  activity: ActivityDataPoint[]; // 活动热力图数据
  topics: TopicDistribution[];  // 主题分布数据
}

// 日记 AI 分析（预留）
export interface JournalAIAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  topics: string[];
  suggestions: string[];
  generatedAt: string;
}

// 日记条目接口
export interface JournalEntry {
  id: string;                   // 唯一标识符 (UUID)
  title: string;                // 日记标题
  content: string;              // Markdown 内容
  summary?: string;             // 摘要（自动生成或手动输入）
  
  // 时间戳
  createdAt: string;            // ISO 日期时间
  updatedAt: string;            // ISO 日期时间
  
  // 元数据
  tags: string[];               // 标签数组
  mood?: Mood;                  // 心情（可选）
  isDraft: boolean;             // 是否为草稿
  isPinned: boolean;            // 是否置顶
  
  // 关联数据
  relatedTopics?: string[];     // 关联的知识点
  studyTime?: number;           // 当天学习时长（小时）
  
  // AI 分析（预留）
  aiAnalysis?: JournalAIAnalysis;
}

// 日记草稿（用于本地存储）
export interface JournalDraft {
  id?: string;                  // 草稿ID（新建时为undefined）
  title: string;
  content: string;
  tags: string[];
  mood?: Mood;
  savedAt: string;              // 最后保存时间
}

// 洞察类型
export type InsightType =
  | 'pattern'        // 学习模式
  | 'trend'          // 趋势分析
  | 'comparison'     // 对比分析
  | 'anomaly'        // 异常检测
  | 'achievement';   // 成就识别

// 支撑数据点
export interface DataPoint {
  label: string;
  value: number | string;
  unit?: string;
}

// 学习洞察
export interface LearningInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  dataPoints?: DataPoint[];     // 支撑数据
  confidence: number;           // 置信度 (0-1)
}

// 优先级
export type Priority = 'high' | 'medium' | 'low';

// 建议类型
export type RecommendationType =
  | 'review'         // 复习建议
  | 'practice'       // 练习建议
  | 'learn'          // 学习建议
  | 'schedule'       // 时间安排
  | 'goal';          // 目标设定

// 学习资源
export interface Resource {
  type: 'article' | 'video' | 'exercise' | 'project' | 'book';
  title: string;
  url?: string;
  description?: string;
}

// 行动项
export interface ActionItem {
  id: string;
  description: string;
  estimatedTime?: string;       // 预计耗时
  resources?: Resource[];       // 推荐资源
  completed: boolean;
}

// 学习建议
export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: Priority;           // 优先级
  title: string;
  description: string;
  actionItems: ActionItem[];    // 具体行动项
  expectedOutcome?: string;     // 预期效果
}

// 知识缺口
export interface KnowledgeGap {
  id: string;
  topic: string;                // 知识点名称
  category: SkillCategory;
  importance: number;           // 重要程度 (1-5)
  currentLevel: number;         // 当前水平 (0-100)
  targetLevel: number;          // 目标水平 (0-100)
  gap: number;                  // 差距
  prerequisites: string[];      // 前置知识
}

// 里程碑
export interface Milestone {
  level: number;
  description: string;
  estimatedDate: string;
}

// 进度预测
export interface ProgressPrediction {
  currentLevel: number;         // 当前整体水平 (0-100)
  targetLevel: number;          // 目标水平
  predictedDate: string;        // 预计达成日期
  confidence: number;           // 预测置信度
  milestones: Milestone[];      // 里程碑
}

// 知识节点
export interface KnowledgeNode {
  id: string;
  label: string;
  category: SkillCategory;
  level: number;                // 掌握程度 (0-100)
  size?: number;                // 节点大小（可选）
  x?: number;                   // 布局坐标
  y?: number;
}

// 知识边（关系）
export interface KnowledgeEdge {
  source: string;               // 源节点ID
  target: string;               // 目标节点ID
  type: 'prerequisite' | 'related' | 'advanced';
  strength: number;             // 关联强度 (0-1)
}

// 知识图谱
export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

// 学习路径步骤
export interface LearningPathStep {
  step: number;                 // 步骤序号
  topic: string;                // 学习主题
  description: string;
  estimatedTime: string;        // 预计学习时间
  prerequisites: string[];      // 前置步骤
  resources: Resource[];
  milestones: string[];         // 完成标志
}

// AI 分析结果接口
export interface AIAnalysisResult {
  generatedAt: string;          // 生成时间
  timeRange: TimeRange;         // 分析的时间范围
  
  // 学习洞察
  insights: LearningInsight[];
  
  // 知识缺口
  knowledgeGaps: KnowledgeGap[];
  
  // 学习建议
  recommendations: Recommendation[];
  
  // 进度预测
  progressPrediction: ProgressPrediction;
  
  // 知识图谱
  knowledgeGraph: KnowledgeGraph;
  
  // 学习路径
  learningPath: LearningPathStep[];
}

// ==================== 组件 Props 类型 ====================

// 概览卡片组件
export interface OverviewCardsProps {
  stats: Pick<StudyStats, 
    'totalHours' | 
    'weeklyHours' | 
    'streakDays' | 
    'maxStreak' | 
    'knowledgePoints' | 
    'masteryRate' | 
    'totalConversations' | 
    'avgRating'
  >;
  loading?: boolean;
}

// 学习趋势图表
export interface LearningTrendChartProps {
  data: TrendDataPoint[];
  timeRange: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
}

// 技能雷达图
export interface SkillRadarChartProps {
  skills: SkillData[];
  showTarget?: boolean;
}

// 活动热力图
export interface ActivityHeatmapProps {
  data: ActivityDataPoint[];
  year?: number;
}

// 主题分布图
export interface TopicDistributionProps {
  data: TopicDistribution[];
  type?: 'pie' | 'donut' | 'bar';
}

// Markdown 编辑器
export interface JournalEditorProps {
  initialValue?: Partial<JournalEntry>;
  onSave: (entry: JournalEntry) => void;
  onAutoSave?: (draft: JournalDraft) => void;
  autoSaveInterval?: number;    // 自动保存间隔（毫秒）
}

// 日记列表
export interface JournalListProps {
  entries: JournalEntry[];
  onSelect: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
}

// 日记卡片
export interface JournalCardProps {
  entry: JournalEntry;
  onClick?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
}

// AI 洞察卡片
export interface AIInsightCardProps {
  insight: LearningInsight;
  onAction?: (action: string) => void;
}

// 知识图谱可视化
export interface KnowledgeGraphProps {
  graph: KnowledgeGraph;
  onNodeClick?: (node: KnowledgeNode) => void;
  highlightNodes?: string[];
}

// 学习路径展示
export interface LearningPathProps {
  path: LearningPathStep[];
  currentStep?: number;
  onStepClick?: (step: LearningPathStep) => void;
}
