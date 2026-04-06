// 学习看板主入口组件

import React, { useState } from 'react';
import { TimeRange, JournalEntry } from './types';
import { useStudyStats, useJournal, useAIAnalysis } from './hooks';
import {
  LearningTrend,
  TimeRangeSelector,
  OverviewCards,
  SkillRadarChart,
  ActivityHeatmap,
  TopicDistribution,
} from './components';
import { DashboardTab } from './tabs/DashboardTab';
import { JournalTab } from './tabs/JournalTab';
import { InsightsTab } from './tabs/InsightsTab';

type TabType = 'dashboard' | 'journal' | 'insights';

const tabs = [
  { id: 'dashboard' as TabType, label: '数据看板', icon: '📊' },
  { id: 'journal' as TabType, label: '学习日记', icon: '📝' },
  { id: 'insights' as TabType, label: 'AI 洞察', icon: '🤖' },
];

export const StudyRecords: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const { stats, loading: statsLoading } = useStudyStats(timeRange);
  const journalState = useJournal();
  const { analysis, loading: analysisLoading } = useAIAnalysis(timeRange);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* 标签页导航 */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-[var(--font-hand-heading)] text-base border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] transition-all ${activeTab === tab.id
                ? 'bg-[#ff4d4d] text-white shadow-[var(--shadow-hard)]'
                : 'bg-white text-[#2d2d2d] hover:bg-[#fdfbf7] shadow-[var(--shadow-hard)] hover:shadow-[var(--shadow-hover)] hover:translate-x-[2px] hover:translate-y-[2px]'
              }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <DashboardTab
          stats={stats}
          isLoading={statsLoading}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      )}

      {activeTab === 'journal' && <JournalTab {...journalState} />}

      {activeTab === 'insights' && (
        <InsightsTab analysis={analysis} isLoading={analysisLoading} />
      )}
    </div>
  );
};

export default StudyRecords;
