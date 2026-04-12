import React from 'react';
import { getToolIconConfig } from '../constants';
import { getSketchBorderStyle } from '../utils/styles';
import type { ToolCallInfo } from '../types';

interface ToolOrbiterProps {
  tool: ToolCallInfo;
  angle: number;
  isHighlighted: boolean;
  orbitRadius?: number;
}

export const ToolOrbiter: React.FC<ToolOrbiterProps> = ({
  tool,
  angle,
  isHighlighted,
  orbitRadius = 140,
}) => {
  const config = getToolIconConfig(tool.toolName);
  const Icon = config.icon;

  // 椭圆轨道计算
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * orbitRadius;
  const y = Math.sin(rad) * (orbitRadius * 0.5);

  return (
    <div
      className={`absolute left-1/2 top-1/2 transition-all duration-500 ${
        isHighlighted ? 'scale-130 z-20' : 'scale-100 z-10'
      }`}
      style={{
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
    >
      <div className="relative flex flex-col items-center gap-2">
        {/* 工具图标 */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isHighlighted ? 'animate-bounce' : ''
          }`}
          style={{
            backgroundColor: isHighlighted ? config.color : 'white',
            ...getSketchBorderStyle(2, config.color),
            boxShadow: isHighlighted
              ? `0 0 20px ${config.color}60, var(--shadow-hard)`
              : 'var(--shadow-soft)',
          }}
        >
          <Icon
            size={22}
            style={{ color: isHighlighted ? 'white' : config.color }}
          />
        </div>

        {/* 工具名称标签 */}
        {isHighlighted && (
          <div
            className="absolute -bottom-8 whitespace-nowrap px-3 py-1 text-xs rounded-full animate-fade-in"
            style={{
              backgroundColor: config.color,
              color: 'white',
              fontFamily: 'var(--font-hand-body)',
              ...getSketchBorderStyle(1, 'white'),
            }}
          >
            {config.label}
          </div>
        )}

        {/* 完成标记 */}
        {tool.status === 'completed' && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center animate-scale-in"
            style={{
              backgroundColor: '#10b981',
              ...getSketchBorderStyle(1.5, 'white'),
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1 5L4 8L9 2"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* 运行中指示器 */}
        {tool.status === 'running' && isHighlighted && (
          <div
            className="absolute -inset-2 rounded-xl animate-ping opacity-20"
            style={{ backgroundColor: config.color }}
          />
        )}
      </div>
    </div>
  );
};
