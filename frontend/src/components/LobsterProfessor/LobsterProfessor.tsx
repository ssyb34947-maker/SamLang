/**
 * 龙虾教授主组件
 * 整合所有子组件，管理状态和动画
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LobsterProfessorProps,
  TeachingAction,
  Formula,
  TeachingState,
} from './types';
import {
  DIMENSIONS,
  MATH_FORMULAS,
  ANIMATION_TIMING,
  TEACHING_ACTIONS,
} from './constants';
import { entranceVariants } from './animations';
import {
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
import { Blackboard } from './Blackboard';
import './LobsterProfessor.css';

export const LobsterProfessor: React.FC<LobsterProfessorProps> = ({
  width = DIMENSIONS.canvasWidth,
  height = DIMENSIONS.canvasHeight,
  autoPlay = true,
  animationSpeed = 1,
  formulas = MATH_FORMULAS as Formula[],
  formulaInterval = ANIMATION_TIMING.formulaInterval,
  teachingAction: controlledAction,
  onActionChange,
  interactive = true,
  onClick,
  onFormulaClick,
  className = '',
  style,
}) => {
  // 状态管理
  const [teachingState, setTeachingState] = useState<TeachingState>({
    currentAction: 'explain',
    currentFormulaIndex: 0,
    isPointing: false,
    pointTarget: null,
  });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(autoPlay);

  // Refs
  const formulaTimerRef = useRef<NodeJS.Timeout | null>(null);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 计算中心点
  const centerX = width / 2;
  const centerY = height / 2 + 50;

  // 切换公式
  const nextFormula = useCallback(() => {
    setTeachingState((prev) => ({
      ...prev,
      currentFormulaIndex: (prev.currentFormulaIndex + 1) % formulas.length,
    }));
  }, [formulas.length]);

  // 执行教学动作
  const performAction = useCallback((action: TeachingAction) => {
    setTeachingState((prev) => {
      const newState = { ...prev, currentAction: action };

      switch (action) {
        case 'point':
          newState.isPointing = true;
          newState.pointTarget = TEACHING_ACTIONS.pointPositions[
            Math.floor(Math.random() * TEACHING_ACTIONS.pointPositions.length)
          ];
          break;
        case 'emphasize':
          newState.isPointing = true;
          newState.pointTarget = TEACHING_ACTIONS.pointPositions[0];
          break;
        case 'think':
          newState.isPointing = false;
          newState.pointTarget = null;
          break;
        default: // explain
          newState.isPointing = false;
          newState.pointTarget = null;
          break;
      }

      return newState;
    });

    onActionChange?.(action);

    // 动作持续时间后恢复
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current);
    }
    actionTimerRef.current = setTimeout(() => {
      setTeachingState((prev) => ({
        ...prev,
        currentAction: 'explain',
        isPointing: false,
        pointTarget: null,
      }));
    }, 2000 / animationSpeed);
  }, [animationSpeed, onActionChange]);

  // 眨眼逻辑
  const blink = useCallback(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), ANIMATION_TIMING.blinkDuration * 1000);
  }, []);

  // 自动动画循环
  useEffect(() => {
    if (!autoPlay) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);

    // 公式切换定时器
    formulaTimerRef.current = setInterval(() => {
      nextFormula();
    }, formulaInterval / animationSpeed);

    // 眨眼定时器
    const blinkLoop = () => {
      const nextBlink = Math.random() * 3000 + 2000;
      blinkTimerRef.current = setTimeout(() => {
        blink();
        blinkLoop();
      }, nextBlink / animationSpeed);
    };
    blinkLoop();

    // 随机教学动作
    const actionLoop = () => {
      const nextAction = Math.random() * 5000 + 3000;
      actionTimerRef.current = setTimeout(() => {
        const actions: TeachingAction[] = ['point', 'explain', 'think', 'emphasize'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        performAction(randomAction);
        actionLoop();
      }, nextAction / animationSpeed);
    };
    actionLoop();

    return () => {
      if (formulaTimerRef.current) clearInterval(formulaTimerRef.current);
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    };
  }, [autoPlay, animationSpeed, formulaInterval, nextFormula, blink, performAction]);

  // 受控动作更新
  useEffect(() => {
    if (controlledAction && controlledAction !== teachingState.currentAction) {
      performAction(controlledAction);
    }
  }, [controlledAction, performAction, teachingState.currentAction]);

  // 点击处理
  const handleClick = useCallback(() => {
    if (!interactive) return;

    // 触发强调动作
    performAction('emphasize');
    onClick?.();
  }, [interactive, performAction, onClick]);

  // 公式点击处理
  const handleFormulaClick = useCallback((formula: Formula) => {
    if (!interactive) return;
    onFormulaClick?.(formula);
  }, [interactive, onFormulaClick]);

  return (
    <motion.div
      className={`lobster-professor ${interactive ? 'lobster-professor--interactive' : ''} ${className}`}
      style={{ width, height, ...style }}
      initial="hidden"
      animate="visible"
      variants={entranceVariants}
      onClick={handleClick}
    >
      <svg
        className="lobster-canvas"
        width={width}
        height={height}
        viewBox={`0 0 ${DIMENSIONS.canvasWidth} ${DIMENSIONS.canvasHeight}`}
      >
        {/* 渐变定义 */}
        <LobsterGradients />

        {/* 黑板 - 在最底层 */}
        <Blackboard
          formulas={formulas}
          currentIndex={teachingState.currentFormulaIndex}
          width={DIMENSIONS.blackboardWidth}
          height={DIMENSIONS.blackboardHeight}
          x={DIMENSIONS.blackboardX}
          y={DIMENSIONS.blackboardY}
          onFormulaClick={handleFormulaClick}
        />

        {/* 龙虾身体 - 腿部在最底层 */}
        <LobsterLegs centerX={centerX} centerY={centerY} />

        {/* 尾巴 */}
        <LobsterTail
          centerX={centerX}
          centerY={centerY}
          isAnimating={isAnimating}
        />

        {/* 身体 */}
        <LobsterBody
          centerX={centerX}
          centerY={centerY}
          isAnimating={isAnimating}
        />

        {/* 头部 */}
        <LobsterHead centerX={centerX} centerY={centerY} />

        {/* 眼睛 */}
        <LobsterEyes
          centerX={centerX}
          centerY={centerY}
          isBlinking={isBlinking}
        />

        {/* 触角 */}
        <LobsterAntennae centerX={centerX} centerY={centerY} />

        {/* 左钳子 - 拿平板 */}
        <Tablet
          x={DIMENSIONS.tabletX}
          y={DIMENSIONS.tabletY}
          width={DIMENSIONS.tabletWidth}
          height={DIMENSIONS.tabletHeight}
          isFloating={isAnimating}
        />
        <LobsterClaw
          x={DIMENSIONS.leftClawX}
          y={DIMENSIONS.clawY}
          isLeft={true}
          isPointing={teachingState.isPointing}
          pointTarget={teachingState.pointTarget || undefined}
        />

        {/* 右钳子 - 指向黑板 */}
        <LobsterClaw
          x={DIMENSIONS.rightClawX}
          y={DIMENSIONS.clawY}
          isLeft={false}
          isPointing={teachingState.isPointing}
          pointTarget={teachingState.pointTarget || undefined}
        />
      </svg>
    </motion.div>
  );
};

export default LobsterProfessor;