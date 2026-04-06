// 学习统计数据 Hook

import { useState, useEffect } from 'react';
import { StudyStats, TimeRange } from '../types';
import { generateMockStudyStats } from '../data';

export const useStudyStats = (timeRange: TimeRange) => {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const mockStats = generateMockStudyStats(timeRange);
      setStats(mockStats);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [timeRange]);

  return { stats, loading };
};
