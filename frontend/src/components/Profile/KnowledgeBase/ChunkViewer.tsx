/**
 * ChunkViewer 组件
 * 用于展示RAG检索结果的文档分块内容
 * 设计特点：
 * - 解耦：独立于其他知识库组件
 * - 美观：使用卡片式布局，支持高亮和动画
 * - 实用：展示文档名、相关度、完整内容
 */

import React, { useState, useMemo } from 'react';
import { BookOpen, FileText, Database, Tag, ChevronDown, ChevronUp, Search } from 'lucide-react';

/**
 * Chunk数据类型
 */
export interface ChunkData {
  index: number;
  doc_name: string;
  source: string;
  score: number;
  content: string;
  chunk_id: string;
  doc_id: string;
  is_system: boolean;
  metadata: {
    start_pos: number;
    end_pos: number;
    [key: string]: any;
  };
}

export interface ChunkViewerProps {
  /** 分块数据列表 */
  chunks: ChunkData[];
  /** 搜索关键词（用于高亮） */
  searchQuery?: string;
  /** 是否可展开/收起 */
  expandable?: boolean;
  /** 默认展开状态 */
  defaultExpanded?: boolean;
  /** 选中回调 */
  onChunkSelect?: (chunk: ChunkData) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 高亮文本中的关键词
 */
const highlightText = (text: string, keyword?: string): React.ReactNode => {
  if (!keyword || keyword.trim() === '') {
    return text;
  }

  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return parts.map((part, index) => {
    if (part.toLowerCase() === keyword.toLowerCase()) {
      return (
        <mark
          key={index}
          className="bg-amber-200 text-amber-900 px-1 rounded font-medium"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
};

/**
 * 获取文档类型图标
 */
const getDocTypeIcon = (docName: string) => {
  const ext = docName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return <BookOpen className="w-4 h-4 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'txt':
    case 'md':
      return <FileText className="w-4 h-4 text-gray-500" />;
    default:
      return <Database className="w-4 h-4 text-emerald-500" />;
  }
};

/**
 * 相关度分数颜色
 */
const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'text-emerald-600 bg-emerald-50';
  if (score >= 0.6) return 'text-blue-600 bg-blue-50';
  if (score >= 0.4) return 'text-amber-600 bg-amber-50';
  return 'text-gray-600 bg-gray-50';
};

/**
 * 单个Chunk卡片组件
 */
interface ChunkCardProps {
  chunk: ChunkData;
  searchQuery?: string;
  expanded: boolean;
  onToggle: () => void;
  onSelect?: (chunk: ChunkData) => void;
}

const ChunkCard: React.FC<ChunkCardProps> = ({
  chunk,
  searchQuery,
  expanded,
  onToggle,
  onSelect,
}) => {
  const scoreClass = getScoreColor(chunk.score);

  return (
    <div
      className={`
        group relative bg-white rounded-xl border border-gray-100
        shadow-sm hover:shadow-md transition-all duration-300
        ${expanded ? 'ring-2 ring-indigo-100' : ''}
      `}
    >
      {/* 头部信息 */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* 序号 */}
          <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center
                         bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-lg">
            {chunk.index}
          </span>

          {/* 文档图标和名称 */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getDocTypeIcon(chunk.doc_name)}
            <span className="font-medium text-gray-800 truncate" title={chunk.doc_name}>
              {chunk.doc_name}
            </span>
            {chunk.is_system && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium
                             bg-purple-50 text-purple-600 rounded-full">
                系统
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* 相关度分数 */}
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${scoreClass}`}>
            {(chunk.score * 100).toFixed(1)}%
          </span>

          {/* 展开/收起图标 */}
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {expanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
          {/* 分隔线 */}
          <div className="border-t border-gray-100 mb-3" />

          {/* Chunk内容 */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {highlightText(chunk.content, searchQuery)}
            </p>
          </div>

          {/* 元数据信息 */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Chunk ID: {chunk.chunk_id.slice(0, 8)}...
            </span>
            <span className="text-gray-300">|</span>
            <span>位置: {chunk.metadata.start_pos} - {chunk.metadata.end_pos}</span>
            <span className="text-gray-300">|</span>
            <span>字数: {chunk.content.length}</span>
          </div>

          {/* 操作按钮 */}
          {onSelect && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onSelect(chunk)}
                className="px-4 py-2 text-sm font-medium text-indigo-600
                         bg-indigo-50 hover:bg-indigo-100
                         rounded-lg transition-colors duration-200"
              >
                查看详情
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * ChunkViewer主组件
 */
export const ChunkViewer: React.FC<ChunkViewerProps> = ({
  chunks,
  searchQuery,
  expandable = true,
  defaultExpanded = false,
  onChunkSelect,
  className = '',
}) => {
  // 展开状态管理
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (defaultExpanded) {
      return new Set(chunks.map(c => c.chunk_id));
    }
    return new Set();
  });

  // 切换展开状态
  const toggleExpanded = (chunkId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(chunkId)) {
        next.delete(chunkId);
      } else {
        next.add(chunkId);
      }
      return next;
    });
  };

  // 全部展开/收起
  const expandAll = () => {
    setExpandedIds(new Set(chunks.map(c => c.chunk_id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // 按相关度排序
  const sortedChunks = useMemo(() => {
    return [...chunks].sort((a, b) => b.score - a.score);
  }, [chunks]);

  // 统计信息
  const stats = useMemo(() => {
    const systemCount = chunks.filter(c => c.is_system).length;
    const userCount = chunks.length - systemCount;
    const avgScore = chunks.reduce((sum, c) => sum + c.score, 0) / chunks.length;

    return {
      total: chunks.length,
      systemCount,
      userCount,
      avgScore,
    };
  }, [chunks]);

  if (chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Search className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">暂无检索结果</p>
        <p className="text-sm mt-1">请尝试其他关键词</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 头部统计 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-gray-700">
            共 {stats.total} 个结果
          </span>
          {stats.systemCount > 0 && (
            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">
              系统: {stats.systemCount}
            </span>
          )}
          {stats.userCount > 0 && (
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs">
              我的: {stats.userCount}
            </span>
          )}
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">
            平均相关度: {(stats.avgScore * 100).toFixed(1)}%
          </span>
        </div>

        {expandable && chunks.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-xs font-medium text-gray-600
                       hover:bg-white hover:shadow-sm rounded-lg transition-all"
            >
              全部展开
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 text-xs font-medium text-gray-600
                       hover:bg-white hover:shadow-sm rounded-lg transition-all"
            >
              全部收起
            </button>
          </div>
        )}
      </div>

      {/* Chunk列表 */}
      <div className="space-y-3">
        {sortedChunks.map((chunk) => (
          <ChunkCard
            key={chunk.chunk_id}
            chunk={chunk}
            searchQuery={searchQuery}
            expanded={expandedIds.has(chunk.chunk_id)}
            onToggle={() => toggleExpanded(chunk.chunk_id)}
            onSelect={onChunkSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default ChunkViewer;
