/**
 * 模拟数据生成器
 */

import type {
  UserStatsOverview,
  UserTrend,
  UserDistribution,
  UserPersonaRadar,
  GeoDistribution,
  TrafficStats,
} from '../types';

// 生成用户统计概览
export const generateMockOverview = (): UserStatsOverview => ({
  totalUsers: 18650,
  activeUsersToday: 3421,
  newUsersToday: 156,
  newUsersThisWeek: 1234,
  newUsersThisMonth: 5678,
  avgDailyActive: 5234,
  tokenConsumptionToday: 1250, // 今日Token消耗（千）
});

// 生成用户趋势数据
export const generateMockTrend = (days: number): UserTrend => {
  const dates: string[] = [];
  const newUsers: number[] = [];
  const activeUsers: number[] = [];

  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
    newUsers.push(Math.floor(Math.random() * 200) + 100);
    activeUsers.push(Math.floor(Math.random() * 1000) + 4000);
  }

  return { dates, newUsers, activeUsers };
};

// 生成用户分布数据
export const generateMockDistribution = (): UserDistribution => ({
  byGender: [
    { name: '男', value: 8450 },
    { name: '女', value: 9800 },
    { name: '未填写', value: 400 },
  ],
  byAge: [
    { name: '18岁以下', value: 2340 },
    { name: '18-25岁', value: 8390 },
    { name: '26-30岁', value: 5220 },
    { name: '31-35岁', value: 1860 },
    { name: '35岁以上', value: 840 },
  ],
  byGrade: [
    { name: '小学', value: 1230 },
    { name: '初中', value: 3450 },
    { name: '高中', value: 5670 },
    { name: '大学', value: 6780 },
    { name: '研究生', value: 890 },
    { name: '已工作', value: 630 },
  ],
  byLearningLevel: [
    { name: '初学者', value: 7230 },
    { name: '中级', value: 6230 },
    { name: '高级', value: 3890 },
    { name: '专家', value: 1300 },
  ],
  byOccupation: [
    { name: '学生', value: 12340 },
    { name: '程序员', value: 2340 },
    { name: '教师', value: 1230 },
    { name: '设计师', value: 890 },
    { name: '其他', value: 1850 },
  ],
});

// 生成用户画像雷达图数据
export const generateMockPersonaRadar = (): UserPersonaRadar => ({
  dimensions: ['学习自主性', '学习好奇心', '学习坚持性', '数学认知', '每日学习时间'],
  averages: [65, 72, 58, 68, 55],
  topUsers: [85, 88, 82, 85, 78],
});

