// 趋势统计组件

import React from 'react';

interface TrendStatsProps {
  totalHours: number;
  avgHours: number;
  maxHours: number;
  dataCount: number;
}

export const TrendStats: React.FC<TrendStatsProps> = ({
  totalHours,
  avgHours,
  maxHours,
  dataCount,
}) => {
  const stats = [
    { label: '总计', value: `${totalHours.toFixed(1)}h`, color: '#ff4d4d' },
    { label: '平均', value: `${avgHours.toFixed(1)}h/天`, color: '#2d5da1' },
    { label: '最高', value: `${maxHours.toFixed(1)}h`, color: '#4caf50' },
    { label: '天数', value: `${dataCount}天`, color: '#ff9800' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t-2 border-dashed border-[#e5e0d8]">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p 
            className="text-xs text-[#666] mb-1"
            style={{ fontFamily: 'var(--font-hand-body)' }}
          >
            {stat.label}
          </p>
          <p 
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-hand-heading)', color: stat.color }}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};
