// AI 分析 Hook

import { useState, useEffect } from 'react';
import { AIAnalysisResult, TimeRange } from '../types';
import { generateMockAIAnalysis } from '../data';

export const useAIAnalysis = (timeRange: TimeRange) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setAnalysis(generateMockAIAnalysis());
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRange]);

  return { analysis, loading };
};
