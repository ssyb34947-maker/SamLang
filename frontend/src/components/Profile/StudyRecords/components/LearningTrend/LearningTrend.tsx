// 学习趋势组件 - 集成手绘折线图

import React from 'react';
import { TrendDataPoint } from '../../types';
import { SketchLineChart } from '../SketchLineChart';
import { TrendHeader } from './TrendHeader';
import { TrendStats } from './TrendStats';

interface LearningTrendProps {
  data: TrendDataPoint[];
  isLoading?: boolean;
}

export const LearningTrend: React.FC<LearningTrendProps> = ({ data, isLoading }) => {
  const hours = data.map((d) => d.hours);
  const labels = data.map((d) => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const totalHours = hours.reduce((a, b) => a + b, 0);
  const avgHours = totalHours / hours.length;
  const maxHours = Math.max(...hours);
  const trendDirection = hours[hours.length - 1] > hours[0] ? 'up' : 'down';

  if (isLoading) {
    return (
      <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-[200px] bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
      <TrendHeader trendDirection={trendDirection} />
      
      <div className="relative">
        <SketchLineChart
          data={hours}
          labels={labels}
          width={500}
          height={220}
          color="#ff4d4d"
          showArea={true}
          showGrid={true}
          animationDuration={2500}
          strokeWidth={2.5}
          roughness={1.2}
        />
      </div>

      <TrendStats
        totalHours={totalHours}
        avgHours={avgHours}
        maxHours={maxHours}
        dataCount={data.length}
      />
    </div>
  );
};

export default LearningTrend;
