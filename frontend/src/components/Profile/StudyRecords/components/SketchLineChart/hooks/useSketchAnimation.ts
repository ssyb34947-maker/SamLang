// 手绘线条动画 Hook

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSketchAnimationOptions {
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
}

// 缓动函数
const easings = {
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
};

export const useSketchAnimation = (options: UseSketchAnimationOptions = {}) => {
  const { duration = 2000, delay = 0, easing = easings.easeOutCubic } = options;
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setProgress(0);
    startTimeRef.current = performance.now() + delay;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(rawProgress);
      
      setProgress(easedProgress);

      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [duration, delay, easing]);

  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setProgress(0);
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { progress, isAnimating, startAnimation, resetAnimation };
};

// 用于路径绘制的 Hook
export const usePathAnimation = (pathLength: number, options: UseSketchAnimationOptions = {}) => {
  const { progress } = useSketchAnimation(options);
  const strokeDashoffset = pathLength * (1 - progress);
  
  return { progress, strokeDashoffset, pathLength };
};
