// 学习看板常量定义

export const STUDY_SUBJECTS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust',
  'React', 'Vue', 'Angular', 'Node.js', 'Django', 'Flask',
  '算法', '数据结构', '设计模式', '系统架构', '数据库',
  '机器学习', '深度学习', 'NLP', '计算机视觉',
  '前端工程化', '性能优化', '测试驱动开发', 'DevOps',
];

export const SKILL_CATEGORIES = [
  { name: '编程基础', category: 'programming' as const },
  { name: '算法', category: 'algorithm' as const },
  { name: '数据结构', category: 'data-structure' as const },
  { name: '系统设计', category: 'system-design' as const },
  { name: '工具使用', category: 'tools' as const },
];

export const CHART_COLORS = {
  primary: '#ff4d4d',
  secondary: '#2d5da1',
  accent: '#ff9800',
  success: '#4caf50',
  purple: '#9c27b0',
  gray: '#607d8b',
  heatmap: ['#e5e0d8', '#ffcccc', '#ff9999', '#ff6666', '#ff4d4d'],
};

export const MOOD_OPTIONS = ['great', 'good', 'neutral', 'tired'] as const;

export const TIME_RANGE_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};
