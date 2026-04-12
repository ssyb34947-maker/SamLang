/**
 * 知识库类型定义
 */

export type KnowledgeType = 'pdf' | 'doc' | 'text' | 'markdown' | 'json' | 'csv' | 'other';

export interface KnowledgeItem {
  id: string;
  doc_id?: string;  // RAG文档ID，用于获取chunks
  name: string;
  type: KnowledgeType;
  size: string;
  uploadTime: string;
  content: string | null;
  tags: string[];
  summary: string;
  source?: string;  // 文件路径或来源
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

/**
 * Chunk数据类型（用于RAG检索结果展示）
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

/**
 * ChunkViewer组件属性
 */
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
