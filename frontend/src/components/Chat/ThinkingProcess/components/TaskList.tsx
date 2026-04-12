import React from 'react';
import { CheckCircle2, Circle, Loader2, Clock } from 'lucide-react';
import { getToolIconConfig } from '../constants';
import type { ToolCallInfo } from '../types';

interface TaskListProps {
  toolCalls: ToolCallInfo[];
  currentToolIndex: number;
}

export const TaskList: React.FC<TaskListProps> = ({ toolCalls, currentToolIndex }) => {
  if (toolCalls.length === 0) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={16} />
          <span className="text-sm" style={{ fontFamily: 'var(--font-hand-body)' }}>
            准备中...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 px-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-hand-body)' }}>
          执行队列
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="space-y-1.5">
        {toolCalls.map((tool, index) => {
          const config = getToolIconConfig(tool.toolName);
          const Icon = config.icon;
          const isCurrent = index === currentToolIndex;
          const isCompleted = tool.status === 'completed';
          const isRunning = tool.status === 'running';

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-indigo-50 border-2 border-indigo-200 shadow-sm'
                  : isCompleted
                  ? 'bg-gray-50 border border-gray-200'
                  : 'bg-white border border-gray-100'
              }`}
              style={{
                transform: isCurrent ? 'translateX(8px)' : 'translateX(0)',
                fontFamily: 'var(--font-hand-body)',
              }}
            >
              {/* 状态图标 */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-green-600" />
                  </div>
                ) : isRunning ? (
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <Loader2 size={14} className="text-amber-600 animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <Circle size={14} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* 工具图标 */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <Icon size={16} style={{ color: config.color }} />
              </div>

              {/* 工具信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm truncate ${
                    isCurrent ? 'text-indigo-900' : isCompleted ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {config.label}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-indigo-500 animate-pulse">
                      执行中...
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 truncate block">
                  {tool.toolName}
                </span>
              </div>

              {/* 耗时 */}
              {tool.durationMs && (
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {tool.durationMs < 1000
                    ? `${tool.durationMs}ms`
                    : `${(tool.durationMs / 1000).toFixed(1)}s`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 总结 */}
      {toolCalls.length > 0 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-gray-400">
          <span style={{ fontFamily: 'var(--font-hand-body)' }}>
            共 {toolCalls.length} 个任务
          </span>
          <span>
            {toolCalls.filter(t => t.status === 'completed').length} 已完成
          </span>
        </div>
      )}
    </div>
  );
};
