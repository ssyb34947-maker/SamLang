/**
 * 龙虾教授组件入口文件
 * 统一导出所有公共API
 */

// 主组件
export { LobsterProfessor, default } from './LobsterProfessor';

// 子组件
export { Blackboard } from './Blackboard';
export {
  LobsterGradients,
  LobsterBody,
  LobsterHead,
  LobsterEyes,
  LobsterAntennae,
  LobsterClaw,
  LobsterLegs,
  LobsterTail,
  Tablet,
} from './LobsterParts';

// 类型定义
export type {
  LobsterProfessorProps,
  BlackboardProps,
  LobsterBodyProps,
  LobsterClawProps,
  LobsterEyeProps,
  TabletProps,
  TeachingAction,
  LobsterPart,
  Formula,
  Position,
  Size,
  AnimationConfig,
  AnimationVariants,
  TeachingState,
  ColorTheme,
  LobsterEventHandlers,
  LobsterState,
} from './types';

// 常量
export {
  LOBSTER_COLORS,
  DIMENSIONS,
  MATH_FORMULAS,
  ANIMATION_TIMING,
  TEACHING_ACTIONS,
  SVG_PATHS,
  BLACKBOARD_STYLES,
} from './constants';

// 动画
export {
  breatheVariants,
  idleSwayVariants,
  blinkVariants,
  antennaVariants,
  leftAntennaVariants,
  rightAntennaVariants,
  tabletFloatVariants,
  leftClawVariants,
  rightClawVariants,
  pointingVariants,
  tailWagVariants,
  formulaVariants,
  thinkVariants,
  entranceVariants,
  blackboardContainerVariants,
  formulaItemVariants,
  legWalkVariants,
  emphasizeVariants,
  floatUpVariants,
  chalkWriteVariants,
  eyeFollowVariants,
} from './animations';
