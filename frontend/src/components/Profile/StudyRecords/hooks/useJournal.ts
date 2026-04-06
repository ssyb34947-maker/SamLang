// 日记管理 Hook

import { useState, useEffect, useCallback } from 'react';
import { JournalEntry, JournalDraft, Mood } from '../types';
import { generateMockJournals } from '../utils/mockData';

const STORAGE_KEY = 'study_journal_drafts';

interface UseJournalReturn {
  entries: JournalEntry[];
  draft: Partial<JournalEntry>;
  loading: boolean;
  setDraft: (draft: Partial<JournalEntry>) => void;
  saveEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  togglePin: (id: string) => void;
}

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useJournal = (): UseJournalReturn => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraftState] = useState<Partial<JournalEntry>>({});
  const [loading, setLoading] = useState(true);

  // 初始化加载日记列表
  useEffect(() => {
    const loadJournals = async () => {
      setLoading(true);
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 使用模拟数据
      const mockData = generateMockJournals();
      setEntries(mockData);
      setLoading(false);
    };

    loadJournals();
  }, []);

  // 从 localStorage 加载草稿
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setDraftState(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // 自动保存草稿
  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft.title || draft.content) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...draft,
          savedAt: new Date().toISOString(),
        }));
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [draft]);

  const setDraft = useCallback((newDraft: Partial<JournalEntry>) => {
    setDraftState(prev => ({ ...prev, ...newDraft }));
  }, []);

  const saveEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEntry: JournalEntry = {
      ...entry,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    setEntries(prev => [newEntry, ...prev]);
    
    // 清除草稿
    localStorage.removeItem(STORAGE_KEY);
    setDraftState({});
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, isPinned: !entry.isPinned }
          : entry
      )
    );
  }, []);

  return {
    entries,
    draft,
    loading,
    setDraft,
    saveEntry,
    updateEntry,
    deleteEntry,
    togglePin,
  };
};
