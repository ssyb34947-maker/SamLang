/**
 * 统计卡片常量配置
 */

export interface StatCardConfig {
  key: string;
  title: string;
  icon: string;
  color: string;
  unit?: string;
}

export const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'totalUsers',
    title: '总用户数',
    icon: 'Users',
    color: '#4A90E2',
  },
  {
    key: 'activeUsersToday',
    title: '今日活跃',
    icon: 'Activity',
    color: '#50C878',
  },
  {
    key: 'newUsersToday',
    title: '今日新增',
    icon: 'UserPlus',
    color: '#F5A623',
  },
  {
    key: 'newUsersThisWeek',
    title: '本周新增',
    icon: 'TrendingUp',
    color: '#BD10E0',
  },
  {
    key: 'avgDailyActive',
    title: '平均日活',
    icon: 'BarChart3',
    color: '#7ED321',
  },
  {
    key: 'tokenConsumptionToday',
    title: '今日Token消耗',
    icon: 'Coins',
    color: '#D0021B',
    unit: 'K',
  },
];

export const TREND_TIME_RANGES = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
] as const;

export const DISTRIBUTION_DIMENSIONS = [
  { key: 'byGender', label: '性别分布' },
  { key: 'byAge', label: '年龄分布' },
  { key: 'byGrade', label: '年级分布' },
  { key: 'byLearningLevel', label: '学习水平' },
  { key: 'byOccupation', label: '职业分布' },
] as const;

export const RADAR_DIMENSIONS = [
  '学习自主性',
  '学习好奇心',
  '学习坚持性',
  '数学认知',
  '每日学习时间',
] as const;
