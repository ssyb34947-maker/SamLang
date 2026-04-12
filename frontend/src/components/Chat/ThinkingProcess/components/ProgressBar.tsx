import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { ToolCallInfo } from '../types';

interface ProgressBarProps {
  progress: number;
  toolCalls: ToolCallInfo[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, toolCalls }) => {
  const completedCount = toolCalls.filter(t => t.status === 'completed').length;
  const totalCount = toolCalls.length;

  return (
    <div className="px-6 pb-4 pt-2">
      {/* 进度信息 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600" style={{ fontFamily: 'var(--font-hand-body)' }}>
            执行进度
          </span>
          <span className="text-xs text-gray-400">
            {completedCount}/{totalCount} 工具
          </span>
        </div>
        <span className="text-xs font-bold text-indigo-600" style={{ fontFamily: 'var(--font-hand-body)' }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* 进度条背景 */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        {/* 进度条填充 */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* 闪光效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>

        {/* 刻度标记 */}
        {totalCount > 0 && (
          <div className="absolute inset-0 flex justify-between px-1">
            {Array.from({ length: totalCount + 1 }).map((_, i) => (
              <div
                key={i}
                className={`w-0.5 h-full transition-colors duration-300 ${
                  i <= completedCount ? 'bg-white/50' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 工具状态图标 */}
      {toolCalls.length > 0 && (
        <div className="flex items-center gap-1 mt-2">
          {toolCalls.map((tool, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-300"
              style={{
                backgroundColor: tool.status === 'completed' ? '#dbeafe' : '#f3f4f6',
                fontFamily: 'var(--font-hand-body)',
              }}
            >
              {tool.status === 'completed' ? (
                <CheckCircle2 size={12} className="text-blue-600" />
              ) : tool.status === 'running' ? (
                <Loader2 size={12} className="text-amber-500 animate-spin" />
              ) : (
                <Circle size={12} className="text-gray-400" />
              )}
              <span className={tool.status === 'completed' ? 'text-blue-700' : 'text-gray-600'}>
                {tool.toolName}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
