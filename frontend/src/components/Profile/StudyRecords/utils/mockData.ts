// 模拟数据生成器

import { 
  StudyStats, 
  JournalEntry, 
  AIAnalysisResult,
  TimeRange,
  TrendDataPoint,
  ActivityDataPoint,
  SkillData,
  TopicDistribution
} from '../types';

// 生成趋势数据
const generateTrendData = (days: number): TrendDataPoint[] => {
  const data: TrendDataPoint[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 模拟周末学习时长较少
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseHours = isWeekend ? 1 : 2.5;
    
    data.push({
      date: date.toISOString().split('T')[0],
      hours: Number((baseHours + Math.random() * 2 - 0.5).toFixed(1)),
      conversations: Math.floor(Math.random() * 8) + 1,
    });
  }
  
  return data;
};

// 生成活动热力图数据
const generateActivityData = (days: number): ActivityDataPoint[] => {
  const data: ActivityDataPoint[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const hasActivity = Math.random() > 0.2; // 80% 概率有活动
    const count = hasActivity ? Math.floor(Math.random() * 8) + 1 : 0;
    
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) level = 1;
    if (count >= 3) level = 2;
    if (count >= 5) level = 3;
    if (count >= 7) level = 4;
    
    data.push({
      date: date.toISOString().split('T')[0],
      count,
      level,
    });
  }
  
  return data;
};

// 技能数据
const mockSkills: SkillData[] = [
  { name: '编程基础', level: 75, target: 90, category: 'programming' },
  { name: '算法', level: 60, target: 85, category: 'algorithm' },
  { name: '数据结构', level: 70, target: 80, category: 'data-structure' },
  { name: '系统设计', level: 45, target: 70, category: 'system-design' },
  { name: '工具使用', level: 80, target: 85, category: 'tools' },
];

// 主题分布数据
const mockTopics: TopicDistribution[] = [
  { name: 'Python', count: 85, percentage: 25, color: '#ff4d4d' },
  { name: 'JavaScript', count: 62, percentage: 18, color: '#2d5da1' },
  { name: '算法', count: 48, percentage: 14, color: '#4caf50' },
  { name: '数据库', count: 35, percentage: 10, color: '#ff9800' },
  { name: '前端框架', count: 42, percentage: 12, color: '#9c27b0' },
  { name: '其他', count: 70, percentage: 21, color: '#607d8b' },
];

// 生成模拟学习统计数据
export const generateMockStudyStats = (range: TimeRange): StudyStats => {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  
  return {
    timeRange: range,
    totalHours: 156.5,
    weeklyHours: 12.5,
    monthlyHours: 48.0,
    dailyAverage: 2.1,
    streakDays: 7,
    maxStreak: 15,
    streakHistory: [
      { startDate: '2026-03-20', endDate: '2026-04-05', days: 15 },
      { startDate: '2026-02-15', endDate: '2026-02-28', days: 13 },
    ],
    knowledgePoints: 127,
    masteredPoints: 89,
    masteryRate: 70,
    totalConversations: 342,
    weeklyConversations: 28,
    avgRating: 4.6,
    trend: generateTrendData(days),
    skills: mockSkills,
    activity: generateActivityData(days),
    topics: mockTopics,
  };
};

// 生成模拟日记数据
export const generateMockJournals = (): JournalEntry[] => {
  return [
    {
      id: '1',
      title: '今天的算法学习心得',
      content: `# 动态规划学习笔记

今天学习了动态规划，感觉很有收获。

## 核心概念

动态规划的核心是**最优子结构**和**重叠子问题**。

### 解题步骤
1. 定义状态
2. 找出状态转移方程
3. 确定初始条件
4. 计算顺序

## 例题

做了三道题：
- [x] 爬楼梯
- [x] 斐波那契数列
- [ ] 最长递增子序列

明天继续！`,
      createdAt: '2026-04-05T20:30:00Z',
      updatedAt: '2026-04-05T20:30:00Z',
      tags: ['算法', '动态规划', '学习笔记'],
      mood: 'good',
      isDraft: false,
      isPinned: true,
    },
    {
      id: '2',
      title: 'React Hooks 深入理解',
      content: `# useEffect 的使用技巧

今天深入学习了 useEffect 的各种用法。

## 依赖数组的重要性

\`\`\`javascript
useEffect(() => {
  // 副作用逻辑
}, [dependency]) // 依赖数组
\`\`\`

## 清理函数

记得在组件卸载时清理副作用！`,
      createdAt: '2026-04-03T18:15:00Z',
      updatedAt: '2026-04-03T18:15:00Z',
      tags: ['React', '前端', 'Hooks'],
      mood: 'excited',
      isDraft: false,
      isPinned: false,
    },
    {
      id: '3',
      title: '学习反思：如何提高效率',
      content: `最近感觉学习效率不够高，需要反思一下。

## 问题

1. 容易分心
2. 计划不够明确
3. 复习不够及时

## 改进计划

- [ ] 使用番茄工作法
- [ ] 制定每日计划
- [ ] 建立复习机制`,
      createdAt: '2026-04-01T21:00:00Z',
      updatedAt: '2026-04-01T21:00:00Z',
      tags: ['反思', '效率', '学习方法'],
      mood: 'neutral',
      isDraft: false,
      isPinned: false,
    },
    {
      id: '4',
      title: 'Python 装饰器笔记（草稿）',
      content: `# Python 装饰器

待完善...`,
      createdAt: '2026-03-28T15:30:00Z',
      updatedAt: '2026-03-28T15:30:00Z',
      tags: ['Python', '草稿'],
      mood: 'tired',
      isDraft: true,
      isPinned: false,
    },
  ];
};

