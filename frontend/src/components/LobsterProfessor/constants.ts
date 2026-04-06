/**
 * 龙虾教授组件常量配置
 * 所有颜色、尺寸、公式等常量集中管理
 */

// 龙虾颜色系统 - 红橘黄色调
export const LOBSTER_COLORS = {
  // 主色调
  primary: '#FF6B35',      // 鲜橙色
  secondary: '#F7931E',    // 金黄色
  accent: '#FF4D00',       // 深橘红

  // 身体渐变
  bodyLight: '#FFB347',    // 浅橙黄
  bodyMedium: '#FF8C42',   // 中橙
  bodyDark: '#E85D04',     // 深橙红
  bodyDarker: '#D00000',   // 深红

  // 细节颜色
  shellHighlight: '#FFD93D',  // 壳高光
  shellShadow: '#C91818',     // 壳阴影
  eyeWhite: '#FFFFFF',        // 眼白
  eyePupil: '#1A1A2E',        // 瞳孔

  // 触角和腿部
  antenna: '#FF6B35',
  leg: '#E85D04',

  // 钳子
  clawMain: '#FF6B35',
  clawTip: '#F7931E',
} as const;

// 组件尺寸配置
export const DIMENSIONS = {
  // 整体画布
  canvasWidth: 600,
  canvasHeight: 500,

  // 龙虾身体
  bodyWidth: 120,
  bodyHeight: 160,
  bodyCenterX: 300,
  bodyCenterY: 320,

  // 头部
  headWidth: 100,
  headHeight: 80,

  // 眼睛
  eyeRadius: 12,
  eyeOffsetX: 25,
  eyeOffsetY: -30,

  // 触角
  antennaLength: 60,
  antennaCurve: 20,

  // 钳子
  clawWidth: 50,
  clawHeight: 70,
  leftClawX: 180,   // 拿平板的手
  rightClawX: 420,  // 指向黑板的手
  clawY: 280,

  // 腿部
  legLength: 40,
  legWidth: 8,

  // 尾巴
  tailWidth: 80,
  tailHeight: 60,

  // 平板
  tabletWidth: 70,
  tabletHeight: 90,
  tabletX: 150,
  tabletY: 300,

  // 黑板
  blackboardWidth: 400,
  blackboardHeight: 250,
  blackboardX: 300,
  blackboardY: 130,
} as const;

// 数学公式集合
export const MATH_FORMULAS = [
  { id: 'pythagoras', text: 'a² + b² = c²', name: '勾股定理' },
  { id: 'quadratic', text: 'x = -b ± √(b²-4ac) / 2a', name: '求根公式' },
  { id: 'integral', text: '∫f(x)dx = F(x) + C', name: '不定积分' },
  { id: 'derivative', text: 'd/dx(xⁿ) = nxⁿ⁻¹', name: '幂函数导数' },
  { id: 'euler', text: 'e^(iπ) + 1 = 0', name: '欧拉公式' },
  { id: 'limit', text: 'lim(1+1/n)ⁿ = e', name: '自然常数' },
  { id: 'trig', text: 'sin²θ + cos²θ = 1', name: '三角恒等式' },
  { id: 'log', text: 'log(ab) = log a + log b', name: '对数性质' },
] as const;

// 动画时序配置
export const ANIMATION_TIMING = {
  // 基础动画
  idleDuration: 2,
  idleDelay: 0.5,
  
  // 指向动画
  pointDuration: 0.8,
  pointDelay: 0.2,
  
  // 眨眼动画
  blinkDuration: 0.15,
  blinkInterval: 3000,
  
  // 触角摆动
  antennaDuration: 1.5,
  antennaDelay: 0.1,
  
  // 平板浮动
  tabletFloatDuration: 2,
  tabletFloatHeight: 5,
  
  // 公式切换
  formulaTransition: 0.5,
  formulaInterval: 4000,
  
  // 呼吸效果
  breatheDuration: 3,
  breatheScale: 0.02,
} as const;

// 教学动作配置
export const TEACHING_ACTIONS = {
  // 指向位置
  pointPositions: [
    { x: 220, y: 80, label: '公式1' },
    { x: 300, y: 100, label: '公式2' },
    { x: 380, y: 90, label: '公式3' },
    { x: 260, y: 150, label: '公式4' },
  ],
  
  // 动作类型
  actions: [
    'point',      // 指向
    'explain',    // 讲解
    'think',      // 思考
    'emphasize',  // 强调
  ] as const,
} as const;

// SVG路径常量
export const SVG_PATHS = {
  // 身体轮廓
  bodyPath: `M 0,-60 
             C 30,-60 50,-40 50,0 
             C 50,40 30,70 0,80 
             C -30,70 -50,40 -50,0 
             C -50,-40 -30,-60 0,-60 Z`,
  
  // 尾巴
  tailPath: `M 0,80 
             C 20,90 35,110 30,130 
             C 25,145 10,150 0,145 
             C -10,150 -25,145 -30,130 
             C -35,110 -20,90 0,80 Z`,
  
  // 钳子 - 闭合状态
  clawClosed: `M 0,0 
               C 15,-5 30,0 35,15 
               C 38,25 35,35 25,40 
               C 15,35 5,30 0,25 
               C -5,30 -15,35 -25,40 
               C -35,35 -38,25 -35,15 
               C -30,0 -15,-5 0,0 Z`,
  
  // 钳子 - 张开状态
  clawOpen: `M 0,0 
             C 20,-10 40,5 45,25 
             C 48,40 40,55 25,50 
             C 10,45 0,35 0,30 
             C 0,35 -10,45 -25,50 
             C -40,55 -48,40 -45,25 
             C -40,5 -20,-10 0,0 Z`,
  
  // 触须
  whisker: `M 0,0 Q 10,-20 25,-30 T 50,-35`,
} as const;

// 黑板样式
export const BLACKBOARD_STYLES = {
  bgColor: '#2D3436',
  borderColor: '#636E72',
  frameColor: '#8B4513',
  chalkColor: '#FFFFFF',
  chalkOpacity: 0.9,
  gridColor: 'rgba(255,255,255,0.05)',
} as const;
