/**
 * 统计卡片组件
 */

import { Users, Activity, UserPlus, TrendingUp, BarChart3, Repeat } from 'lucide-react';
import type { StatCardConfig } from '../constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Activity,
  UserPlus,
  TrendingUp,
  BarChart3,
  Repeat,
};

interface StatCardProps {
  config: StatCardConfig;
  value: number;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ config, value, trend }) => {
  const Icon = iconMap[config.icon] || Users;

  const formatValue = (val: number): string => {
    if (val >= 10000) {
      return (val / 10000).toFixed(1) + 'w';
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'k';
    }
    return val.toString();
  };

  return (
    <div
      className="relative p-5 transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: 'white',
        border: '3px solid var(--sketch-border)',
        borderRadius: 'var(--wobbly)',
        boxShadow: 'var(--shadow-hard)',
      }}
    >
      {/* 图标 */}
      <div
        className="absolute -top-3 -right-3 w-12 h-12 flex items-center justify-center"
        style={{
          backgroundColor: config.color,
          border: '3px solid var(--sketch-border)',
          borderRadius: 'var(--wobbly-sm)',
          boxShadow: 'var(--shadow-hard)',
          transform: 'rotate(12deg)',
        }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* 标题 */}
      <p
        className="text-sm mb-2"
        style={{
          fontFamily: 'var(--font-hand-body)',
          color: 'var(--sketch-pencil)',
        }}
      >
        {config.title}
      </p>

      {/* 数值 */}
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-bold"
          style={{
            fontFamily: 'var(--font-hand-heading)',
            color: 'var(--sketch-text)',
          }}
        >
          {formatValue(value)}
        </span>
        {config.unit && (
          <span
            className="text-sm"
            style={{
              fontFamily: 'var(--font-hand-body)',
              color: 'var(--sketch-pencil)',
            }}
          >
            {config.unit}
          </span>
        )}
      </div>

      {/* 趋势 */}
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className="text-xs"
            style={{
              color: trend >= 0 ? '#50C878' : '#D0021B',
              fontFamily: 'var(--font-hand-body)',
            }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span
            className="text-xs"
            style={{
              color: 'var(--sketch-pencil)',
              fontFamily: 'var(--font-hand-body)',
            }}
          >
            较昨日
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
