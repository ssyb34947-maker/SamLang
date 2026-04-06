// 日记管理 Hook

import { useState, useEffect } from 'react';
import { JournalEntry, JournalDraft } from '../types';
import { generateMockJournals } from '../data';

export const useJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraft] = useState<Partial<JournalEntry>>({});

  useEffect(() => {
    setEntries(generateMockJournals());
  }, []);

  const saveEntry = (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const togglePin = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isPinned: !e.isPinned } : e))
    );
  };

  return {
    entries,
    draft,
    setDraft,
    saveEntry,
    deleteEntry,
    togglePin,
  };
};
