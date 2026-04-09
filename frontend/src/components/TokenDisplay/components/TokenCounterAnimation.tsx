/**
 * Token计数器动画组件
 * 实现数字递增动画效果
 */

import React, { useState, useEffect, useRef } from 'react';
import { ANIMATION_DURATION } from '../constants';
import { formatNumber } from '../utils';

interface TokenCounterAnimationProps {
  value: number;
  duration?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

/**
 * Token计数器动画组件
 * 从0递增到目标值，带动画效果
 */
export const TokenCounterAnimation: React.FC<TokenCounterAnimationProps> = ({
  value,
  duration = ANIMATION_DURATION.counter,
  className = '',
  onAnimationComplete,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数：easeOutQuad
      const easeOut = 1 - (1 - progress) * (1 - progress);
      const currentValue = Math.round(value * easeOut);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        onAnimationComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, onAnimationComplete]);

  return (
    <span className={className}>
      {formatNumber(displayValue)}
    </span>
  );
};

export default TokenCounterAnimation;