// 生成地理分布数据 - 使用完整省份名称匹配 ECharts 地图
export const generateMockGeoDistribution = (): GeoDistribution => ({
  provinces: [
    {
      name: '广东省',
      value: 3456,
      cities: [
        { name: '广州', value: 1456, lat: 23.1291, lng: 113.2644 },
        { name: '深圳', value: 1234, lat: 22.5431, lng: 114.0579 },
        { name: '东莞', value: 456, lat: 23.0489, lng: 113.7447 },
        { name: '佛山', value: 310, lat: 23.0219, lng: 113.1219 },
      ],
    },
    {
      name: '北京市',
      value: 2341,
      cities: [
        { name: '北京', value: 2341, lat: 39.9042, lng: 116.4074 },
      ],
    },
    {
      name: '上海市',
      value: 2156,
      cities: [
        { name: '上海', value: 2156, lat: 31.2304, lng: 121.4737 },
      ],
    },
    {
      name: '浙江省',
      value: 1876,
      cities: [
        { name: '杭州', value: 1234, lat: 30.2741, lng: 120.1551 },
        { name: '宁波', value: 432, lat: 29.8683, lng: 121.544 },
        { name: '温州', value: 210, lat: 28.0005, lng: 120.6721 },
      ],
    },
    {
      name: '江苏省',
      value: 1654,
      cities: [
        { name: '南京', value: 876, lat: 32.0603, lng: 118.7969 },
        { name: '苏州', value: 654, lat: 31.2989, lng: 120.5853 },
        { name: '无锡', value: 124, lat: 31.4912, lng: 120.3119 },
      ],
    },
    {
      name: '四川省',
      value: 1234,
      cities: [
        { name: '成都', value: 1234, lat: 30.5728, lng: 104.0668 },
      ],
    },
    {
      name: '湖北省',
      value: 987,
      cities: [
        { name: '武汉', value: 987, lat: 30.5928, lng: 114.3055 },
      ],
    },
    {
      name: '陕西省',
      value: 876,
      cities: [
        { name: '西安', value: 876, lat: 34.3416, lng: 108.9398 },
      ],
    },
    {
      name: '湖南省',
      value: 765,
      cities: [
        { name: '长沙', value: 765, lat: 28.2282, lng: 112.9388 },
      ],
    },
    {
      name: '河南省',
      value: 654,
      cities: [
        { name: '郑州', value: 654, lat: 34.7466, lng: 113.6253 },
      ],
    },
    // 添加一些人数较少的省份来测试颜色分档
    {
      name: '福建省',
      value: 45,
      cities: [
        { name: '福州', value: 25, lat: 26.0745, lng: 119.2965 },
        { name: '厦门', value: 20, lat: 24.4798, lng: 118.0894 },
      ],
    },
    {
      name: '安徽省',
      value: 8,
      cities: [
        { name: '合肥', value: 8, lat: 31.8206, lng: 117.2272 },
      ],
    },
    {
      name: '江西省',
      value: 3,
      cities: [
        { name: '南昌', value: 3, lat: 28.682, lng: 115.8579 },
      ],
    },
    {
      name: '山东省',
      value: 0,
      cities: [
        { name: '济南', value: 0, lat: 36.6512, lng: 117.1201 },
      ],
    },
    {
      name: '河北省',
      value: 0,
      cities: [
        { name: '石家庄', value: 0, lat: 38.0428, lng: 114.5149 },
      ],
    },
    {
      name: '山西省',
      value: 0,
      cities: [
        { name: '太原', value: 0, lat: 37.8706, lng: 112.5489 },
      ],
    },
    {
      name: '黑龙江省',
      value: 0,
      cities: [
        { name: '哈尔滨', value: 0, lat: 45.8038, lng: 126.535 },
      ],
    },
    {
      name: '吉林省',
      value: 0,
      cities: [
        { name: '长春', value: 0, lat: 43.8171, lng: 125.3235 },
      ],
    },
    {
      name: '辽宁省',
      value: 0,
      cities: [
        { name: '沈阳', value: 0, lat: 41.8057, lng: 123.4315 },
      ],
    },
    {
      name: '天津市',
      value: 0,
      cities: [
        { name: '天津', value: 0, lat: 39.0842, lng: 117.2009 },
      ],
    },
    {
      name: '重庆市',
      value: 0,
      cities: [
        { name: '重庆', value: 0, lat: 29.563, lng: 106.5516 },
      ],
    },
    {
      name: '云南省',
      value: 0,
      cities: [
        { name: '昆明', value: 0, lat: 25.0389, lng: 102.7183 },
      ],
    },
    {
      name: '贵州省',
      value: 0,
      cities: [
        { name: '贵阳', value: 0, lat: 26.647, lng: 106.6302 },
      ],
    },
    {
      name: '广西壮族自治区',
      value: 0,
      cities: [
        { name: '南宁', value: 0, lat: 22.817, lng: 108.3665 },
      ],
    },
    {
      name: '海南省',
      value: 0,
      cities: [
        { name: '海口', value: 0, lat: 20.044, lng: 110.1999 },
      ],
    },
    {
      name: '内蒙古自治区',
      value: 0,
      cities: [
        { name: '呼和浩特', value: 0, lat: 40.8414, lng: 111.7519 },
      ],
    },
    {
      name: '新疆维吾尔自治区',
      value: 0,
      cities: [
        { name: '乌鲁木齐', value: 0, lat: 43.8256, lng: 87.6168 },
      ],
    },
    {
      name: '西藏自治区',
      value: 0,
      cities: [
        { name: '拉萨', value: 0, lat: 29.65, lng: 91.1 },
      ],
    },
    {
      name: '宁夏回族自治区',
      value: 0,
      cities: [
        { name: '银川', value: 0, lat: 38.4872, lng: 106.2309 },
      ],
    },
    {
      name: '青海省',
      value: 0,
      cities: [
        { name: '西宁', value: 0, lat: 36.6171, lng: 101.7782 },
      ],
    },
    {
      name: '甘肃省',
      value: 0,
      cities: [
        { name: '兰州', value: 0, lat: 36.0611, lng: 103.8343 },
      ],
    },
  ],
});

// 生成流量监控数据
export const generateMockTrafficStats = (): TrafficStats => {
  const timeSeries = [];
  const now = new Date();

  for (let i = 59; i >= 0; i--) {
    const time = new Date(now);
    time.setMinutes(time.getMinutes() - i);
    timeSeries.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      qps: Math.floor(Math.random() * 2000) + 3000,
      latency: Math.floor(Math.random() * 100) + 50,
    });
  }

  return {
    currentQPS: 4567,
    avgResponseTime: 78,
    totalRequests: 12345678,
    errorRate: 0.23,
    bandwidthIn: 234.5,
    bandwidthOut: 567.8,
    topEndpoints: [
      { path: '/api/chat', count: 45600, avgTime: 120 },
      { path: '/api/auth/login', count: 23400, avgTime: 45 },
      { path: '/api/conversations', count: 18900, avgTime: 32 },
      { path: '/api/auth/me', count: 15600, avgTime: 28 },
      { path: '/api/rag/search', count: 12300, avgTime: 180 },
    ],
    timeSeries,
  };
};
