// 学习看板主入口组件

import React, { useState, useEffect, useRef } from 'react';
import { TimeRange, JournalEntry } from './types';
import { useStudyStats, useJournal, useAIAnalysis } from './hooks';
import { GaugeCard } from './components/GaugeCard';

// 标签页类型
type TabType = 'dashboard' | 'journal' | 'insights';

// 时间范围选择器组件
const TimeRangeSelector: React.FC<{
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}> = ({ value, onChange }) => {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' },
    { value: '90d', label: '90天' },
    { value: '1y', label: '1年' },
  ];

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

// 概览卡片组件 - 使用仪表板设计
const OverviewCards: React.FC<{ stats: any; isLoading: boolean }> = ({ stats, isLoading }) => {
  // 卡片配置 - 常驻显示，不依赖 stats
  const cards = [
    {
      icon: '📅',
      title: '本周学习',
      value: stats?.weeklyHours ?? 0,
      maxValue: 40, // 假设每周目标40小时
      unit: 'h',
      subtext: stats ? `总计 ${stats.totalHours} 小时` : '加载中...',
      color: '#ff4d4d',
    },
    {
      icon: '🎯',
      title: '掌握度',
      value: stats?.masteryRate ?? 0,
      maxValue: 100,
      unit: '%',
      subtext: stats ? `${stats.masteredPoints}/${stats.knowledgePoints} 知识点` : '加载中...',
      color: '#2d5da1',
    },
    {
      icon: '🔥',
      title: '连续学习',
      value: stats?.streakDays ?? 0,
      maxValue: 30, // 假设最高30天
      unit: '天',
      subtext: stats ? `最高纪录 ${stats.maxStreak} 天` : '加载中...',
      color: '#ff9800',
    },
    {
      icon: '💬',
      title: '对话评分',
      value: stats ? stats.avgRating * 20 : 0, // 5分制转百分比
      maxValue: 100,
      unit: '%',
      subtext: stats ? `${stats.weeklyConversations} 次本周对话` : '加载中...',
      color: '#4caf50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <GaugeCard
          key={index}
          icon={card.icon}
          title={card.title}
          value={card.value}
          maxValue={card.maxValue}
          unit={card.unit}
          subtext={card.subtext}
          color={card.color}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

// 学习趋势图表组件
const LearningTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
      <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
        📈 学习趋势
      </h3>
      <div className="h-[200px] flex items-end justify-between gap-1">
        {data.slice(-14).map((point, index) => {
          const height = Math.min((point.hours / 5) * 100, 100);
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-[#ff4d4d] rounded-t transition-all hover:bg-[#ff6666]"
                style={{ height: `${height}%` }}
                title={`${point.date}: ${point.hours}小时`}
              />
              <span className="text-[10px] text-[#666] mt-1 font-[var(--font-hand-body)]">
                {point.date.slice(-2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 简化的动画进度条 - 使用 CSS transition，避免 JS 动画循环
const AnimatedProgressBar: React.FC<{
  value: number;
  maxValue: number;
  color: string;
  height?: number;
  delay?: number;
}> = ({ value, maxValue, color, height = 12, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const targetWidth = (value / maxValue) * 100;
    
    if (!hasAnimated.current) {
      // 首次渲染：延迟后触发动画
      hasAnimated.current = true;
      const timer = setTimeout(() => {
        setWidth(targetWidth);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // 后续更新：直接设置值
      setWidth(targetWidth);
    }
  }, [value, maxValue, delay]);

  return (
    <div 
      className="bg-[#e5e0d8] rounded-full overflow-hidden"
      style={{ height }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
};

// 技能雷达图组件（带动画版）
const SkillRadarChart: React.FC<{ skills: any[] }> = ({ skills }) => {
  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
      <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
        🎯 技能掌握度
      </h3>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="relative">
            <div className="flex justify-between mb-2">
              <span className="font-[var(--font-hand-body)] text-sm font-medium">{skill.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-[var(--font-hand-heading)] text-sm font-bold text-[#ff4d4d]">
                  {skill.level}%
                </span>
                <span className="font-[var(--font-hand-body)] text-xs text-[#2d5da1]">
                  / {skill.target}%
                </span>
              </div>
            </div>
            
            {/* 当前进度条 */}
            <AnimatedProgressBar
              value={skill.level}
              maxValue={100}
              color="#ff4d4d"
              height={10}
              delay={index * 200} // 错开动画时间
            />
            
            {/* 目标进度条（虚线效果） */}
            <div className="h-[6px] mt-1 relative">
              <div 
                className="absolute top-0 left-0 h-full rounded-full opacity-40"
                style={{ 
                  width: `${skill.target}%`,
                  background: 'repeating-linear-gradient(90deg, #2d5da1 0px, #2d5da1 4px, transparent 4px, transparent 8px)',
                }}
              />
            </div>
            
            {/* 差距指示 */}
            {skill.level < skill.target && (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-[10px] font-[var(--font-hand-body)] text-[#666]">
                  还需 {skill.target - skill.level}% 达成目标
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 活动热力图组件（简化版）
const ActivityHeatmap: React.FC<{ data: any[] }> = ({ data }) => {
  const recentData = data.slice(-28); // 最近28天
  
  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
      <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
        🔥 学习活跃度
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {recentData.map((day, index) => {
          const colors = ['#e5e0d8', '#ffcccc', '#ff9999', '#ff6666', '#ff4d4d'];
          return (
            <div
              key={index}
              className="aspect-square rounded transition-all hover:scale-110"
              style={{ backgroundColor: colors[day.level] }}
              title={`${day.date}: ${day.count}小时`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs font-[var(--font-hand-body)]">
        <span>少</span>
        {['#e5e0d8', '#ffcccc', '#ff9999', '#ff6666', '#ff4d4d'].map((color, i) => (
          <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
};

// 主题分布组件
const TopicDistribution: React.FC<{ topics: any[] }> = ({ topics }) => {
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

// 日记编辑器组件
const JournalEditor: React.FC<{
  draft: Partial<JournalEntry>;
  onDraftChange: (draft: Partial<JournalEntry>) => void;
  onSave: (entry: any) => void;
}> = ({ draft, onDraftChange, onSave }) => {
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = () => {
    if (!draft.title || !draft.content) return;
    onSave({
      title: draft.title,
      content: draft.content,
      tags: draft.tags || [],
      mood: draft.mood,
      isDraft: false,
      isPinned: false,
    });
    onDraftChange({});
  };

  // 简单的 Markdown 预览
  const renderMarkdown = (content: string = '') => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mb-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="font-bold mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/- \[x\] (.*$)/gim, '<div class="flex items-center gap-2"><input type="checkbox" checked disabled /> $1</div>')
      .replace(/- \[ \] (.*$)/gim, '<div class="flex items-center gap-2"><input type="checkbox" disabled /> $1</div>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/gim, '<br />');
  };

  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
      <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
        📝 写日记
      </h3>
      
      <input
        type="text"
        placeholder="日记标题..."
        value={draft.title || ''}
        onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
        className="w-full mb-3 px-4 py-2 border-[3px] border-[#2d2d2d] rounded-[var(--wobbly-sm)] font-[var(--font-hand-body)] focus:outline-none focus:border-[#ff4d4d]"
      />
      
      <div className="mb-3">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 text-sm font-[var(--font-hand-body)] border-[2px] border-[#2d2d2d] rounded ${!isPreview ? 'bg-[#ff4d4d] text-white' : 'bg-white'}`}
          >
            编辑
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 text-sm font-[var(--font-hand-body)] border-[2px] border-[#2d2d2d] rounded ${isPreview ? 'bg-[#ff4d4d] text-white' : 'bg-white'}`}
          >
            预览
          </button>
        </div>
        
        {isPreview ? (
          <div
            className="w-full h-[300px] p-4 border-[3px] border-[#2d2d2d] rounded-[var(--wobbly-sm)] overflow-auto font-[var(--font-chat)]"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(draft.content) }}
          />
        ) : (
          <textarea
            placeholder="记录今天的学习心得...（支持 Markdown）"
            value={draft.content || ''}
            onChange={(e) => onDraftChange({ ...draft, content: e.target.value })}
            className="w-full h-[300px] p-4 border-[3px] border-[#2d2d2d] rounded-[var(--wobbly-sm)] font-[var(--font-chat)] resize-none focus:outline-none focus:border-[#ff4d4d]"
          />
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['great', 'good', 'neutral', 'tired'].map((m) => (
            <button
              key={m}
              onClick={() => onDraftChange({ ...draft, mood: m as any })}
              className={`text-xl p-1 rounded ${draft.mood === m ? 'bg-[#fff9c4]' : ''}`}
            >
              {m === 'great' && '😄'}
              {m === 'good' && '🙂'}
              {m === 'neutral' && '😐'}
              {m === 'tired' && '😴'}
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={!draft.title || !draft.content}
          className="px-6 py-2 bg-[#ff4d4d] text-white font-[var(--font-hand-heading)] border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[var(--shadow-hover)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          发布日记
        </button>
      </div>
    </div>
  );
};

// 日记列表组件
const JournalList: React.FC<{
  entries: JournalEntry[];
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ entries, onPin, onDelete }) => {
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-3">
      {sortedEntries.map((entry) => (
        <div
          key={entry.id}
          className={`bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4 ${
            entry.isPinned ? 'border-l-[6px] border-l-[#ff4d4d]' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-[var(--font-hand-heading)] text-lg font-bold">{entry.title}</h4>
            <div className="flex gap-1">
              <button
                onClick={() => onPin(entry.id)}
                className="p-1 hover:bg-[#fdfbf7] rounded"
              >
                {entry.isPinned ? '📌' : '📍'}
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="p-1 hover:bg-[#fdfbf7] rounded text-red-500"
              >
                🗑️
              </button>
            </div>
          </div>
          <p className="font-[var(--font-chat)] text-sm text-[#666] line-clamp-3 mb-2">
            {entry.content.slice(0, 100)}...
          </p>
          <div className="flex justify-between items-center text-xs font-[var(--font-hand-body)] text-[#666]">
            <div className="flex gap-2">
              {entry.tags.map((tag, i) => (
                <span key={i} className="bg-[#fff9c4] px-2 py-1 rounded">#{tag}</span>
              ))}
            </div>
            <span>{new Date(entry.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// AI 洞察卡片组件
const AIInsightCard: React.FC<{ insight: any }> = ({ insight }) => {
  const icons = {
    pattern: '🔍',
    trend: '📈',
    comparison: '⚖️',
    anomaly: '⚠️',
    achievement: '🏆',
  };

  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4 hover:shadow-[var(--shadow-hover)] transition-all">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[insight.type as keyof typeof icons]}</span>
        <div className="flex-1">
          <h4 className="font-[var(--font-hand-heading)] font-bold text-[#2d2d2d]">{insight.title}</h4>
          <p className="font-[var(--font-chat)] text-sm text-[#666] mt-1">{insight.description}</p>
          {insight.dataPoints && (
            <div className="flex gap-4 mt-2">
              {insight.dataPoints.map((point: any, i: number) => (
                <div key={i} className="text-center">
                  <p className="font-[var(--font-hand-heading)] text-lg font-bold text-[#ff4d4d]">
                    {point.value}{point.unit}
                  </p>
                  <p className="text-xs font-[var(--font-hand-body)] text-[#666]">{point.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 主组件
export const StudyRecords: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const { stats, loading: statsLoading } = useStudyStats(timeRange);
  const { entries, draft, setDraft, saveEntry, deleteEntry, togglePin } = useJournal();
  const { analysis, loading: analysisLoading } = useAIAnalysis(timeRange);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: '数据看板', icon: '📊' },
    { id: 'journal', label: '学习日记', icon: '📝' },
    { id: 'insights', label: 'AI 洞察', icon: '🤖' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* 标签页导航 */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-[var(--font-hand-heading)] text-base border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] transition-all ${
              activeTab === tab.id
                ? 'bg-[#ff4d4d] text-white shadow-[var(--shadow-hard)]'
                : 'bg-white text-[#2d2d2d] hover:bg-[#fdfbf7] shadow-[var(--shadow-hard)] hover:shadow-[var(--shadow-hover)] hover:translate-x-[2px] hover:translate-y-[2px]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 数据看板标签页 */}
      {activeTab === 'dashboard' && (
        <div>
          {/* 时间范围选择器 */}
          <div className="flex justify-end mb-4">
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>

          {/* 概览卡片 - 常驻显示，传入加载状态 */}
          <OverviewCards stats={stats} isLoading={statsLoading} />

          {/* 图表区域 */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LearningTrendChart data={stats.trend} />
              <SkillRadarChart skills={stats.skills} />
              <ActivityHeatmap data={stats.activity} />
              <TopicDistribution topics={stats.topics} />
            </div>
          )}
        </div>
      )}

      {/* 学习日记标签页 */}
      {activeTab === 'journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JournalEditor
            draft={draft}
            onDraftChange={setDraft}
            onSave={saveEntry}
          />
          <div>
            <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
              📚 日记列表
            </h3>
            <JournalList
              entries={entries}
              onPin={togglePin}
              onDelete={deleteEntry}
            />
          </div>
        </div>
      )}

      {/* AI 洞察标签页 */}
      {activeTab === 'insights' && (
        <div>
          {analysisLoading ? (
            <div className="text-center py-8 font-[var(--font-hand-body)]">AI 分析中...</div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* 学习洞察 */}
              <div>
                <h3 className="font-[var(--font-hand-heading)] text-xl font-bold text-[#2d2d2d] mb-4">
                  💡 学习洞察
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.insights.map((insight: any) => (
                    <AIInsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>

              {/* 知识缺口 */}
              <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
                <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
                  🎯 知识缺口
                </h3>
                <div className="space-y-3">
                  {analysis.knowledgeGaps.map((gap: any) => (
                    <div key={gap.id} className="flex items-center gap-4">
                      <span className="font-[var(--font-hand-body)] flex-1">{gap.topic}</span>
                      <div className="flex-1">
                        <div className="h-2 bg-[#e5e0d8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ff4d4d] rounded-full"
                            style={{ width: `${gap.currentLevel}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-[var(--font-hand-body)] text-sm text-[#666]">
                        {gap.currentLevel}/{gap.targetLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 学习建议 */}
              <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
                <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
                  📝 学习建议
                </h3>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec: any) => (
                    <div key={rec.id} className="border-l-4 border-[#ff4d4d] pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs rounded font-[var(--font-hand-body)] ${
                          rec.priority === 'high' ? 'bg-[#ff4d4d] text-white' :
                          rec.priority === 'medium' ? 'bg-[#ff9800] text-white' :
                          'bg-[#4caf50] text-white'
                        }`}>
                          {rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}
                        </span>
                        <h4 className="font-[var(--font-hand-heading)] font-bold">{rec.title}</h4>
                      </div>
                      <p className="font-[var(--font-chat)] text-sm text-[#666]">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StudyRecords;
