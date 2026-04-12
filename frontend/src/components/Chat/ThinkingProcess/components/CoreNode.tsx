import React from 'react';
import { Sparkles } from 'lucide-react';
import { getSketchBorderStyle } from '../utils/styles';

interface CoreNodeProps {
  isActive: boolean;
  size?: number;
}

export const CoreNode: React.FC<CoreNodeProps> = ({ isActive, size = 48 }) => {
  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive ? 'scale-110' : 'scale-100'
      }`}
      style={{
        width: size,
        height: size,
        backgroundColor: 'white',
        ...getSketchBorderStyle(3, 'var(--sketch-accent)'),
        boxShadow: isActive
          ? '0 0 20px rgba(99, 102, 241, 0.5), var(--shadow-hard)'
          : 'var(--shadow-hard)',
      }}
    >
      <div
        className={`transition-all duration-500 ${isActive ? 'animate-pulse' : ''}`}
      >
        <Sparkles
          size={size * 0.5}
          style={{ color: 'var(--sketch-accent)' }}
        />
      </div>

      {isActive && (
        <>
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: 'var(--sketch-accent)' }}
          />
          <div
            className="absolute -inset-2 rounded-full animate-pulse opacity-10"
            style={{
              backgroundColor: 'var(--sketch-accent)',
              animationDuration: '2s',
            }}
          />
        </>
      )}
    </div>
  );
};
