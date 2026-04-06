/**
 * 冷启动动画常量
 */

// 冷启动阶段
export const COLD_START_STAGES = {
  INIT: 'init',
  ANALYZING: 'analyzing',
  PROCESSING: 'processing',
  OPTIMIZING: 'optimizing',
  COMPLETE: 'complete',
} as const;

// 状态文本模板
export const STATUS_TEMPLATES = {
  [COLD_START_STAGES.INIT]: '正在初始化...',
  [COLD_START_STAGES.ANALYZING]: '正在分析用户特征...',
  [COLD_START_STAGES.PROCESSING]: '正在处理学习数据...',
  [COLD_START_STAGES.OPTIMIZING]: '正在优化推荐算法...',
  [COLD_START_STAGES.COMPLETE]: '准备完成！',
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
  // 总时长（毫秒）
  TOTAL_DURATION: 5000,
  // 阶段进度分配
  STAGE_PROGRESS: {
    [COLD_START_STAGES.INIT]: { start: 0, end: 15 },
    [COLD_START_STAGES.ANALYZING]: { start: 15, end: 40 },
    [COLD_START_STAGES.PROCESSING]: { start: 40, end: 70 },
    [COLD_START_STAGES.OPTIMIZING]: { start: 70, end: 95 },
    [COLD_START_STAGES.COMPLETE]: { start: 95, end: 100 },
  },
  // 进度条动画间隔
  PROGRESS_INTERVAL: 50,
  // 文本切换间隔
  TEXT_SWITCH_INTERVAL: 800,
} as const;

// 装饰元素配置
export const DECORATION_CONFIG = {
  // 齿轮数量
  GEAR_COUNT: 3,
  // 齿轮旋转速度
  GEAR_SPEED: 2,
  // 粒子数量
  PARTICLE_COUNT: 6,
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  API_FAILED: '初始化失败，请重试',
  TIMEOUT: '初始化超时，请检查网络',
} as const;
