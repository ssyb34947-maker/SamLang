/**
 * 知识库类型定义
 */

export type KnowledgeType = 'pdf' | 'doc' | 'text' | 'markdown' | 'json' | 'csv' | 'other';

export interface KnowledgeItem {
  id: string;
  name: string;
  type: KnowledgeType;
  size: string;
  uploadTime: string;
  content: string | null;
  tags: string[];
  summary: string;
}

export interface SourcesPanelProps {
  items: KnowledgeItem[];
  selectedId: string | null;
  searchQuery: string;
  filterType: 'all' | 'document' | 'other';
  onSearchChange: (query: string) => void;
  onFilterChange: (type: 'all' | 'document' | 'other') => void;
  onUpload: (files: FileList) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  // 新增：文件上传相关
  pendingFiles?: File[];
  isLoading?: boolean;
  onPendingFilesChange?: (files: File[]) => void;
  onIngestSuccess?: () => void;
  onRefresh?: () => void;
}

export interface MainContentPanelProps {
  item: KnowledgeItem | null;
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

export interface OptionalRightPanelProps {
  item: KnowledgeItem | null;
  isCollapsed: boolean;
  onToggle: () => void;
}
