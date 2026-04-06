// 技能雷达图组件

import React, { useState, useEffect, useRef } from 'react';
import { SkillData } from '../types';

interface SkillRadarChartProps {
  skills: SkillData[];
}

const AnimatedProgressBar: React.FC<{
  value: number;
  maxValue: number;
  color: string;
  height?: number;
  delay?: number;
}> = ({ value, maxValue, color, height = 12, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const targetWidth = (value / maxValue) * 100;
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      const timer = setTimeout(() => setWidth(targetWidth), delay);
      return () => clearTimeout(timer);
    } else {
      setWidth(targetWidth);
    }
  }, [value, maxValue, delay]);

  return (
    <div className="bg-[#e5e0d8] rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
};

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ skills }) => {
  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
      <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
        🎯 技能掌握度
      </h3>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="font-[var(--font-hand-body)] text-sm font-medium">{skill.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-[var(--font-hand-heading)] text-sm font-bold text-[#ff4d4d]">
                  {skill.level}%
                </span>
                <span className="font-[var(--font-hand-body)] text-xs text-[#2d5da1]">
                  / {skill.target}%
                </span>
              </div>
            </div>
            <AnimatedProgressBar value={skill.level} maxValue={100} color="#ff4d4d" height={10} delay={index * 200} />
            <div className="h-[6px] mt-1 relative">
              <div
                className="absolute top-0 left-0 h-full rounded-full opacity-40"
                style={{
                  width: `${skill.target}%`,
                  background: 'repeating-linear-gradient(90deg, #2d5da1 0px, #2d5da1 4px, transparent 4px, transparent 8px)',
                }}
              />
            </div>
            {skill.level < skill.target && (
              <div className="mt-1">
                <span className="text-[10px] font-[var(--font-hand-body)] text-[#666]">
                  还需 {skill.target - skill.level}% 达成目标
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
