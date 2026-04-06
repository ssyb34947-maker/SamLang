// AI 洞察标签页

import React from 'react';
import { AIAnalysisResult } from '../types';

interface InsightsTabProps {
  analysis: AIAnalysisResult | null;
  isLoading: boolean;
}

const AIInsightCard: React.FC<{ insight: any }> = ({ insight }) => {
  const icons: Record<string, string> = {
    pattern: '🔍',
    trend: '📈',
    comparison: '⚖️',
    anomaly: '⚠️',
    achievement: '🏆',
  };

  return (
    <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4 hover:shadow-[var(--shadow-hover)] transition-all">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[insight.type]}</span>
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

export const InsightsTab: React.FC<InsightsTabProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8 font-[var(--font-hand-body)]">AI 分析中...</div>;
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
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
                  <div className="h-full bg-[#ff4d4d] rounded-full" style={{ width: `${gap.currentLevel}%` }} />
                </div>
              </div>
              <span className="font-[var(--font-hand-body)] text-sm text-[#666]">
                {gap.currentLevel}/{gap.targetLevel}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4">
        <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
          📝 学习建议
        </h3>
        <div className="space-y-4">
          {analysis.recommendations.map((rec: any) => (
            <div key={rec.id} className="border-l-4 border-[#ff4d4d] pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-1 text-xs rounded font-[var(--font-hand-body)] ${
                    rec.priority === 'high'
                      ? 'bg-[#ff4d4d] text-white'
                      : rec.priority === 'medium'
                      ? 'bg-[#ff9800] text-white'
                      : 'bg-[#4caf50] text-white'
                  }`}
                >
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
  );
};
