/**
 * 龙虾教授动画配置
 * 所有动画变体集中管理，与组件逻辑解耦
 */

import { Variants } from 'framer-motion';
import { ANIMATION_TIMING } from './constants';

// 呼吸动画 - 身体轻微缩放
export const breatheVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1 + ANIMATION_TIMING.breatheScale, 1],
    transition: {
      duration: ANIMATION_TIMING.breatheDuration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

// 闲置摇摆动画
export const idleSwayVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [-1, 1, -1],
    transition: {
      duration: ANIMATION_TIMING.idleDuration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

// 眨眼动画
export const blinkVariants: Variants = {
  open: { scaleY: 1 },
  closed: { scaleY: 0.1 },
};

// 触角摆动动画
export const antennaVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [-5, 5, -5],
    transition: {
      duration: ANIMATION_TIMING.antennaDuration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
      delay: ANIMATION_TIMING.antennaDelay,
    },
  },
};

// 左触角（稍微不同的相位）
export const leftAntennaVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [-3, 7, -3],
    transition: {
      duration: ANIMATION_TIMING.antennaDuration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

// 右触角
export const rightAntennaVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [7, -3, 7],
    transition: {
      duration: ANIMATION_TIMING.antennaDuration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
      delay: 0.2,
    },
  },
};

// 平板浮动动画
export const tabletFloatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-ANIMATION_TIMING.tabletFloatHeight, ANIMATION_TIMING.tabletFloatHeight, -ANIMATION_TIMING.tabletFloatHeight],
    transition: {
      duration: ANIMATION_TIMING.tabletFloatDuration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

// 左钳子动画（拿平板）
export const leftClawVariants: Variants = {
  idle: {
    rotate: 0,
    x: 0,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  holding: {
    rotate: -10,
    x: -5,
    y: 5,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// 右钳子动画（指向黑板）
export const rightClawVariants: Variants = {
  idle: {
    rotate: 0,
    x: 0,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  point: {
    rotate: -25,
    x: 10,
    y: -20,
    transition: { duration: ANIMATION_TIMING.pointDuration, ease: 'easeOut' },
  },
  emphasize: {
    rotate: [-25, -35, -25],
    x: [10, 15, 10],
    y: [-20, -25, -20],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      repeat: 2,
    },
  },
};

// 指向动画
export const pointingVariants: Variants = {
  initial: { rotate: 0 },
  point: (targetAngle: number) => ({
    rotate: targetAngle,
    transition: {
      duration: ANIMATION_TIMING.pointDuration,
      ease: 'easeOut',
    },
  }),
  return: {
    rotate: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// 尾巴摆动动画
export const tailWagVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [-3, 3, -3],
    transition: {
      duration: 1.2,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
  excited: {
    rotate: [-8, 8, -8],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

// 公式切换动画
export const formulaVariants: Variants = {
  enter: {
    opacity: 0,
    y: 10,
    scale: 0.95,
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.formulaTransition,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: ANIMATION_TIMING.formulaTransition,
      ease: 'easeIn',
    },
  },
};

// 思考动画
export const thinkVariants: Variants = {
  initial: { rotate: 0 },
  thinking: {
    rotate: [0, -5, 5, -3, 3, 0],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// 进入动画
export const entranceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
    },
  },
};

// 黑板公式容器动画
export const blackboardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// 单个公式项动画
export const formulaItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// 腿部行走动画
export const legWalkVariants: Variants = {
  initial: { rotate: 0 },
  walk: (index: number) => ({
    rotate: [-10, 10, -10],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
      delay: index * 0.1,
    },
  }),
};

// 强调动画 - 用于重点讲解
export const emphasizeVariants: Variants = {
  initial: { scale: 1 },
  emphasize: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
      repeat: 1,
    },
  },
};

// 悬浮动画 - 用于思考气泡等
export const floatUpVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [10, -5, -15, -25],
    transition: {
      duration: 2,
      ease: 'easeOut',
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

// 粉笔书写动画
export const chalkWriteVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1, ease: 'easeInOut' },
      opacity: { duration: 0.3 },
    },
  },
};

// 眼睛跟随动画
export const eyeFollowVariants: Variants = {
  center: { x: 0, y: 0 },
  lookLeft: { x: -3, y: 0 },
  lookRight: { x: 3, y: 0 },
  lookUp: { x: 0, y: -3 },
  lookDown: { x: 0, y: 3 },
};