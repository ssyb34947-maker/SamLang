/**
 * 用户引导页面动画 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { ANIMATION_DURATION } from '../constants';

interface AnimationState {
  opacity: number;
  translateY: number;
  scale: number;
}

export const useOnboardingAnimation = (currentStep: number) => {
  const [contentAnim, setContentAnim] = useState<AnimationState>({
    opacity: 0,
    translateY: 20,
    scale: 0.98,
  });

  const [isAnimating, setIsAnimating] = useState(false);

  // 进入动画
  const animateIn = useCallback(() => {
    setIsAnimating(true);
    setContentAnim({
      opacity: 0,
      translateY: 20,
      scale: 0.98,
    });

    requestAnimationFrame(() => {
      setContentAnim({
        opacity: 1,
        translateY: 0,
        scale: 1,
      });

      setTimeout(() => {
        setIsAnimating(false);
      }, ANIMATION_DURATION.CONTENT_FADE_IN);
    });
  }, []);

  // 退出动画
  const animateOut = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      setIsAnimating(true);
      setContentAnim({
        opacity: 0,
        translateY: -20,
        scale: 0.98,
      });

      setTimeout(() => {
        setIsAnimating(false);
        resolve();
      }, ANIMATION_DURATION.STEP_TRANSITION);
    });
  }, []);

  // 步骤变化时触发进入动画
  useEffect(() => {
    animateIn();
  }, [currentStep, animateIn]);

  // 获取内容样式
  const getContentStyle = useCallback((): React.CSSProperties => ({
    opacity: contentAnim.opacity,
    transform: `translateY(${contentAnim.translateY}px) scale(${contentAnim.scale})`,
    transition: `all ${ANIMATION_DURATION.CONTENT_FADE_IN}ms ease-out`,
  }), [contentAnim]);

  return {
    isAnimating,
    getContentStyle,
    animateOut,
    animateIn,
  };
};

export default useOnboardingAnimation;
