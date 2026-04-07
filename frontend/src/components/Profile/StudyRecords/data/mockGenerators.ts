// 模拟数据生成器 - 支持随机选取

import {
  TrendDataPoint,
  ActivityDataPoint,
  SkillData,
  TopicDistribution,
  JournalEntry,
  StudyStats,
  TimeRange,
  AIAnalysisResult,
} from '../types';
import {
  STUDY_SUBJECTS,
  SKILL_CATEGORIES,
  CHART_COLORS,
  MOOD_OPTIONS,
  TIME_RANGE_DAYS,
} from './constants';

// 随机选取数组元素
export const pickRandom = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

// 随机整数
export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// 随机浮点数
export const randomFloat = (min: number, max: number, decimals = 1): number =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));

// 生成趋势数据
export const generateTrendData = (days: number): TrendDataPoint[] => {
  const data: TrendDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseHours = isWeekend ? 1 : 2.5;

    data.push({
      date: date.toISOString().split('T')[0],
      hours: randomFloat(baseHours - 0.5, baseHours + 2),
      conversations: randomInt(1, 8),
    });
  }
  return data;
};

// 生成活动热力图数据
export const generateActivityData = (days: number): ActivityDataPoint[] => {
  const data: ActivityDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const hasActivity = Math.random() > 0.2;
    const count = hasActivity ? randomInt(1, 8) : 0;

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

// 生成随机技能数据
export const generateSkills = (): SkillData[] => {
  return SKILL_CATEGORIES.map((skill) => ({
    name: skill.name,
    level: randomInt(40, 85),
    target: randomInt(70, 95),
    category: skill.category,
  }));
};

// 生成随机主题分布
export const generateTopics = (): TopicDistribution[] => {
  const selectedSubjects = pickRandom(STUDY_SUBJECTS, 6);
  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.success,
    CHART_COLORS.accent,
    CHART_COLORS.purple,
    CHART_COLORS.gray,
  ];

  const counts = selectedSubjects.map(() => randomInt(30, 100));
  const total = counts.reduce((a, b) => a + b, 0);

  return selectedSubjects.map((name, index) => ({
    name,
    count: counts[index],
    percentage: Math.round((counts[index] / total) * 100),
    color: colors[index],
  }));
};

// 生成学习统计数据
export const generateMockStudyStats = (range: TimeRange): StudyStats => {
  const days = TIME_RANGE_DAYS[range];
  const trend = generateTrendData(days);
  const totalHours = Number(trend.reduce((sum, d) => sum + d.hours, 0).toFixed(1));

  return {
    timeRange: range,
    totalHours,
    weeklyHours: randomFloat(10, 20),
    monthlyHours: randomFloat(40, 60),
    dailyAverage: randomFloat(1.5, 3),
    streakDays: randomInt(3, 15),
    maxStreak: randomInt(15, 30),
    streakHistory: [
      { startDate: '2026-03-20', endDate: '2026-04-05', days: 15 },
      { startDate: '2026-02-15', endDate: '2026-02-28', days: 13 },
    ],
    knowledgePoints: randomInt(100, 150),
    masteredPoints: randomInt(60, 100),
    masteryRate: randomInt(60, 80),
    totalConversations: randomInt(200, 400),
    weeklyConversations: randomInt(20, 40),
    avgRating: randomFloat(4.2, 4.8, 1),
    trend,
    skills: generateSkills(),
    activity: generateActivityData(days),
    topics: generateTopics(),
  };
};

// 生成日记数据
export const generateMockJournals = (): JournalEntry[] => {
  const templates = [
    { title: '今天的算法学习心得', tags: ['算法', '动态规划'] },
    { title: 'React Hooks 深入理解', tags: ['React', '前端'] },
    { title: '学习反思：如何提高效率', tags: ['反思', '效率'] },
    { title: 'Python 装饰器笔记', tags: ['Python', '进阶'] },
    { title: '数据库优化总结', tags: ['数据库', '性能'] },
  ];
  
  return templates.map((template, index) => ({
    id: String(index + 1),
    title: template.title,
    content: `# ${template.title}\n\n今天学习很有收获...`,
    createdAt: new Date(Date.now() - index * 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - index * 86400000 * 2).toISOString(),
    tags: template.tags,
    mood: MOOD_OPTIONS[randomInt(0, MOOD_OPTIONS.length - 1)],
    isDraft: index === 3,
    isPinned: index === 0,
  }));
};

// 生成AI分析数据
export const generateMockAIAnalysis = (): AIAnalysisResult => ({
  generatedAt: new Date().toISOString(),
  timeRange: '30d',
  insights: [
    {
      id: '1',
      type: 'pattern',
      title: '晚间学习效率更高',
      description: '根据你的学习记录，晚上8-10点的学习效率最高。',
      confidence: 0.85,
      dataPoints: [
        { label: '晚间学习时长', value: 45, unit: '小时' },
        { label: '平均专注度', value: 85, unit: '%' },
      ],
    },
    {
      id: '2',
      type: 'trend',
      title: '学习时长稳步增长',
      description: '过去30天，你的日均学习时长从1.5小时增长到2.5小时。',
      confidence: 0.92,
      dataPoints: [
        { label: '增长幅度', value: 67, unit: '%' },
        { label: '连续增长天数', value: 12, unit: '天' },
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
  ],
  recommendations: [
    {
      id: '1',
      type: 'practice',
      priority: 'high',
      title: '加强递归练习',
      description: '建议每天练习2-3道递归相关的算法题。',
      actionItems: [
        { id: '1', description: '完成 LeetCode 递归专题', completed: false },
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
    ],
  },
  knowledgeGraph: {
    nodes: [
      { id: '1', label: '编程基础', category: 'programming', level: 75 },
      { id: '2', label: '算法', category: 'algorithm', level: 60 },
    ],
    edges: [{ source: '1', target: '2', type: 'prerequisite', strength: 0.8 }],
  },
  learningPath: [
    {
      step: 1,
      topic: '递归基础',
      description: '理解递归的基本概念和执行过程',
      estimatedTime: '3天',
      prerequisites: [],
      resources: [{ type: 'article', title: '递归入门指南' }],
      milestones: ['能写出简单的递归函数'],
    },
  ],
});
