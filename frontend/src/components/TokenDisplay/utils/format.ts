/**
 * Token显示组件工具函数
 */

import { NUMBER_FORMAT, TOKEN_THRESHOLDS } from '../constants';

/**
 * 格式化数字（添加千分位分隔符）
 * @param value 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number): string {
  if (value === 0) return '0';
  return value.toLocaleString('zh-CN');
}

/**
 * 缩写大数字（如 1.2k, 3.4M）
 * @param value 数字
 * @returns 缩写后的字符串
 */
export function abbreviateNumber(value: number): string {
  if (value === 0) return '0';
  if (value < 1000) return value.toString();
  if (value < 1000000) return (value / 1000).toFixed(1) + 'k';
  return (value / 1000000).toFixed(1) + 'M';
}

/**
 * 根据token数量获取状态颜色
 * @param totalTokens 总token数
 * @returns 颜色代码
 */
export function getTokenStatusColor(totalTokens: number): string {
  if (totalTokens >= TOKEN_THRESHOLDS.danger) {
    return '#ef4444'; // red-500
  }
  if (totalTokens >= TOKEN_THRESHOLDS.warning) {
    return '#f59e0b'; // amber-500
  }
  return '#10b981'; // emerald-500
}

/**
 * 根据token数量获取状态文本
 * @param totalTokens 总token数
 * @returns 状态文本
 */
export function getTokenStatusText(totalTokens: number): string {
  if (totalTokens >= TOKEN_THRESHOLDS.danger) {
    return '高消耗';
  }
  if (totalTokens >= TOKEN_THRESHOLDS.warning) {
    return '中等消耗';
  }
  return '正常';
}

/**
 * 计算token使用效率（输出/输入比）
 * @param promptTokens 输入token
 * @param completionTokens 输出token
 * @returns 效率比值
 */
export function calculateEfficiency(
  promptTokens: number,
  completionTokens: number
): number {
  if (promptTokens === 0) return 0;
  return Math.round((completionTokens / promptTokens) * 100);
}

/**
 * 估算token数量（基于字符数，粗略估计）
 * @param text 文本
 * @returns 估算的token数
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // 粗略估计：英文约4字符/token，中文约1.5字符/token
  // 这里使用简化的平均值：约3字符/token
  return Math.ceil(text.length / 3);
}

/**
 * 计算token总和
 * @param tokens 多个token对象
 * @returns 总和
 */
export function sumTokens(
  tokens: Array<{ promptTokens: number; completionTokens: number; totalTokens: number }>
): { promptTokens: number; completionTokens: number; totalTokens: number } {
  return tokens.reduce(
    (sum, t) => ({
      promptTokens: sum.promptTokens + (t.promptTokens || 0),
      completionTokens: sum.completionTokens + (t.completionTokens || 0),
      totalTokens: sum.totalTokens + (t.totalTokens || 0),
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  );
}
