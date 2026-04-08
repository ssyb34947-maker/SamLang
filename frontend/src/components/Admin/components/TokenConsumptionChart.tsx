/**
 * Token消耗折线图组件
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Coins } from 'lucide-react';

interface TokenData {
  dates: string[];
  inputTokens: number[];
  outputTokens: number[];
  totalTokens: number[];
}

interface TokenConsumptionChartProps {
  data: TokenData | null;
  days: number;
  onDaysChange: (days: number) => void;
}

const TIME_RANGES = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
] as const;

const TokenConsumptionChart: React.FC<TokenConsumptionChartProps> = ({
  data,
  days,
  onDaysChange,
}) => {
  if (!data) return null;

  const chartData = data.dates.map((date, index) => ({
    date,
    输入Token: data.inputTokens[index],
    输出Token: data.outputTokens[index],
    总消耗: data.totalTokens[index],
  }));

  const totalConsumption = data.totalTokens.reduce((a, b) => a + b, 0);
  const avgDaily = Math.round(totalConsumption / data.totalTokens.length);

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
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5" style={{ color: '#D0021B' }} />
          <h3
            style={{
              fontFamily: 'var(--font-hand-heading)',
              fontWeight: 700,
              color: 'var(--sketch-text)',
            }}
          >
            Token消耗统计
          </h3>
        </div>
        <div className="flex gap-2">
          {TIME_RANGES.map((range) => (
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

      {/* 统计摘要 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div
          className="p-3 text-center"
          style={{
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            border: '2px solid #4A90E2',
            borderRadius: 'var(--wobbly-sm)',
          }}
        >
          <p className="text-xs" style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}>
            总消耗
          </p>
          <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-hand-heading)', color: '#4A90E2' }}>
            {(totalConsumption / 1000).toFixed(1)}K
          </p>
        </div>
        <div
          className="p-3 text-center"
          style={{
            backgroundColor: 'rgba(80, 200, 120, 0.1)',
            border: '2px solid #50C878',
            borderRadius: 'var(--wobbly-sm)',
          }}
        >
          <p className="text-xs" style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}>
            日均消耗
          </p>
          <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-hand-heading)', color: '#50C878' }}>
            {(avgDaily / 1000).toFixed(1)}K
          </p>
        </div>
        <div
          className="p-3 text-center"
          style={{
            backgroundColor: 'rgba(245, 166, 35, 0.1)',
            border: '2px solid #F5A623',
            borderRadius: 'var(--wobbly-sm)',
          }}
        >
          <p className="text-xs" style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}>
            输入/输出比
          </p>
          <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-hand-heading)', color: '#F5A623' }}>
            {(
              data.inputTokens.reduce((a, b) => a + b, 0) /
              data.outputTokens.reduce((a, b) => a + b, 0)
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {/* 图表 */}
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fontFamily: 'var(--font-hand-body)' }}
              stroke="var(--sketch-border)"
            />
            <YAxis
              tick={{ fontSize: 12, fontFamily: 'var(--font-hand-body)' }}
              stroke="var(--sketch-border)"
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                fontFamily: 'var(--font-hand-body)',
              }}
              formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, '']}
            />
            <Area
              type="monotone"
              dataKey="输入Token"
              stackId="1"
              stroke="#4A90E2"
              fill="#4A90E2"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="输出Token"
              stackId="1"
              stroke="#50C878"
              fill="#50C878"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TokenConsumptionChart;
