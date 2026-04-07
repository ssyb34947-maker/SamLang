import { Variants } from 'framer-motion';
import { MODAL_CONFIG } from './constants';

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: MODAL_CONFIG.BACKDROP_OPACITY,
    transition: { duration: MODAL_CONFIG.ANIMATION_DURATION },
  },
  exit: {
    opacity: 0,
    transition: { duration: MODAL_CONFIG.ANIMATION_DURATION },
  },
};

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MODAL_CONFIG.ANIMATION_DURATION,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 30,
    transition: {
      duration: MODAL_CONFIG.ANIMATION_DURATION,
      ease: 'easeIn',
    },
  },
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const titleVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export const buttonHoverVariants = {
  scale: 1.05,
  transition: { duration: 0.2 },
};

export const buttonTapVariants = {
  scale: 0.95,
};

export const cardHoverVariants = {
  scale: 1.03,
  y: -4,
  transition: { duration: 0.2 },
};

export const cardSelectedVariants = {
  scale: 1.05,
  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
  transition: { duration: 0.2 },
};
