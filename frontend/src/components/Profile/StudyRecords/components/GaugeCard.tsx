import React, { useEffect, useState, useRef } from 'react';

interface GaugeCardProps {
  icon: string;
  title: string;
  value: number;
  maxValue: number;
  unit: string;
  subtext: string;
  color?: string;
  isLoading?: boolean;
}

// 同步动画钩子 - 数值和轮盘同时动画
const useSyncAnimation = (
  targetValue: number,
  maxValue: number,
  isLoading: boolean,
  duration: number = 2000
) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [strokeDashoffset, setStrokeDashoffset] = useState(0);
  const hasAnimated = useRef(false);
  const animationRef = useRef<number | null>(null);

  // 半圆参数
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI;

  useEffect(() => {
    // 加载中：直接显示目标值，不动画
    if (isLoading) {
      const targetPercentage = Math.min((targetValue / maxValue) * 100, 100);
      const targetOffset = circumference - (targetPercentage / 100) * circumference;
      setAnimatedValue(targetValue);
      setStrokeDashoffset(targetOffset);
      hasAnimated.current = false;
      return;
    }

    // 已经动画过，直接显示
    if (hasAnimated.current) {
      const targetPercentage = Math.min((targetValue / maxValue) * 100, 100);
      const targetOffset = circumference - (targetPercentage / 100) * circumference;
      setAnimatedValue(targetValue);
      setStrokeDashoffset(targetOffset);
      return;
    }

    // 首次加载完成：播放同步动画
    hasAnimated.current = true;
    const startTime = performance.now();
    const startValue = 0;
    const startPercentage = 0;
    const targetPercentage = Math.min((targetValue / maxValue) * 100, 100);
    const targetOffset = circumference - (targetPercentage / 100) * circumference;
    const startOffset = circumference; // 从0%开始

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // 同步计算数值和轮盘位置
      const currentValue = startValue + (targetValue - startValue) * easeProgress;
      const currentPercentage = startPercentage + (targetPercentage - startPercentage) * easeProgress;
      const currentOffset = startOffset - (startOffset - targetOffset) * easeProgress;

      setAnimatedValue(currentValue);
      setStrokeDashoffset(currentOffset);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, maxValue, isLoading, duration, circumference]);

  return { animatedValue, strokeDashoffset, circumference };
};

// 半圆仪表盘组件
export const GaugeCard: React.FC<GaugeCardProps> = ({
  icon,
  title,
  value,
  maxValue,
  unit,
  subtext,
  color = '#ff4d4d',
  isLoading = false,
}) => {
  const { animatedValue, strokeDashoffset, circumference } = useSyncAnimation(value, maxValue, isLoading);

  // 半圆参数
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;

  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-5 hover:shadow-[var(--shadow-hover)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
      {/* 头部：图标和标题 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="font-[var(--font-hand-body)] text-sm text-[#666]">{title}</span>
      </div>

      {/* 半圆仪表盘 */}
      <div className="relative flex justify-center mb-3">
        <svg
          width={radius * 2}
          height={radius}
        >
          {/* 背景半圆 */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="#e5e0d8"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference * 2}`}
            transform={`rotate(180 ${radius} ${radius})`}
          />

          {/* 进度半圆 - 使用JS动画，不使用CSS transition */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference * 2}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(180 ${radius} ${radius})`}
            // 移除CSS transition，完全依赖JS动画
          />

          {/* 刻度线 */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * Math.PI;
            const tickRadius = normalizedRadius - 20;
            const x1 = radius + Math.cos(angle) * tickRadius;
            const y1 = radius - Math.sin(angle) * tickRadius;
            const x2 = radius + Math.cos(angle) * (tickRadius + 8);
            const y2 = radius - Math.sin(angle) * (tickRadius + 8);

            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#2d2d2d"
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* 中心数值 */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <span
            className="font-[var(--font-hand-heading)] text-4xl font-bold"
            style={{ color }}
          >
            {Math.round(animatedValue)}
          </span>
          <span className="font-[var(--font-hand-body)] text-sm text-[#666] ml-1">
            {unit}
          </span>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="text-center">
        <p className="font-[var(--font-hand-body)] text-xs text-[#666]">{subtext}</p>
        {isLoading && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="w-2 h-2 bg-[#ff4d4d] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-[#ff4d4d] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-[#ff4d4d] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="font-[var(--font-hand-body)] text-xs text-[#666] ml-1">加载中...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GaugeCard;
