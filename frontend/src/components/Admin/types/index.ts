/**
 * 管理员仪表盘类型定义
 */

// 用户统计概览
export interface UserStatsOverview {
  totalUsers: number;
  activeUsersToday: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  avgDailyActive: number;
  tokenConsumptionToday: number;
}

// 用户趋势
export interface UserTrend {
  dates: string[];
  newUsers: number[];
  activeUsers: number[];
}

// 分布数据项
export interface DistributionItem {
  name: string;
  value: number;
}

// 用户分布
export interface UserDistribution {
  byGender: DistributionItem[];
  byAge: DistributionItem[];
  byGrade: DistributionItem[];
  byLearningLevel: DistributionItem[];
  byOccupation: DistributionItem[];
}

// 用户画像雷达图
export interface UserPersonaRadar {
  dimensions: string[];
  averages: number[];
  topUsers: number[];
}

// 地理分布
export interface CityData {
  name: string;
  value: number;
  lat: number;
  lng: number;
}

export interface ProvinceData {
  name: string;
  value: number;
  cities: CityData[];
}

export interface GeoDistribution {
  provinces: ProvinceData[];
}

// 流量监控
export interface EndpointStat {
  path: string;
  count: number;
  avgTime: number;
}

export interface TrafficTimeSeries {
  time: string;
  qps: number;
  latency: number;
}

export interface TrafficStats {
  currentQPS: number;
  avgResponseTime: number;
  totalRequests: number;
  errorRate: number;
  bandwidthIn: number;
  bandwidthOut: number;
  topEndpoints: EndpointStat[];
  timeSeries: TrafficTimeSeries[];
}

// AI消息
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
