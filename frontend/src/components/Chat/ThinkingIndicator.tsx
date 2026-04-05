import React from 'react';

/**
 * AI 思考中动画组件
 * 显示跳动的圆点和思考文字
 */
export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: 'var(--sketch-accent)',
            animationDelay: '0ms',
            animationDuration: '1s'
          }}
        />
        <span
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: 'var(--sketch-accent)',
            animationDelay: '200ms',
            animationDuration: '1s'
          }}
        />
        <span
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: 'var(--sketch-accent)',
            animationDelay: '400ms',
            animationDuration: '1s'
          }}
        />
      </div>
      <span
        className="text-sm ml-1"
        style={{
          fontFamily: 'var(--font-hand-body)',
          color: 'var(--sketch-pencil)'
        }}
      >
        山姆教授正在思考...
      </span>
    </div>
  );
};

export default ThinkingIndicator;
