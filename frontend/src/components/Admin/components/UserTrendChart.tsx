/**
 * 用户趋势折线图组件
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TREND_TIME_RANGES } from '../constants';
import type { UserTrend } from '../types';

interface UserTrendChartProps {
  data: UserTrend | null;
  days: number;
  onDaysChange: (days: number) => void;
}

const UserTrendChart: React.FC<UserTrendChartProps> = ({
  data,
  days,
  onDaysChange,
}) => {
  const [activeLine, setActiveLine] = useState<'newUsers' | 'activeUsers'>('newUsers');

  if (!data) return null;

  const chartData = data.dates.map((date, index) => ({
    date,
    新增用户: data.newUsers[index],
    活跃用户: data.activeUsers[index],
  }));

  return (
    <div
      className="p-5"
      style={{
        backgroundColor: 'white',
        border: '3px solid var(--sketch-border)',
        borderRadius: 'var(--wobbly)',
        boxShadow: 'var(--shadow-hard)',
      }}
    >
      {/* 标题和时间选择 */}
      <div className="flex items-center justify-between mb-4">
        <h3
          style={{
            fontFamily: 'var(--font-hand-heading)',
            fontWeight: 700,
            color: 'var(--sketch-text)',
          }}
        >
          用户增长趋势
        </h3>
        <div className="flex gap-2">
          {TREND_TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => onDaysChange(range.value)}
              className="px-3 py-1 text-sm transition-all"
              style={{
                fontFamily: 'var(--font-hand-body)',
                backgroundColor: days === range.value ? 'var(--sketch-secondary)' : 'transparent',
                color: days === range.value ? 'white' : 'var(--sketch-text)',
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* 图表 */}
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fontFamily: 'var(--font-hand-body)' }}
              stroke="var(--sketch-border)"
            />
            <YAxis
              tick={{ fontSize: 12, fontFamily: 'var(--font-hand-body)' }}
              stroke="var(--sketch-border)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                fontFamily: 'var(--font-hand-body)',
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-hand-body)' }} />
            <Line
              type="monotone"
              dataKey="新增用户"
              stroke="#4A90E2"
              strokeWidth={3}
              dot={{ fill: '#4A90E2', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="活跃用户"
              stroke="#50C878"
              strokeWidth={3}
              dot={{ fill: '#50C878', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserTrendChart;
