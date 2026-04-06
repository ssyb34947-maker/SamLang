// 学习日记标签页

import React, { useState } from 'react';
import { JournalEntry } from '../types';

interface JournalTabProps {
  entries: JournalEntry[];
  draft: Partial<JournalEntry>;
  setDraft: (draft: Partial<JournalEntry>) => void;
  saveEntry: (entry: any) => void;
  deleteEntry: (id: string) => void;
  togglePin: (id: string) => void;
}

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

  const renderMarkdown = (content: string = '') => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mb-2">$1</h2>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/- \[x\] (.*$)/gim, '<div class="flex items-center gap-2"><input type="checkbox" checked disabled /> $1</div>')
      .replace(/- \[ \] (.*$)/gim, '<div class="flex items-center gap-2"><input type="checkbox" disabled /> $1</div>')
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
              <button onClick={() => onPin(entry.id)} className="p-1 hover:bg-[#fdfbf7] rounded">
                {entry.isPinned ? '📌' : '📍'}
              </button>
              <button onClick={() => onDelete(entry.id)} className="p-1 hover:bg-[#fdfbf7] rounded text-red-500">
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

export const JournalTab: React.FC<JournalTabProps> = ({
  entries,
  draft,
  setDraft,
  saveEntry,
  deleteEntry,
  togglePin,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <JournalEditor draft={draft} onDraftChange={setDraft} onSave={saveEntry} />
      <div>
        <h3 className="font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4">
          📚 日记列表
        </h3>
        <JournalList entries={entries} onPin={togglePin} onDelete={deleteEntry} />
      </div>
    </div>
  );
};
