/**
 * 对话级Token显示组件（导航栏版本）
 * 显示prompt和completion token，适配手绘风格
 */

import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { ConversationTokenHeaderProps } from '../types';
import { ANIMATION_DELAY, TOKEN_COLORS } from '../constants';
import { formatNumber, getTokenStatusColor } from '../utils';

/**
 * 对话级Token显示组件（手绘风格版）
 * 显示在导航栏中，展示prompt和completion token
 */
export const ConversationTokenHeader: React.FC<ConversationTokenHeaderProps> = ({
  initialTokens,
  visible = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const promptTokens = initialTokens?.promptTokens || 0;
  const completionTokens = initialTokens?.completionTokens || 0;
  const totalTokens = initialTokens?.totalTokens || 0;
  const statusColor = getTokenStatusColor(totalTokens);

  useEffect(() => {
    if (visible && totalTokens > 0) {
      const timer = setTimeout(() => setIsVisible(true), ANIMATION_DELAY.default);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [visible, totalTokens]);

  if (!visible || totalTokens === 0) return null;

  return (
    <div
      className={`flex items-center gap-2 transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      {/* 标签 */}
      <span
        className="text-xs font-medium hidden sm:block"
        style={{ color: 'var(--sketch-text)', fontFamily: 'var(--font-hand-body)' }}
      >
        Token消耗
      </span>

      {/* Token统计卡片 */}
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{
          backgroundColor: 'var(--sketch-paper)',
          border: '2px solid var(--sketch-border)',
          borderRadius: 'var(--wobbly-sm)',
          boxShadow: 'var(--shadow-soft)',
        }}
        title={`输入: ${formatNumber(promptTokens)} | 输出: ${formatNumber(completionTokens)} | 总计: ${formatNumber(totalTokens)}`}
      >
        {/* 输入Token */}
        <div className="flex items-center gap-1">
          <ArrowRight size={14} style={{ color: TOKEN_COLORS.prompt }} />
          <span className="text-sm font-medium" style={{ color: 'var(--sketch-text)' }}>
            {formatNumber(promptTokens)}
          </span>
        </div>

        {/* 分隔符 */}
        <span style={{ color: 'var(--sketch-border)' }}>|</span>

        {/* 输出Token */}
        <div className="flex items-center gap-1">
          <ArrowLeft size={14} style={{ color: TOKEN_COLORS.completion }} />
          <span className="text-sm font-medium" style={{ color: 'var(--sketch-text)' }}>
            {formatNumber(completionTokens)}
          </span>
        </div>

        {/* 分隔符 */}
        <span style={{ color: 'var(--sketch-border)' }}>|</span>

        {/* 总计 */}
        <div className="flex items-center gap-1">
          <Zap size={14} style={{ color: statusColor }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--sketch-text)' }}>
            {formatNumber(totalTokens)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversationTokenHeader;
