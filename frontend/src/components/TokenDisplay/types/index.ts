/**
 * Token显示组件类型定义
 */

/**
 * Token使用统计
 */
export interface TokenStats {
  /** 输入token数 */
  promptTokens: number;
  /** 输出token数 */
  completionTokens: number;
  /** 总token数 */
  totalTokens: number;
}

/**
 * 对话Token信息
 */
export interface ConversationTokenInfo {
  /** 对话ID */
  conversationId: string;
  /** Token统计 */
  tokens: TokenStats;
  /** 最后更新时间 */
  updatedAt?: string;
}

/**
 * 消息Token信息
 */
export interface MessageTokenInfo {
  /** 消息ID */
  messageId: string;
  /** Token统计 */
  tokens: TokenStats;
}

/**
 * Token显示组件Props
 */
export interface TokenDisplayProps {
  /** Token统计 */
  tokens: TokenStats;
  /** 显示模式 */
  mode?: 'compact' | 'detailed' | 'mini';
  /** 自定义类名 */
  className?: string;
  /** 动画延迟（毫秒） */
  animationDelay?: number;
}

/**
 * Token计数器动画Props
 */
export interface TokenCounterProps {
  /** 目标数值 */
  value: number;
  /** 标签 */
  label: string;
  /** 持续时间（毫秒） */
  duration?: number;
  /** 前缀 */
  prefix?: string;
  /** 后缀 */
  suffix?: string;
}

/**
 * 对话级Token显示Props
 */
export interface ConversationTokenHeaderProps {
  /** 对话ID */
  conversationId: string;
  /** 初始Token数据 */
  initialTokens?: TokenStats;
  /** 是否可见 */
  visible?: boolean;
}
