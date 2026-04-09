/**
 * Token显示组件
 * 显示消息或对话的Token消耗统计
 */

import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { TokenDisplayProps } from '../types';
import { DISPLAY_MODE, TOKEN_LABELS, TOKEN_COLORS, ANIMATION_DELAY } from '../constants';
import { formatNumber, getTokenStatusColor } from '../utils';
import { TokenCounterAnimation } from './TokenCounterAnimation';

/**
 * Token显示组件
 * 支持三种显示模式：compact(紧凑), detailed(详细), mini(迷你)
 */
export const TokenDisplay: React.FC<TokenDisplayProps> = ({
  tokens,
  mode = 'compact',
  className = '',
  animationDelay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const config = DISPLAY_MODE[mode];
  const statusColor = getTokenStatusColor(tokens.totalTokens);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  if (!tokens || (tokens.totalTokens === 0 && mode === 'mini')) {
    return null;
  }

  // 紧凑模式 - 只显示总token数
  if (mode === 'compact') {
    return (
      <div
        className={`flex items-center gap-1.5 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      >
        <Zap size={config.iconSize} style={{ color: statusColor }} />
        <TokenCounterAnimation
          value={tokens.totalTokens}
          className={`${config.fontSize} font-medium`}
        />
        <span className={`${config.fontSize} text-gray-500`}>tokens</span>
      </div>
    );
  }

  // 详细模式 - 显示输入/输出/总数
  if (mode === 'detailed') {
    return (
      <div
        className={`flex flex-col gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        } ${className}`}
      >
        {/* 标题 */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Zap size={14} style={{ color: statusColor }} />
          <span>Token 消耗</span>
        </div>

        {/* 统计行 */}
        <div className="flex items-center justify-between">
          {/* 输入Token */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: TOKEN_COLORS.prompt }}
            />
            <span className="text-xs text-gray-600">{TOKEN_LABELS.prompt}</span>
            <TokenCounterAnimation
              value={tokens.promptTokens}
              duration={400}
              className="text-sm font-medium text-gray-800"
            />
          </div>

          {/* 输出Token */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: TOKEN_COLORS.completion }}
            />
            <span className="text-xs text-gray-600">{TOKEN_LABELS.completion}</span>
            <TokenCounterAnimation
              value={tokens.completionTokens}
              duration={500}
              className="text-sm font-medium text-gray-800"
            />
          </div>

          {/* 总计 */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: TOKEN_COLORS.total }}
            />
            <span className="text-xs text-gray-600">{TOKEN_LABELS.total}</span>
            <TokenCounterAnimation
              value={tokens.totalTokens}
              duration={600}
              className="text-sm font-medium text-gray-800"
            />
          </div>
        </div>
      </div>
    );
  }

  // 迷你模式 - 仅图标和数字
  return (
    <div
      className={`flex items-center gap-1 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      title={`总计: ${formatNumber(tokens.totalTokens)} tokens`}
    >
      <Zap size={config.iconSize} style={{ color: statusColor }} />
      <span className={`${config.fontSize} font-medium`}>
        {formatNumber(tokens.totalTokens)}
      </span>
    </div>
  );
};

export default TokenDisplay;
