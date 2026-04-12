import React, { useEffect, useState, useMemo } from 'react';
import { CoreNode } from './CoreNode';
import { OrbitRing } from './OrbitRing';
import { OrbitParticles } from './OrbitParticles';
import { ToolOrbiter } from './ToolOrbiter';
import { ThinkingStatus } from './ThinkingStatus';
import { ProgressBar } from './ProgressBar';
import { TaskList } from './TaskList';
import { getSketchBorderStyle } from '../utils/styles';
import type { ThinkingAnimationProps, AnimationState } from '../types';

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({
  isActive,
  currentStep,
  toolCalls,
  onComplete,
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [currentToolIndex, setCurrentToolIndex] = useState<number>(-1);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [progress, setProgress] = useState(0);

  // 使用 useMemo 避免抖动
  const containerRotation = useMemo(() => -0.5 + Math.random() * 1, []);

  useEffect(() => {
    if (!isActive) {
      setAnimationState('idle');
      setCurrentToolIndex(-1);
      setProgress(0);
      return;
    }

    setAnimationState('thinking');
  }, [isActive]);

  useEffect(() => {
    if (toolCalls.length === 0) return;

    const lastTool = toolCalls[toolCalls.length - 1];
    setCurrentToolIndex(toolCalls.length - 1);

    if (lastTool.status === 'running') {
      setAnimationState('tool_calling');
    } else if (lastTool.status === 'completed') {
      setAnimationState('processing');
    }

    // 更新进度
    const completedTools = toolCalls.filter(t => t.status === 'completed').length;
    const newProgress = toolCalls.length > 0 ? (completedTools / toolCalls.length) * 100 : 0;
    setProgress(newProgress);
  }, [toolCalls]);

  useEffect(() => {
    if (!isActive) return;

    let animationId: number;
    const animate = () => {
      setOrbitAngle((prev) => (prev + 0.3) % 360);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isActive]);

  const getToolAngle = (index: number): number => {
    const baseAngle = (360 / Math.max(toolCalls.length, 4)) * index;
    return baseAngle + orbitAngle;
  };

  if (!isActive) return null;

  return (
    <div className="w-full animate-fade-in">
      {/* 主视觉区域 - 更大更大气 */}
      <div
        className="relative mx-auto rounded-2xl overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 600,
          height: 320,
          backgroundColor: 'white',
          ...getSketchBorderStyle(3),
          transform: `rotate(${containerRotation}deg)`,
        }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
        </div>

        {/* 主动画区域 */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 轨道环 */}
          <OrbitRing isActive={isActive} size={280} />

          {/* 粒子效果 */}
          <OrbitParticles isActive={isActive} count={8} radius={140} />

          {/* 中心核心 */}
          <CoreNode isActive={isActive} size={64} />

          {/* 工具轨道器 */}
          {toolCalls.map((tool, index) => (
            <ToolOrbiter
              key={`${tool.toolName}-${index}`}
              tool={tool}
              angle={getToolAngle(index)}
              isHighlighted={index === currentToolIndex && animationState === 'tool_calling'}
              orbitRadius={140}
            />
          ))}
        </div>

        {/* 进度条 - 底部 */}
        <div className="absolute bottom-0 left-0 right-0">
          <ProgressBar progress={progress} toolCalls={toolCalls} />
        </div>
      </div>

      {/* 状态显示 */}
      <ThinkingStatus state={animationState} stepCount={currentStep} />

      {/* 任务清单 */}
      <TaskList toolCalls={toolCalls} currentToolIndex={currentToolIndex} />
    </div>
  );
};
