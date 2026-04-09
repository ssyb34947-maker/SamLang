/**
 * Token显示组件常量
 */

/**
 * 动画持续时间（毫秒）
 */
export const ANIMATION_DURATION = {
  /** 计数器动画 */
  counter: 800,
  /** 淡入动画 */
  fadeIn: 300,
  /** 滑入动画 */
  slideIn: 400,
  /** 脉冲动画 */
  pulse: 2000,
} as const;

/**
 * 动画延迟（毫秒）
 */
export const ANIMATION_DELAY = {
  /** 默认延迟 */
  default: 100,
  /** 计数器间隔 */
  counterStagger: 100,
  /** 组件显示延迟 */
  componentShow: 200,
} as const;

/**
 * 显示模式配置
 */
export const DISPLAY_MODE = {
  /** 紧凑模式 - 只显示总数 */
  compact: {
    showLabels: false,
    showDetails: false,
    iconSize: 14,
    fontSize: 'text-xs',
  },
  /** 详细模式 - 显示输入/输出/总数 */
  detailed: {
    showLabels: true,
    showDetails: true,
    iconSize: 16,
    fontSize: 'text-sm',
  },
  /** 迷你模式 - 仅图标和数字 */
  mini: {
    showLabels: false,
    showDetails: false,
    iconSize: 12,
    fontSize: 'text-xs',
  },
} as const;

/**
 * Token类型标签
 */
export const TOKEN_LABELS = {
  prompt: '输入',
  completion: '输出',
  total: '总计',
} as const;

/**
 * Token类型图标颜色
 */
export const TOKEN_COLORS = {
  prompt: '#3b82f6',      // blue-500
  completion: '#10b981',  // emerald-500
  total: '#8b5cf6',       // violet-500
} as const;

/**
 * 数字格式化选项
 */
export const NUMBER_FORMAT = {
  /** 千分位分隔符 */
  thousandSeparator: ',',
  /** 小数位数 */
  decimalPlaces: 0,
} as const;

/**
 * 阈值配置（用于显示警告）
 */
export const TOKEN_THRESHOLDS = {
  /** 正常 */
  normal: 1000,
  /** 警告 */
  warning: 4000,
  /** 危险 */
  danger: 8000,
} as const;
