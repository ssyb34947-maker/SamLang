/**
 * 龙虾教授 SVG 部件组件
 * 所有龙虾身体部件的SVG定义，与动画和逻辑解耦
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LOBSTER_COLORS, DIMENSIONS } from './constants';
import {
  LobsterBodyProps,
  LobsterClawProps,
  LobsterEyeProps,
  TabletProps,
} from './types';
import {
  breatheVariants,
  leftClawVariants,
  rightClawVariants,
  leftAntennaVariants,
  rightAntennaVariants,
  tailWagVariants,
  tabletFloatVariants,
  blinkVariants,
} from './animations';

// 渐变定义组件
export const LobsterGradients: React.FC = () => (
  <defs>
    {/* 身体渐变 */}
    <linearGradient id="lobsterBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={LOBSTER_COLORS.bodyLight} />
      <stop offset="50%" stopColor={LOBSTER_COLORS.bodyMedium} />
      <stop offset="100%" stopColor={LOBSTER_COLORS.bodyDark} />
    </linearGradient>

    {/* 头部渐变 */}
    <linearGradient id="lobsterHeadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={LOBSTER_COLORS.shellHighlight} />
      <stop offset="50%" stopColor={LOBSTER_COLORS.bodyLight} />
      <stop offset="100%" stopColor={LOBSTER_COLORS.bodyMedium} />
    </linearGradient>

    {/* 钳子渐变 */}
    <linearGradient id="lobsterClawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={LOBSTER_COLORS.clawTip} />
      <stop offset="50%" stopColor={LOBSTER_COLORS.clawMain} />
      <stop offset="100%" stopColor={LOBSTER_COLORS.bodyDark} />
    </linearGradient>

    {/* 尾巴渐变 */}
    <linearGradient id="lobsterTailGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={LOBSTER_COLORS.bodyMedium} />
      <stop offset="100%" stopColor={LOBSTER_COLORS.bodyDarker} />
    </linearGradient>

    {/* 身体分段渐变 */}
    <linearGradient id="lobsterSegmentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor={LOBSTER_COLORS.bodyDark} />
      <stop offset="50%" stopColor={LOBSTER_COLORS.bodyMedium} />
      <stop offset="100%" stopColor={LOBSTER_COLORS.bodyDark} />
    </linearGradient>
  </defs>
);

