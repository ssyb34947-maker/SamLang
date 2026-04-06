/**
 * 龙虾教授组件类型定义
 */

import { Variants } from 'framer-motion';

// 教学动作类型
export type TeachingAction = 'point' | 'explain' | 'think' | 'emphasize';

// 龙虾部件类型
export type LobsterPart = 
  | 'body' 
  | 'head' 
  | 'leftClaw' 
  | 'rightClaw' 
  | 'leftEye' 
  | 'rightEye' 
  | 'antennae' 
  | 'legs' 
  | 'tail';

// 公式类型
export interface Formula {
  id: string;
  text: string;
  name: string;
}

// 位置类型
export interface Position {
  x: number;
  y: number;
}

// 尺寸类型
export interface Size {
  width: number;
  height: number;
}

// 动画配置类型
export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string | number[];
  repeat?: number | boolean;
  repeatType?: 'loop' | 'reverse' | 'mirror';
}

// 龙虾教授组件属性
export interface LobsterProfessorProps {
  // 尺寸
  width?: number;
  height?: number;
  
  // 动画控制
  autoPlay?: boolean;
  animationSpeed?: number;
  
  // 公式显示
  formulas?: Formula[];
  formulaInterval?: number;
  
  // 教学动作
  teachingAction?: TeachingAction;
  onActionChange?: (action: TeachingAction) => void;
  
  // 交互
  interactive?: boolean;
  onClick?: () => void;
  onFormulaClick?: (formula: Formula) => void;
  
  // 样式
  className?: string;
  style?: React.CSSProperties;
}

// 黑板组件属性
export interface BlackboardProps {
  formulas: Formula[];
  currentIndex: number;
  width: number;
  height: number;
  x: number;
  y: number;
  onFormulaClick?: (formula: Formula) => void;
}

// 龙虾身体部件属性
export interface LobsterBodyProps {
  centerX: number;
  centerY: number;
  isAnimating: boolean;
}

// 龙虾钳子属性
export interface LobsterClawProps {
  x: number;
  y: number;
  isLeft: boolean;
  isPointing: boolean;
  pointTarget?: Position | null;
  onAnimationComplete?: () => void;
}

// 龙虾眼睛属性
export interface LobsterEyeProps {
  x: number;
  y: number;
  isBlinking: boolean;
}

// 平板组件属性
export interface TabletProps {
  x: number;
  y: number;
  width: number;
  height: number;
  isFloating: boolean;
}

// 动画变体类型
export type AnimationVariants = Record<string, Variants>;

// 教学状态类型
export interface TeachingState {
  currentAction: TeachingAction;
  currentFormulaIndex: number;
  isPointing: boolean;
  pointTarget: Position | null;
}

// 颜色主题类型
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  bodyLight: string;
  bodyMedium: string;
  bodyDark: string;
  eyeWhite: string;
  eyePupil: string;
}

// 事件处理器类型
export type LobsterEventHandlers = {
  onBodyClick?: () => void;
  onClawClick?: (isLeft: boolean) => void;
  onEyeClick?: () => void;
  onBlackboardClick?: () => void;
};

// 组件状态类型
export interface LobsterState {
  isIdle: boolean;
  isTeaching: boolean;
  isThinking: boolean;
  blinkState: boolean;
  antennaPhase: number;
};
