// 学习统计数据 Hook

import { useState, useEffect } from 'react';
import { StudyStats, TimeRange } from '../types';
import { generateMockStudyStats } from '../utils/mockData';

interface UseStudyStatsReturn {
  stats: StudyStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useStudyStats = (timeRange: TimeRange = '7d'): UseStudyStatsReturn => {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 使用模拟数据
      const data = generateMockStudyStats(timeRange);
      setStats(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
