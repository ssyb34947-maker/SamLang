// 时间范围选择器组件

import React from 'react';
import { TimeRange } from '../types';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const ranges: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7天' },
  { value: '30d', label: '30天' },
  { value: '90d', label: '90天' },
  { value: '1y', label: '1年' },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-4 py-2 font-[var(--font-hand-body)] text-sm border-[3px] border-[#2d2d2d] rounded-[var(--wobbly-sm)] transition-all ${
            value === range.value
              ? 'bg-[#ff4d4d] text-white shadow-[var(--shadow-hard)]'
              : 'bg-white text-[#2d2d2d] hover:bg-[#fdfbf7]'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};
