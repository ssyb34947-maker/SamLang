/**
 * 管理员统计数据 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  UserStatsOverview,
  UserTrend,
  UserDistribution,
  UserPersonaRadar,
  GeoDistribution,
  TrafficStats,
} from '../types';
import {
  generateMockOverview,
  generateMockTrend,
  generateMockDistribution,
  generateMockPersonaRadar,
  generateMockGeoDistribution,
  generateMockTrafficStats,
} from '../utils/mockData';

// 模拟API调用延迟
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const useUserStatsOverview = () => {
  const [data, setData] = useState<UserStatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await mockDelay();
    setData(generateMockOverview());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};

export const useUserTrend = (days: number = 30) => {
  const [data, setData] = useState<UserTrend | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await mockDelay();
    setData(generateMockTrend(days));
    setLoading(false);
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};

export const useUserDistribution = () => {
  const [data, setData] = useState<UserDistribution | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await mockDelay();
    setData(generateMockDistribution());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};

export const useUserPersonaRadar = () => {
  const [data, setData] = useState<UserPersonaRadar | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await mockDelay();
    setData(generateMockPersonaRadar());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};

export const useGeoDistribution = () => {
  const [data, setData] = useState<GeoDistribution | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await mockDelay();
    setData(generateMockGeoDistribution());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};

export const useTrafficStats = () => {
  const [data, setData] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await mockDelay();
    setData(generateMockTrafficStats());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    // 每5秒刷新一次
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};
