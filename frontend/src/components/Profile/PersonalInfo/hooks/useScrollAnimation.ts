import { useState, useEffect, useCallback, useRef } from 'react';

interface AnimationState {
  // 书卷展开状态
  scrollProgress: number; // 0-1，书卷展开进度
  scrollRotation: number; // 书卷旋转角度
  scrollScale: number; // 书卷缩放
  // 图钉状态
  pinProgress: number; // 0-1，图钉下落进度
  pinBounce: number; // 图钉弹跳偏移
  // 内容淡入
  contentOpacity: number; // 内容透明度
  contentY: number; // 内容Y轴偏移
}

interface UseScrollAnimationOptions {
  onAnimationComplete?: () => void;
}

// 物理常数
const PHYSICS = {
  // 重力加速度 (px/ms²)
  GRAVITY: 0.008,
  // 弹性系数
  BOUNCINESS: 0.4,
  // 阻尼系数
  DAMPING: 0.85,
  // 书卷展开速度
  UNFOLD_SPEED: 0.015,
  // 图钉下落延迟 (ms)
  PIN_DELAY: 400,
};

export const useScrollAnimation = (options?: UseScrollAnimationOptions) => {
  const [state, setState] = useState<AnimationState>({
    scrollProgress: 0,
    scrollRotation: -15,
    scrollScale: 0.3,
    pinProgress: 0,
    pinBounce: 0,
    contentOpacity: 0,
    contentY: 30,
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pinVelocityRef = useRef<number>(0);
  const pinBounceCountRef = useRef<number>(0);

  // 重置动画
  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setState({
      scrollProgress: 0,
      scrollRotation: -15,
      scrollScale: 0.3,
      pinProgress: 0,
      pinBounce: 0,
      contentOpacity: 0,
      contentY: 30,
    });
    setIsAnimating(false);
    setIsComplete(false);
    pinVelocityRef.current = 0;
    pinBounceCountRef.current = 0;
  }, []);

  // 开始动画
  const startAnimation = useCallback(() => {
    resetAnimation();
    setIsAnimating(true);
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;

      setState((prev) => {
        // ========== 书卷展开动画 ==========
        // 使用缓动函数模拟书卷展开的弹性
        const unfoldProgress = Math.min(elapsed * PHYSICS.UNFOLD_SPEED * 0.016, 1);
        // easeOutBack 缓动，模拟书卷展开时的轻微回弹
        const easeOutBack = (t: number) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        const scrollProgress = Math.min(easeOutBack(unfoldProgress), 1);

        // 书卷从卷起状态旋转到平铺状态
        const scrollRotation = -15 * (1 - scrollProgress);
        // 书卷从缩小状态放大到正常
        const scrollScale = 0.3 + 0.7 * scrollProgress;

        // ========== 图钉下落动画 ==========
        let pinProgress = prev.pinProgress;
        let pinBounce = prev.pinBounce;

        if (elapsed > PHYSICS.PIN_DELAY && scrollProgress > 0.6) {
          // 图钉开始下落
          const pinElapsed = elapsed - PHYSICS.PIN_DELAY;

          if (pinBounceCountRef.current < 3) {
            // 模拟重力下落和弹跳
            pinVelocityRef.current += PHYSICS.GRAVITY * 16; // 每帧增加速度
            pinProgress += pinVelocityRef.current;

            // 撞击底部（书卷）
            if (pinProgress >= 1) {
              pinProgress = 1;
              // 反弹
              pinVelocityRef.current = -pinVelocityRef.current * PHYSICS.BOUNCINESS;
              pinBounceCountRef.current++;

              // 计算弹跳偏移（用于视觉晃动）
              pinBounce = Math.abs(pinVelocityRef.current) * 2;
            }

            // 阻尼使弹跳逐渐停止
            pinVelocityRef.current *= PHYSICS.DAMPING;
          } else {
            // 弹跳结束，固定在书卷上
            pinProgress = 1;
            pinBounce *= 0.9; // 逐渐减小晃动
          }
        }

        // ========== 内容淡入动画 ==========
        // 书卷展开到80%时开始显示内容
        let contentOpacity = prev.contentOpacity;
        let contentY = prev.contentY;

        if (scrollProgress > 0.8) {
          const contentProgress = (scrollProgress - 0.8) / 0.2;
          contentOpacity = Math.min(contentProgress, 1);
          contentY = 30 * (1 - contentProgress);
        }

        // 检查动画是否完成
        const isAnimationComplete =
          scrollProgress >= 1 &&
          pinProgress >= 1 &&
          pinBounce < 0.1 &&
          contentOpacity >= 1;

        if (isAnimationComplete && !isComplete) {
          setIsComplete(true);
          setIsAnimating(false);
          options?.onAnimationComplete?.();
        }

        return {
          scrollProgress,
          scrollRotation,
          scrollScale,
          pinProgress,
          pinBounce,
          contentOpacity,
          contentY,
        };
      });

      if (!isComplete) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [resetAnimation, isComplete, options]);

// 清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    state,
    isAnimating,
    isComplete,
    startAnimation,
    resetAnimation,
  };
};

export default useScrollAnimation;
