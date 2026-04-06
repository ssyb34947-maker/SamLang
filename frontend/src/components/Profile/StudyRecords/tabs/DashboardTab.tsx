// 数据看板标签页

import React from 'react';
import { StudyStats, TimeRange } from '../types';
import {
  TimeRangeSelector,
  OverviewCards,
  LearningTrend,
  SkillRadarChart,
  ActivityHeatmap,
  TopicDistribution,
} from '../components';

interface DashboardTabProps {
  stats: StudyStats | null;
  isLoading: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  stats,
  isLoading,
  timeRange,
  onTimeRangeChange,
}) => {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
      </div>

      <OverviewCards stats={stats} isLoading={isLoading} />

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LearningTrend data={stats.trend} isLoading={isLoading} />
          <SkillRadarChart skills={stats.skills} />
          <ActivityHeatmap data={stats.activity} />
          <TopicDistribution topics={stats.topics} />
        </div>
      )}
    </div>
  );
};
