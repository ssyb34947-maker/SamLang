import { Variants } from 'framer-motion';

// 页面进入动画
export const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
};

// 侧边栏动画
export const sidebarVariants: Variants = {
  expanded: {
    width: 280,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  collapsed: {
    width: 64,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// 内容区域动画
export const contentVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// 菜单项动画
export const menuItemVariants: Variants = {
  initial: { opacity: 1, x: 0 },
  active: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    x: 4,
    transition: {
      duration: 0.2,
    },
  },
};

// 目录项动画
export const tocItemVariants: Variants = {
  initial: { opacity: 1, x: 0 },
  active: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    x: 2,
    transition: {
      duration: 0.2,
    },
  },
};

// 菜单容器动画
export const menuContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

// 代码块动画
export const codeBlockVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// 标题动画
export const headingVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// 悬停效果
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const hoverBg = {
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  transition: { duration: 0.2 },
};

// 点击效果
export const tapScale = {
  scale: 0.98,
};
