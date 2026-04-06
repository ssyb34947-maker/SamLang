// AI 分析 Hook（预留）

import { useState, useEffect } from 'react';
import { AIAnalysisResult, TimeRange } from '../types';
import { generateMockAIAnalysis } from '../utils/mockData';

interface UseAIAnalysisReturn {
  analysis: AIAnalysisResult | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useAIAnalysis = (timeRange: TimeRange = '30d'): UseAIAnalysisReturn => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 使用模拟数据
      const data = generateMockAIAnalysis();
      setAnalysis(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [timeRange]);

  return {
    analysis,
    loading,
    error,
    refetch: fetchAnalysis,
  };
};
