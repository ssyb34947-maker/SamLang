// 活动热力图组件

import React from 'react';
import { ActivityDataPoint } from '../types';

interface ActivityHeatmapProps {
  data: ActivityDataPoint[];
}

const colors = ['#e5e0d8', '#ffcccc', '#ff9999', '#ff6666', '#ff4d4d'];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  const recentData = data.slice(-28);

  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
      <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
        🔥 学习活跃度
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {recentData.map((day, index) => (
          <div
            key={index}
            className="aspect-square rounded transition-all hover:scale-110"
            style={{ backgroundColor: colors[day.level] }}
            title={`${day.date}: ${day.count}小时`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs font-[var(--font-hand-body)]">
        <span>少</span>
        {colors.map((color, i) => (
          <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
};
