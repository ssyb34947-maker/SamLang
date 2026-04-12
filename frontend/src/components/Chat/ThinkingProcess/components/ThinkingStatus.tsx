import React from 'react';
import { Brain, Cpu, Sparkles } from 'lucide-react';
import type { AnimationState } from '../types';

interface ThinkingStatusProps {
  state: AnimationState;
  stepCount: number;
}

const STATUS_CONFIG: Record<AnimationState, { icon: typeof Brain; text: string; color: string }> = {
  idle: { icon: Sparkles, text: '准备就绪', color: 'var(--sketch-pencil)' },
  thinking: { icon: Brain, text: '深度思考中', color: 'var(--sketch-accent)' },
  tool_calling: { icon: Cpu, text: '调用工具', color: '#3b82f6' },
  processing: { icon: Cpu, text: '处理结果', color: '#10b981' },
  completing: { icon: Sparkles, text: '生成答案', color: '#f59e0b' },
};

export const ThinkingStatus: React.FC<ThinkingStatusProps> = ({
  state,
  stepCount,
}) => {
  const config = STATUS_CONFIG[state];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center animate-pulse"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon size={14} style={{ color: config.color }} />
        </div>
        <span
          className="text-sm font-medium animate-fade-in"
          style={{
            color: config.color,
            fontFamily: 'var(--font-hand-body)',
          }}
        >
          {config.text}
        </span>
        {stepCount > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--sketch-paper)',
              color: 'var(--sketch-pencil)',
              fontFamily: 'var(--font-hand-body)',
              border: '1px solid var(--sketch-border)',
            }}
          >
            步骤 {stepCount}
          </span>
        )}
      </div>

      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              backgroundColor: config.color,
              animationDelay: `${i * 150}ms`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
    </div>
  );
};
