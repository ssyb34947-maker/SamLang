import React, { useState, useCallback } from 'react';
import { SourcesPanel } from './SourcesPanel';
import { MainContentPanel } from './MainContentPanel';
import { OptionalRightPanel } from './OptionalRightPanel';
import { KnowledgeItem } from './types';

/**
 * KnowledgeNotebookLayout
 * 三栏可调整布局组件 - 类似 Google NotebookLM 的简化版
 * 
 * Layout Structure:
 * - Left: Sources Panel (知识来源列表)
 * - Center: Main Content (知识内容展示)
 * - Right: Optional Info Panel (元数据信息)
 */

// 默认面板宽度
const DEFAULT_LEFT_WIDTH = 300;
const DEFAULT_RIGHT_WIDTH = 320;
const MIN_LEFT_WIDTH = 240;
const MAX_LEFT_WIDTH = 400;
const MIN_RIGHT_WIDTH = 240;
const MAX_RIGHT_WIDTH = 400;

export const KnowledgeNotebookLayout: React.FC = () => {
  // 面板宽度状态
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT_WIDTH);
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT_WIDTH);
  
  // 面板折叠状态
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  
  // 拖拽调整状态
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  
  // 知识数据状态
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([
    {
      id: '1',
      name: 'React 学习笔记.md',
      type: 'markdown',
      size: '12.5 KB',
      uploadTime: '2024-01-15 10:30',
      content: '# React 学习笔记\n\n## Hooks 基础\n\nuseState 是 React 中最常用的 Hook...',
      tags: ['前端', 'React'],
      summary: 'React Hooks 学习笔记，包含 useState、useEffect 等基础用法'
    },
    {
      id: '2',
      name: '英语语法总结.pdf',
      type: 'pdf',
      size: '2.3 MB',
      uploadTime: '2024-01-14 15:20',
      content: null,
      tags: ['英语', '语法'],
      summary: '英语语法知识点总结文档'
    },
    {
      id: '3',
      name: '单词列表.txt',
      type: 'text',
      size: '5.1 KB',
      uploadTime: '2024-01-13 09:15',
      content: 'apple - 苹果\nbanana - 香蕉\norange - 橙子',
      tags: ['词汇'],
      summary: '常用英语单词列表'
    }
  ]);
  
  // 选中知识项
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'document' | 'other'>('all');

  const selectedItem = knowledgeItems.find(item => item.id === selectedId) || null;

  // 处理左侧面板拖拽
  const handleLeftResizeStart = useCallback(() => {
    setIsResizingLeft(true);
  }, []);

  // 处理右侧面板拖拽
  const handleRightResizeStart = useCallback(() => {
    setIsResizingRight(true);
  }, []);

  // 全局鼠标移动处理
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, e.clientX));
        setLeftWidth(newWidth);
      }
      if (isResizingRight) {
        const containerWidth = window.innerWidth;
        const newWidth = Math.max(MIN_RIGHT_WIDTH, Math.min(MAX_RIGHT_WIDTH, containerWidth - e.clientX));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingLeft, isResizingRight]);

  // 上传处理
  const handleUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      const newItem: KnowledgeItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: getFileType(file.name),
        size: formatFileSize(file.size),
        uploadTime: new Date().toLocaleString('zh-CN'),
        content: null,
        tags: [],
        summary: ''
      };
      setKnowledgeItems(prev => [newItem, ...prev]);
    });
  }, []);

  // 删除处理
  const handleDelete = useCallback((id: string) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  // 选择处理
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // 过滤知识项
  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'document' && ['pdf', 'doc', 'docx', 'txt', 'md'].includes(item.type)) ||
      (filterType === 'other' && !['pdf', 'doc', 'docx', 'txt', 'md'].includes(item.type));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-[calc(100vh-140px)] flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* 左侧面板 */}
      <div
        className={`flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isLeftCollapsed ? 'w-0 overflow-hidden' : ''
        }`}
        style={{ width: isLeftCollapsed ? 0 : leftWidth }}
      >
        <SourcesPanel
          items={filteredItems}
          selectedId={selectedId}
          searchQuery={searchQuery}
          filterType={filterType}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilterType}
          onUpload={handleUpload}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      </div>

      {/* 左侧拖拽手柄 */}
      {!isLeftCollapsed && (
        <div
          className="w-1 flex-shrink-0 cursor-col-resize hover:bg-blue-500 transition-colors"
          onMouseDown={handleLeftResizeStart}
          title="拖拽调整宽度"
        />
      )}

      {/* 中间面板 */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">
        <MainContentPanel
          item={selectedItem}
          isLeftCollapsed={isLeftCollapsed}
          isRightCollapsed={isRightCollapsed}
          onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
          onToggleRight={() => setIsRightCollapsed(!isRightCollapsed)}
        />
      </div>

      {/* 右侧拖拽手柄 */}
      {!isRightCollapsed && (
        <div
          className="w-1 flex-shrink-0 cursor-col-resize hover:bg-blue-500 transition-colors"
          onMouseDown={handleRightResizeStart}
          title="拖拽调整宽度"
        />
      )}

      {/* 右侧面板 */}
      <div
        className={`flex-shrink-0 flex flex-col bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isRightCollapsed ? 'w-0 overflow-hidden' : ''
        }`}
        style={{ width: isRightCollapsed ? 0 : rightWidth }}
      >
        <OptionalRightPanel
          item={selectedItem}
          isCollapsed={isRightCollapsed}
          onToggle={() => setIsRightCollapsed(!isRightCollapsed)}
        />
      </div>
    </div>
  );
};

// 辅助函数
function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    'pdf': 'pdf',
    'doc': 'doc',
    'docx': 'doc',
    'txt': 'text',
    'md': 'markdown',
    'json': 'json',
    'csv': 'csv'
  };
  return typeMap[ext] || 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
