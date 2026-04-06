// 趋势头部组件

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendHeaderProps {
  trendDirection: 'up' | 'down';
}

export const TrendHeader: React.FC<TrendHeaderProps> = ({ trendDirection }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 
        className="text-lg font-bold text-[#2d2d2d]"
        style={{ fontFamily: 'var(--font-hand-heading)' }}
      >
        📈 学习趋势
      </h3>
      <div className="flex items-center gap-2">
        <span 
          className="text-sm text-[#666]"
          style={{ fontFamily: 'var(--font-hand-body)' }}
        >
          整体趋势
        </span>
        {trendDirection === 'up' ? (
          <TrendingUp className="w-5 h-5 text-green-500" />
        ) : (
          <TrendingDown className="w-5 h-5 text-orange-500" />
        )}
      </div>
    </div>
  );
};