// 龙虾身体组件
export const LobsterBody: React.FC<LobsterBodyProps> = ({ centerX, centerY, isAnimating }) => {
  return (
    <motion.g
      className="lobster-body"
      initial="initial"
      animate={isAnimating ? "animate" : "initial"}
      variants={breatheVariants}
      style={{ transformOrigin: `${centerX}px ${centerY + 80}px` }}
    >
      {/* 主体 */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={60}
        ry={80}
        className="lobster-body__shell"
      />

      {/* 身体分段线 */}
      <path
        d={`M ${centerX - 50} ${centerY - 20} Q ${centerX} ${centerY - 10} ${centerX + 50} ${centerY - 20}`}
        className="lobster-body__segment"
        fill="none"
      />
      <path
        d={`M ${centerX - 55} ${centerY + 20} Q ${centerX} ${centerY + 30} ${centerX + 55} ${centerY + 20}`}
        className="lobster-body__segment"
        fill="none"
      />

      {/* 高光 */}
      <ellipse
        cx={centerX - 20}
        cy={centerY - 30}
        rx={15}
        ry={25}
        className="lobster-body__highlight"
        opacity={0.5}
      />
    </motion.g>
  );
};

// 龙虾头部组件
export const LobsterHead: React.FC<{ centerX: number; centerY: number }> = ({
  centerX,
  centerY,
}) => {
  const headY = centerY - 70;

  return (
    <g className="lobster-head">
      {/* 头壳 */}
      <ellipse
        cx={centerX}
        cy={headY}
        rx={50}
        ry={40}
        className="lobster-head__shell"
      />

      {/* 头部高光 */}
      <ellipse
        cx={centerX - 15}
        cy={headY - 15}
        rx={12}
        ry={8}
        fill="rgba(255, 217, 61, 0.4)"
      />
    </g>
  );
};

// 龙虾眼睛组件
export const LobsterEyes: React.FC<{
  centerX: number;
  centerY: number;
  isBlinking: boolean;
}> = ({ centerX, centerY, isBlinking }) => {
  const eyeY = centerY - 85;
  const leftEyeX = centerX - 25;
  const rightEyeX = centerX + 25;

  return (
    <g className="lobster-eyes">
      {/* 左眼 */}
      <motion.g
        className="lobster-eye"
        animate={isBlinking ? "closed" : "open"}
        variants={blinkVariants}
        style={{ transformOrigin: `${leftEyeX}px ${eyeY}px` }}
      >
        <circle cx={leftEyeX} cy={eyeY} r={12} className="lobster-eye__white" />
        <circle cx={leftEyeX + 3} cy={eyeY} r={5} className="lobster-eye__pupil" />
        <circle cx={leftEyeX + 5} cy={eyeY - 3} r={2} className="lobster-eye__shine" />
      </motion.g>

      {/* 右眼 */}
      <motion.g
        className="lobster-eye"
        animate={isBlinking ? "closed" : "open"}
        variants={blinkVariants}
        style={{ transformOrigin: `${rightEyeX}px ${eyeY}px` }}
      >
        <circle cx={rightEyeX} cy={eyeY} r={12} className="lobster-eye__white" />
        <circle cx={rightEyeX + 3} cy={eyeY} r={5} className="lobster-eye__pupil" />
        <circle cx={rightEyeX + 5} cy={eyeY - 3} r={2} className="lobster-eye__shine" />
      </motion.g>
    </g>
  );
};

// 龙虾触角组件
export const LobsterAntennae: React.FC<{ centerX: number; centerY: number }> = ({
  centerX,
  centerY,
}) => {
  const baseY = centerY - 100;

  return (
    <g className="lobster-antennae">
      {/* 左长触角 */}
      <motion.path
        d={`M ${centerX - 20} ${baseY} Q ${centerX - 40} ${baseY - 40} ${centerX - 60} ${baseY - 80} T ${centerX - 80} ${baseY - 100}`}
        className="lobster-antenna lobster-antenna--long"
        initial="initial"
        animate="animate"
        variants={leftAntennaVariants}
        style={{ transformOrigin: `${centerX - 20}px ${baseY}px` }}
      />
      <circle cx={centerX - 80} cy={baseY - 100} r={3} className="lobster-antenna__tip" />

      {/* 右长触角 */}
      <motion.path
        d={`M ${centerX + 20} ${baseY} Q ${centerX + 40} ${baseY - 40} ${centerX + 60} ${baseY - 80} T ${centerX + 80} ${baseY - 100}`}
        className="lobster-antenna lobster-antenna--long"
        initial="initial"
        animate="animate"
        variants={rightAntennaVariants}
        style={{ transformOrigin: `${centerX + 20}px ${baseY}px` }}
      />
      <circle cx={centerX + 80} cy={baseY - 100} r={3} className="lobster-antenna__tip" />

      {/* 左短触角 */}
      <path
        d={`M ${centerX - 15} ${baseY + 5} Q ${centerX - 30} ${baseY - 20} ${centerX - 40} ${baseY - 35}`}
        className="lobster-antenna lobster-antenna--short"
      />

      {/* 右短触角 */}
      <path
        d={`M ${centerX + 15} ${baseY + 5} Q ${centerX + 30} ${baseY - 20} ${centerX + 40} ${baseY - 35}`}
        className="lobster-antenna lobster-antenna--short"
      />
    </g>
  );
};

// 龙虾钳子组件
export const LobsterClaw: React.FC<LobsterClawProps> = ({
  x,
  y,
  isLeft,
  isPointing,
  pointTarget,
}) => {
  const variants = isLeft ? leftClawVariants : rightClawVariants;
  const state = isPointing ? (isLeft ? 'holding' : 'point') : 'idle';

  return (
    <motion.g
      className="lobster-claw"
      initial="idle"
      animate={state}
      variants={variants}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {/* 钳子臂 */}
      <path
        d={isLeft
          ? `M ${x} ${y} Q ${x - 20} ${y - 30} ${x - 10} ${y - 60}`
          : `M ${x} ${y} Q ${x + 20} ${y - 30} ${x + 10} ${y - 60}`
        }
        className="lobster-claw__main"
        fill="none"
        strokeWidth={12}
        strokeLinecap="round"
      />

      {/* 钳子主体 */}
      <g transform={`translate(${isLeft ? x - 25 : x + 25}, ${y - 75})`}>
        {/* 上钳 */}
        <path
          d="M 0 0 C 15 -10 35 -5 40 15 C 42 25 35 35 25 30 C 15 25 5 20 0 15 Z"
          className="lobster-claw__pincer"
          transform={isLeft ? 'scale(-1, 1) translate(-40, 0)' : ''}
        />
        {/* 下钳 */}
        <path
          d="M 0 20 C 15 30 35 25 40 5 C 42 -5 35 -15 25 -10 C 15 -5 5 0 0 5 Z"
          className="lobster-claw__pincer"
          transform={isLeft ? 'scale(-1, 1) translate(-40, 0)' : ''}
        />
        {/* 高光 */}
        <path
          d="M 10 5 Q 20 2 30 8"
          className="lobster-claw__highlight"
          transform={isLeft ? 'scale(-1, 1) translate(-40, 0)' : ''}
        />
      </g>
    </motion.g>
  );
};

// 龙虾腿部组件
export const LobsterLegs: React.FC<{ centerX: number; centerY: number }> = ({
  centerX,
  centerY,
}) => {
  const legs = [
    { x: -45, y: -30, angle: -30 },
    { x: -50, y: 0, angle: -10 },
    { x: -50, y: 30, angle: 10 },
    { x: 45, y: -30, angle: 30 },
    { x: 50, y: 0, angle: 10 },
    { x: 50, y: 30, angle: -10 },
  ];

  return (
    <g className="lobster-legs">
      {legs.map((leg, index) => {
        const startX = centerX + leg.x * 0.6;
        const startY = centerY + leg.y;
        const endX = centerX + leg.x + Math.cos((leg.angle * Math.PI) / 180) * 40;
        const endY = startY + Math.sin((leg.angle * Math.PI) / 180) * 40;

        return (
          <line
            key={index}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            className="lobster-leg"
          />
        );
      })}
    </g>
  );
};

// 龙虾尾巴组件
export const LobsterTail: React.FC<{ centerX: number; centerY: number; isAnimating: boolean }> = ({
  centerX,
  centerY,
  isAnimating,
}) => {
  const tailY = centerY + 75;

  return (
    <motion.g
      className="lobster-tail"
      initial="initial"
      animate={isAnimating ? 'animate' : 'initial'}
      variants={tailWagVariants}
      style={{ transformOrigin: `${centerX}px ${tailY}px` }}
    >
      {/* 尾节1 */}
      <ellipse
        cx={centerX}
        cy={tailY + 15}
        rx={45}
        ry={20}
        className="lobster-tail__segment"
      />
      {/* 尾节2 */}
      <ellipse
        cx={centerX}
        cy={tailY + 35}
        rx={35}
        ry={18}
        className="lobster-tail__segment"
      />
      {/* 尾节3 */}
      <ellipse
        cx={centerX}
        cy={tailY + 52}
        rx={25}
        ry={15}
        className="lobster-tail__segment"
      />
      {/* 尾扇 */}
      <path
        d={`M ${centerX - 30} ${tailY + 65} Q ${centerX} ${tailY + 85} ${centerX + 30} ${tailY + 65} Q ${centerX} ${tailY + 75} ${centerX - 30} ${tailY + 65} Z`}
        className="lobster-tail__fan"
      />
    </motion.g>
  );
};

// 平板组件
export const Tablet: React.FC<TabletProps> = ({
  x,
  y,
  width,
  height,
  isFloating,
}) => {
  return (
    <motion.g
      className="lobster-tablet"
      initial="initial"
      animate={isFloating ? 'animate' : 'initial'}
      variants={tabletFloatVariants}
    >
      {/* 平板主体 */}
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={6}
        className="lobster-tablet__body"
      />

      {/* 屏幕 */}
      <rect
        x={x - width / 2 + 4}
        y={y - height / 2 + 4}
        width={width - 8}
        height={height - 16}
        rx={3}
        className="lobster-tablet__screen"
      />

      {/* 屏幕内容 - 模拟代码/公式 */}
      <text x={x - width / 2 + 8} y={y - height / 2 + 15} className="lobster-tablet__content">
        {'{...}'}
      </text>
      <line
        x1={x - width / 2 + 8}
        y1={y - height / 2 + 22}
        x2={x + width / 2 - 8}
        y2={y - height / 2 + 22}
        stroke="#00FF88"
        strokeWidth={1}
        opacity={0.5}
      />
      <text x={x - width / 2 + 8} y={y - height / 2 + 32} className="lobster-tablet__content" fontSize={4}>
        f(x) = ?
      </text>

      {/* Home按钮 */}
      <circle
        cx={x}
        cy={y + height / 2 - 6}
        r={3}
        className="lobster-tablet__button"
      />
    </motion.g>
  );
};