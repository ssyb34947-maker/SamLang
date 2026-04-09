/**
 * Token显示组件Hooks
 * 管理Token状态和对话Token统计
 */

import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { TokenStats, ConversationTokenInfo } from '../types';
import { sumTokens } from '../utils';

/**
 * 对话Token状态Hook
 * 用于管理对话级Token统计
 */
export function useConversationTokens(conversationId?: string) {
  const [tokens, setTokens] = useState<TokenStats>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载对话的Token统计
  const loadTokens = useCallback(async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getConversation(conversationId);
      if (response) {
        setTokens({
          promptTokens: response.prompt_tokens || 0,
          completionTokens: response.completion_tokens || 0,
          totalTokens: response.total_tokens || 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载Token统计失败');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // 初始加载
  useEffect(() => {
    if (conversationId) {
      loadTokens();
    }
  }, [conversationId, loadTokens]);

  // 添加消息Token（一次性更新）
  const addMessageTokens = useCallback((messageTokens: TokenStats) => {
    setTokens(prev => ({
      promptTokens: prev.promptTokens + messageTokens.promptTokens,
      completionTokens: prev.completionTokens + messageTokens.completionTokens,
      totalTokens: prev.totalTokens + messageTokens.totalTokens,
    }));
  }, []);

  // 重置Token统计
  const resetTokens = useCallback(() => {
    setTokens({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    });
  }, []);

  return {
    tokens,
    isLoading,
    error,
    loadTokens,
    addMessageTokens,
    resetTokens,
  };
}

/**
 * 消息Token Hook
 * 用于管理单条消息的Token显示
 */
export function useMessageTokens() {
  const [tokens, setTokens] = useState<TokenStats>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // 设置Token并触发动画
  const setMessageTokens = useCallback((newTokens: TokenStats) => {
    setIsAnimating(true);
    setTokens(newTokens);
  }, []);

  // 动画完成回调
  const onAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  return {
    tokens,
    isAnimating,
    setMessageTokens,
    onAnimationComplete,
  };
}

/**
 * Token列表聚合Hook
 * 用于聚合多条消息的Token统计
 */
export function useTokenAggregation() {
  const [tokenList, setTokenList] = useState<TokenStats[]>([]);
  const [aggregatedTokens, setAggregatedTokens] = useState<TokenStats>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });

  // 添加消息Token
  const addMessageToken = useCallback((tokens: TokenStats) => {
    setTokenList(prev => [...prev, tokens]);
    setAggregatedTokens(prev => ({
      promptTokens: prev.promptTokens + tokens.promptTokens,
      completionTokens: prev.completionTokens + tokens.completionTokens,
      totalTokens: prev.totalTokens + tokens.totalTokens,
    }));
  }, []);

  // 清空所有Token
  const clearAll = useCallback(() => {
    setTokenList([]);
    setAggregatedTokens({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    });
  }, []);

  return {
    tokenList,
    aggregatedTokens,
    addMessageToken,
    clearAll,
  };
}
