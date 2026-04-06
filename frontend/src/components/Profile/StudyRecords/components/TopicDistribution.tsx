// 主题分布组件

import React from 'react';
import { TopicDistribution as TopicType } from '../types';

interface TopicDistributionProps {
  topics: TopicType[];
}

export const TopicDistribution: React.FC<TopicDistributionProps> = ({ topics }) => {
  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
      <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
        📊 学习主题分布
      </h3>
      <div className="space-y-2">
        {topics.map((topic, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: topic.color || '#ff4d4d' }}
            />
            <span className="flex-1 font-[var(--font-hand-body)] text-sm">{topic.name}</span>
            <span className="font-[var(--font-hand-body)] text-sm text-[#666]">{topic.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
