import React from 'react';
import { CLI_COLORS } from '../constants';

interface BootProgressProps {
  progress: number;
}

export const BootProgress: React.FC<BootProgressProps> = ({ progress }) => {
  return (
    <div className="mt-4">
      <div
        className="flex justify-between text-xs mb-1"
        style={{ color: CLI_COLORS.textMuted }}
      >
        <span>
          [{progress === 100 ? 'OK' : 'PROGRESS'}] Initializing...
        </span>
        <span>{progress}%</span>
      </div>
      <div style={{ color: CLI_COLORS.accent }}>
        {'['}
        {Array.from({ length: 30 }).map((_, i) => {
          const filled = Math.floor((progress / 100) * 30);
          if (i < filled) return <span key={i}>=</span>;
          if (i === filled) {
            return (
              <span key={i} className="animate-pulse">
                &gt;
              </span>
            );
          }
          return (
            <span key={i} style={{ color: CLI_COLORS.border }}>
              -
            </span>
          );
        })}
        {']'}
      </div>
    </div>
  );
};

export default BootProgress;