// 生成模拟 AI 分析结果
export const generateMockAIAnalysis = (): AIAnalysisResult => {
  return {
    generatedAt: new Date().toISOString(),
    timeRange: '30d',
    insights: [
      {
        id: '1',
        type: 'pattern',
        title: '晚间学习效率更高',
        description: '根据你的学习记录，晚上8-10点的学习效率最高，建议在这个时间段安排难度较大的学习任务。',
        confidence: 0.85,
        dataPoints: [
          { label: '晚间学习时长', value: 45, unit: '小时' },
          { label: '平均专注度', value: 85, unit: '%' },
          { label: '知识掌握率', value: 78, unit: '%' },
        ],
      },
      {
        id: '2',
        type: 'trend',
        title: '学习时长稳步增长',
        description: '过去30天，你的日均学习时长从1.5小时增长到2.5小时，保持这个势头！',
        confidence: 0.92,
        dataPoints: [
          { label: '增长幅度', value: 67, unit: '%' },
          { label: '连续增长天数', value: 12, unit: '天' },
        ],
      },
      {
        id: '3',
        type: 'achievement',
        title: '连续7天学习打卡',
        description: '你已经连续学习7天了，创造了新的记录！继续保持！',
        confidence: 1.0,
        dataPoints: [
          { label: '当前连续天数', value: 7, unit: '天' },
          { label: '历史最高', value: 15, unit: '天' },
        ],
      },
    ],
    knowledgeGaps: [
      {
        id: '1',
        topic: '递归算法',
        category: 'algorithm',
        importance: 4,
        currentLevel: 45,
        targetLevel: 80,
        gap: 35,
        prerequisites: ['函数基础', '栈数据结构'],
      },
      {
        id: '2',
        topic: '数据库优化',
        category: 'system-design',
        importance: 3,
        currentLevel: 30,
        targetLevel: 70,
        gap: 40,
        prerequisites: ['SQL基础', '索引原理'],
      },
    ],
    recommendations: [
      {
        id: '1',
        type: 'practice',
        priority: 'high',
        title: '加强递归练习',
        description: '建议每天练习2-3道递归相关的算法题，重点理解递归思想和递归树。',
        actionItems: [
          {
            id: '1',
            description: '完成 LeetCode 递归专题（10道题）',
            estimatedTime: '2小时',
            resources: [
              { type: 'exercise', title: 'LeetCode 递归专题' },
              { type: 'article', title: '递归算法详解' },
            ],
            completed: false,
          },
          {
            id: '2',
            description: '画出每道题的递归调用树',
            estimatedTime: '30分钟',
            completed: false,
          },
        ],
      },
      {
        id: '2',
        type: 'review',
        priority: 'medium',
        title: '复习动态规划',
        description: '距离上次学习动态规划已经过去7天，建议进行复习巩固。',
        actionItems: [
          {
            id: '3',
            description: '重做之前做过的3道DP题目',
            estimatedTime: '1小时',
            completed: false,
          },
        ],
      },
    ],
    progressPrediction: {
      currentLevel: 65,
      targetLevel: 90,
      predictedDate: '2026-08-15',
      confidence: 0.75,
      milestones: [
        { level: 70, description: '掌握基础算法', estimatedDate: '2026-05-01' },
        { level: 80, description: '熟练数据结构', estimatedDate: '2026-06-15' },
        { level: 90, description: '达到目标水平', estimatedDate: '2026-08-15' },
      ],
    },
    knowledgeGraph: {
      nodes: [
        { id: '1', label: '编程基础', category: 'programming', level: 75 },
        { id: '2', label: '算法', category: 'algorithm', level: 60 },
        { id: '3', label: '数据结构', category: 'data-structure', level: 70 },
        { id: '4', label: '递归', category: 'algorithm', level: 45 },
        { id: '5', label: '动态规划', category: 'algorithm', level: 55 },
        { id: '6', label: '系统设计', category: 'system-design', level: 45 },
        { id: '7', label: '数据库', category: 'system-design', level: 50 },
      ],
      edges: [
        { source: '1', target: '2', type: 'prerequisite', strength: 0.8 },
        { source: '1', target: '3', type: 'prerequisite', strength: 0.9 },
        { source: '3', target: '2', type: 'related', strength: 0.7 },
        { source: '2', target: '4', type: 'prerequisite', strength: 0.6 },
        { source: '4', target: '5', type: 'prerequisite', strength: 0.8 },
        { source: '1', target: '6', type: 'prerequisite', strength: 0.7 },
        { source: '6', target: '7', type: 'related', strength: 0.6 },
      ],
    },
    learningPath: [
      {
        step: 1,
        topic: '递归基础',
        description: '理解递归的基本概念和执行过程',
        estimatedTime: '3天',
        prerequisites: [],
        resources: [
          { type: 'article', title: '递归入门指南' },
          { type: 'video', title: '递归可视化讲解' },
          { type: 'exercise', title: '递归练习题10道' },
        ],
        milestones: ['能写出简单的递归函数', '理解递归调用栈'],
      },
      {
        step: 2,
        topic: '动态规划入门',
        description: '学习动态规划的核心思想和基本题型',
        estimatedTime: '5天',
        prerequisites: ['递归基础'],
        resources: [
          { type: 'article', title: 'DP入门教程' },
          { type: 'video', title: 'DP状态转移方程' },
        ],
        milestones: ['掌握爬楼梯问题', '理解最优子结构'],
      },
      {
        step: 3,
        topic: '经典DP问题',
        description: '学习经典的动态规划问题',
        estimatedTime: '7天',
        prerequisites: ['动态规划入门'],
        resources: [
          { type: 'exercise', title: '背包问题' },
          { type: 'exercise', title: '最长公共子序列' },
        ],
        milestones: ['解决0/1背包问题', '掌握LCS算法'],
      },
    ],
  };
};
