import React, { useState, useCallback, useEffect } from 'react';
import { SourcesPanel } from './SourcesPanel';
import { MainContentPanel } from './MainContentPanel';
import { OptionalRightPanel } from './OptionalRightPanel';
import { apiService } from '../../../services/api';
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
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 待上传文件列表
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // 选中知识项
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'document' | 'other'>('all');

  const selectedItem = knowledgeItems.find(item => item.id === selectedId) || null;

  // 从后端获取知识列表
  const fetchKnowledgeList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getKnowledgeList(true);
      if (response.success) {
        // 合并系统知识和用户知识
        const allKnowledge = [
          ...response.system_knowledge.map((k: any) => ({
            id: k.doc_id,
            name: k.name || k.source,
            type: getFileType(k.source),
            size: `${k.chunk_count} 块`,
            uploadTime: k.update_time || '未知',
            content: null,
            tags: k.is_system ? ['系统'] : [],
            summary: k.is_system ? '系统提供的知识' : '用户上传的知识'
          })),
          ...response.user_knowledge.map((k: any) => ({
            id: k.doc_id,
            name: k.name || k.source,
            type: getFileType(k.source),
            size: `${k.chunk_count} 块`,
            uploadTime: k.update_time || '未知',
            content: null,
            tags: ['我的'],
            summary: '用户上传的知识'
          }))
        ];
        setKnowledgeItems(allKnowledge);
      }
    } catch (error) {
      console.error('Failed to fetch knowledge list:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载一次
  useEffect(() => {
    fetchKnowledgeList();
  }, [fetchKnowledgeList]);

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

  // 上传处理 - 只添加到待上传列表，不入库
  const handleUpload = useCallback((files: FileList) => {
    // 文件已经在 SourcesPanel 中被添加到 pendingFiles
    // 这里可以添加预览逻辑
    console.log('Files selected:', files);
  }, []);

  // 入库成功后的回调
  const handleIngestSuccess = useCallback(() => {
    fetchKnowledgeList(); // 立即刷新列表
  }, [fetchKnowledgeList]);

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
        className={`flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isLeftCollapsed ? 'w-0 overflow-hidden' : ''
          }`}
        style={{ width: isLeftCollapsed ? 0 : leftWidth }}
      >
        <SourcesPanel
          items={filteredItems}
          selectedId={selectedId}
          searchQuery={searchQuery}
          filterType={filterType}
          pendingFiles={pendingFiles}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilterType}
          onUpload={handleUpload}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onPendingFilesChange={setPendingFiles}
          onIngestSuccess={handleIngestSuccess}
          onRefresh={fetchKnowledgeList}
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
        className={`flex-shrink-0 flex flex-col bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ${isRightCollapsed ? 'w-0 overflow-hidden' : ''
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
