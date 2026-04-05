import React, { useRef, useState } from 'react';
import { 
  Plus, 
  Upload, 
  Search, 
  FileText, 
  FileType, 
  FileCode, 
  Trash2, 
  MoreVertical,
  X,
  Filter,
  ChevronDown
} from 'lucide-react';
import { SourcesPanelProps, KnowledgeItem, KnowledgeType } from './types';

/**
 * SourcesPanel - 左侧面板组件
 * 
 * 功能：
 * - 显示知识来源列表
 * - 支持文件上传（拖拽 + 点击）
 * - 搜索和过滤
 * - 选择、删除操作
 */

// 文件类型图标映射
const fileTypeIcons: Record<KnowledgeType, React.ReactNode> = {
  pdf: <FileType className="w-5 h-5 text-red-500" />,
  doc: <FileText className="w-5 h-5 text-blue-500" />,
  text: <FileText className="w-5 h-5 text-gray-500" />,
  markdown: <FileCode className="w-5 h-5 text-purple-500" />,
  json: <FileCode className="w-5 h-5 text-yellow-500" />,
  csv: <FileCode className="w-5 h-5 text-green-500" />,
  other: <FileText className="w-5 h-5 text-gray-400" />
};

// 文件类型颜色映射
const fileTypeColors: Record<KnowledgeType, string> = {
  pdf: 'bg-red-50 text-red-700 border-red-200',
  doc: 'bg-blue-50 text-blue-700 border-blue-200',
  text: 'bg-gray-50 text-gray-700 border-gray-200',
  markdown: 'bg-purple-50 text-purple-700 border-purple-200',
  json: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  csv: 'bg-green-50 text-green-700 border-green-200',
  other: 'bg-gray-50 text-gray-600 border-gray-200'
};

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  items,
  selectedId,
  searchQuery,
  filterType,
  onSearchChange,
  onFilterChange,
  onUpload,
  onSelect,
  onDelete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      e.target.value = ''; // 重置 input
    }
  };

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  // 处理删除确认
  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部 - 标题和新建按钮 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            知识来源
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {items.length} 个文件
          </span>
        </div>
        
        {/* 上传按钮 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>新建知识库</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 上传区域 - 拖拽区 */}
      <div className="px-4 py-3">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
        >
          <Upload className={`w-6 h-6 mx-auto mb-2 transition-colors ${
            isDragging ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isDragging ? '释放以上传文件' : '点击或拖拽上传'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            支持 PDF、Word、TXT、MD
          </p>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="px-4 pb-3 space-y-2">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索知识..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* 过滤器 */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>
              {filterType === 'all' && '全部'}
              {filterType === 'document' && '文档'}
              {filterType === 'other' && '其他'}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showFilterMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowFilterMenu(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'document', label: '文档' },
                  { key: 'other', label: '其他' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      onFilterChange(key as typeof filterType);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      filterType === key ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 知识列表 */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? '没有找到匹配的知识' : '暂无知识文件'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <KnowledgeListItem
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                isDeleting={deleteConfirmId === item.id}
                onSelect={() => onSelect(item.id)}
                onDelete={() => handleDeleteClick(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 知识列表项组件
interface KnowledgeListItemProps {
  item: KnowledgeItem;
  isSelected: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const KnowledgeListItem: React.FC<KnowledgeListItemProps> = ({
  item,
  isSelected,
  isDeleting,
  onSelect,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`
        group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer
        transition-all duration-200
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent'
        }
      `}
    >
      {/* 文件图标 */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
        fileTypeColors[item.type].split(' ')[0]
      }`}>
        {fileTypeIcons[item.type]}
      </div>

      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
        }`}>
          {item.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {item.size} · {item.uploadTime}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className={`flex items-center gap-1 transition-opacity ${
        showActions || isDeleting ? 'opacity-100' : 'opacity-0'
      }`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`
            p-1.5 rounded transition-colors
            ${isDeleting 
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
              : 'hover:bg-red-100 text-gray-400 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
            }
          `}
          title={isDeleting ? '再次点击确认删除' : '删除'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
