// 概览卡片组件

import React from 'react';
import { GaugeCard } from './GaugeCard';
import { StudyStats } from '../types';

interface OverviewCardsProps {
  stats: StudyStats | null;
  isLoading: boolean;
}

const cardConfigs = [
  {
    icon: '📅',
    title: '本周学习',
    getValue: (s: StudyStats) => s.weeklyHours,
    maxValue: 40,
    unit: 'h',
    getSubtext: (s: StudyStats) => `总计 ${s.totalHours} 小时`,
    color: '#ff4d4d',
  },
  {
    icon: '🎯',
    title: '掌握度',
    getValue: (s: StudyStats) => s.masteryRate,
    maxValue: 100,
    unit: '%',
    getSubtext: (s: StudyStats) => `${s.masteredPoints}/${s.knowledgePoints} 知识点`,
    color: '#2d5da1',
  },
  {
    icon: '🔥',
    title: '连续学习',
    getValue: (s: StudyStats) => s.streakDays,
    maxValue: 30,
    unit: '天',
    getSubtext: (s: StudyStats) => `最高纪录 ${s.maxStreak} 天`,
    color: '#ff9800',
  },
  {
    icon: '💬',
    title: '对话评分',
    getValue: (s: StudyStats) => s.avgRating * 20,
    maxValue: 100,
    unit: '%',
    getSubtext: (s: StudyStats) => `${s.weeklyConversations} 次本周对话`,
    color: '#4caf50',
  },
];

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cardConfigs.map((config, index) => (
        <GaugeCard
          key={index}
          icon={config.icon}
          title={config.title}
          value={stats ? config.getValue(stats) : 0}
          maxValue={config.maxValue}
          unit={config.unit}
          subtext={stats ? config.getSubtext(stats) : '加载中...'}
          color={config.color}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
