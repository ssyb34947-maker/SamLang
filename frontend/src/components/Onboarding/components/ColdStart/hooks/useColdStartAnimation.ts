/**
 * 冷启动动画 Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ANIMATION_CONFIG, COLD_START_STAGES } from '../constants';

interface AnimationState {
  progress: number;
  currentStage: string;
  gearRotation: number;
  isComplete: boolean;
}

export const useColdStartAnimation = (isActive: boolean) => {
  const [state, setState] = useState<AnimationState>({
    progress: 0,
    currentStage: COLD_START_STAGES.INIT,
    gearRotation: 0,
    isComplete: false,
  });

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 根据进度获取当前阶段
  const getStageByProgress = useCallback((progress: number): string => {
    const stages = ANIMATION_CONFIG.STAGE_PROGRESS;
    for (const [stage, range] of Object.entries(stages)) {
      if (progress >= range.start && progress < range.end) {
        return stage;
      }
    }
    return COLD_START_STAGES.COMPLETE;
  }, []);

  // 开始动画
  const startAnimation = useCallback(() => {
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const rawProgress = Math.min(
        (elapsed / ANIMATION_CONFIG.TOTAL_DURATION) * 100,
        100
      );

      // 添加缓动效果
      const easedProgress = easeOutCubic(rawProgress / 100) * 100;

      const currentStage = getStageByProgress(easedProgress);
      const gearRotation = (elapsed / 10) % 360;
      const isComplete = easedProgress >= 100;

      setState({
        progress: easedProgress,
        currentStage,
        gearRotation,
        isComplete,
      });

      if (!isComplete && isActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isActive, getStageByProgress]);

  // 缓动函数
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  // 重置动画
  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    startTimeRef.current = null;
    setState({
      progress: 0,
      currentStage: COLD_START_STAGES.INIT,
      gearRotation: 0,
      isComplete: false,
    });
  }, []);

  useEffect(() => {
    if (isActive) {
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, startAnimation]);

  return {
    progress: state.progress,
    currentStage: state.currentStage,
    gearRotation: state.gearRotation,
    isComplete: state.isComplete,
    resetAnimation,
  };
};

export default useColdStartAnimation;
