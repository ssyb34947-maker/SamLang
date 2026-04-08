/**
 * 流量监控常量配置
 */

export const TRAFFIC_METRICS = [
  {
    key: 'currentQPS',
    title: '当前QPS',
    unit: 'req/s',
    max: 10000,
    warning: 8000,
    color: '#4A90E2',
  },
  {
    key: 'avgResponseTime',
    title: '平均响应时间',
    unit: 'ms',
    max: 1000,
    warning: 500,
    color: '#50C878',
  },
  {
    key: 'totalRequests',
    title: '总请求数',
    unit: '',
    max: 10000000,
    warning: 0,
    color: '#F5A623',
  },
  {
    key: 'errorRate',
    title: '错误率',
    unit: '%',
    max: 100,
    warning: 5,
    color: '#D0021B',
  },
  {
    key: 'bandwidthIn',
    title: '入带宽',
    unit: 'MB/s',
    max: 1000,
    warning: 800,
    color: '#BD10E0',
  },
  {
    key: 'bandwidthOut',
    title: '出带宽',
    unit: 'MB/s',
    max: 1000,
    warning: 800,
    color: '#7ED321',
  },
] as const;

export const TOP_ENDPOINTS_HEADERS = [
  { key: 'path', label: '接口路径' },
  { key: 'count', label: '请求次数' },
  { key: 'avgTime', label: '平均耗时(ms)' },
] as const;

export const SYSTEM_STATUS = {
  healthy: { label: '健康', color: '#50C878', icon: 'CheckCircle' },
  warning: { label: '警告', color: '#F5A623', icon: 'AlertTriangle' },
  critical: { label: '严重', color: '#D0021B', icon: 'XCircle' },
} as const;
