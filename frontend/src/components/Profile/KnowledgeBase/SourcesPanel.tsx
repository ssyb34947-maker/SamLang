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
  ChevronDown,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../../services/api';
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

// 扩展的 Props 类型
interface ExtendedSourcesPanelProps extends SourcesPanelProps {
  pendingFiles: File[];
  isLoading?: boolean;
  onPendingFilesChange: (files: File[]) => void;
  onIngestSuccess: () => void;
  onRefresh: () => void;
}

export const SourcesPanel: React.FC<ExtendedSourcesPanelProps> = ({
  items,
  selectedId,
  searchQuery,
  filterType,
  pendingFiles,
  isLoading,
  onSearchChange,
  onFilterChange,
  onUpload,
  onSelect,
  onDelete,
  onPendingFilesChange,
  onIngestSuccess,
  onRefresh
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 上传状态
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<string>('other');

  // 处理文件选择 - 添加到待上传列表
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onPendingFilesChange([...pendingFiles, ...newFiles]);
      // 同时触发 onUpload 回调用于预览
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
      const newFiles = Array.from(e.dataTransfer.files);
      onPendingFilesChange([...pendingFiles, ...newFiles]);
      onUpload(e.dataTransfer.files);
    }
  };

  // 处理删除确认
  const handleDeleteClick = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        await apiService.deleteKnowledge(id);
        onDelete(id);
      } catch (error: any) {
        alert(`删除失败: ${error.message}`);
      }
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  // 提交入库
  const handleIngest = async () => {
    if (pendingFiles.length === 0) {
      setUploadMessage('请先选择文件');
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      const response = await apiService.ingestDocuments(
        pendingFiles,
        selectedDocType,
        { source: 'web_upload' }
      );

      if (response.success) {
        const successCount = response.processed_files || 0;
        const totalCount = response.total_files || pendingFiles.length;
        const failCount = response.failed_files || 0;

        if (failCount > 0) {
          // 部分成功
          setUploadStatus('error');
          setUploadMessage(`部分成功: ${successCount}/${totalCount} 个文件入库，${failCount} 个失败`);
        } else {
          // 全部成功
          setUploadStatus('success');
          setUploadMessage(`✓ 成功入库 ${successCount} 个文件`);
        }

        onPendingFilesChange([]); // 清空待上传列表
        onIngestSuccess(); // 通知父组件刷新列表
      } else {
        setUploadStatus('error');
        setUploadMessage(`✗ ${response.message || '入库失败'}`);
      }
    } catch (error: any) {
      setUploadStatus('error');
      setUploadMessage(`✗ 入库失败: ${error.message}`);
    } finally {
      setIsUploading(false);
      // 5秒后清除状态（给用户更多时间查看）
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 5000);
    }
  };

  // 移除待上传文件
  const removePendingFile = (index: number) => {
    const newFiles = pendingFiles.filter((_, i) => i !== index);
    onPendingFilesChange(newFiles);
  };

  return (
    <div className="flex flex-col h-full font-[var(--font-hand-body)]">
      {/* 头部 - 标题和新建按钮 */}
      <div className="p-4 border-b-2" style={{ borderColor: 'var(--sketch-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}>
            知识来源
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
              style={{ color: 'var(--sketch-pencil)' }}
              title="刷新列表"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-sm" style={{ color: 'var(--sketch-pencil)' }}>
              {items.length} 个文件
            </span>
          </div>
        </div>

        {/* 上传按钮 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-bold transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[2px] hover:translate-y-[2px]"
          style={{
            fontFamily: 'var(--font-hand-heading)',
            backgroundColor: 'var(--sketch-accent)',
            color: 'white',
            border: '3px solid var(--sketch-border)',
            borderRadius: 'var(--wobbly-sm)',
            boxShadow: 'var(--shadow-hard)'
          }}
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
            relative border-2 border-dashed p-4 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? 'bg-[#fff9c4]'
              : 'hover:bg-[#fdfbf7]'
            }
          `}
          style={{
            borderColor: 'var(--sketch-border)',
            borderRadius: 'var(--wobbly-sm)'
          }}
        >
          <Upload className={`w-6 h-6 mx-auto mb-2 transition-colors ${isDragging ? 'text-[#ff4d4d]' : 'text-[#666]'
            }`} />
          <p className="text-sm" style={{ color: 'var(--sketch-text)' }}>
            {isDragging ? '释放以上传文件' : '点击或拖拽上传'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--sketch-pencil)' }}>
            支持 PDF、Word、TXT、MD、Excel、CSV
          </p>
        </div>

        {/* 待上传文件列表 */}
        {pendingFiles.length > 0 && (
          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--sketch-paper)', border: '2px dashed var(--sketch-border)' }}>
            <p className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}>
              待入库文件 ({pendingFiles.length})
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {pendingFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="truncate" style={{ color: 'var(--sketch-text)' }} title={file.name}>
                    {file.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePendingFile(index);
                    }}
                    className="p-1 rounded ml-2 transition-colors hover:bg-white/50"
                  >
                    <X className="w-3 h-3" style={{ color: 'var(--sketch-accent)' }} />
                  </button>
                </div>
              ))}
            </div>

            {/* 文档类型选择 */}
            <div className="mt-3">
              <label className="text-xs block mb-1" style={{ color: 'var(--sketch-pencil)', fontFamily: 'var(--font-hand-body)' }}>
                文档类型
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full text-sm px-2 py-1.5 rounded border bg-white"
                style={{
                  borderColor: 'var(--sketch-border)',
                  color: 'var(--sketch-text)',
                  fontFamily: 'var(--font-hand-body)'
                }}
              >
                <option value="book">教材 (Book)</option>
                <option value="problem">考题 (Problem)</option>
                <option value="note">笔记 (Note)</option>
                <option value="other">其他 (Other)</option>
              </select>
            </div>

            {/* 提交入库按钮 */}
            <button
              onClick={handleIngest}
              disabled={isUploading}
              className={`
                w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                font-bold text-sm transition-all
                ${isUploading
                  ? 'cursor-not-allowed'
                  : 'hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]'
                }
              `}
              style={{
                fontFamily: 'var(--font-hand-heading)',
                backgroundColor: isUploading ? 'var(--sketch-muted)' : uploadStatus === 'success' ? '#4caf50' : uploadStatus === 'error' ? 'var(--sketch-accent)' : 'var(--sketch-secondary)',
                color: 'white',
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                boxShadow: isUploading ? 'none' : 'var(--shadow-hard)'
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>入库中...</span>
                </>
              ) : uploadStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{uploadMessage || '入库成功'}</span>
                </>
              ) : uploadStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>{uploadMessage || '入库失败'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>提交入库 ({pendingFiles.length} 个文件)</span>
                </>
              )}
            </button>

            {/* 详细反馈信息 */}
            {uploadStatus !== 'idle' && uploadMessage && (
              <div
                className="mt-2 p-2 rounded text-xs text-center font-[var(--font-hand-body)]"
                style={{
                  backgroundColor: uploadStatus === 'success' ? '#e8f5e9' : '#ffebee',
                  color: uploadStatus === 'success' ? '#2e7d32' : 'var(--sketch-accent)',
                  border: '1px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly-sm)'
                }}
              >
                {uploadMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 搜索和过滤 */}
      <div className="px-4 pb-3 space-y-2">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--sketch-pencil)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索知识..."
            className="w-full pl-9 pr-8 py-2 text-sm border-2 rounded-lg focus:outline-none transition-all"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--sketch-border)',
              color: 'var(--sketch-text)',
              fontFamily: 'var(--font-hand-body)',
              borderRadius: 'var(--wobbly-sm)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors hover:bg-[var(--sketch-muted)]"
            >
              <X className="w-3 h-3" style={{ color: 'var(--sketch-pencil)' }} />
            </button>
          )}
        </div>

        {/* 过滤器 */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all hover:shadow-[var(--shadow-hover)]"
            style={{
              color: 'var(--sketch-text)',
              backgroundColor: 'white',
              border: '2px solid var(--sketch-border)',
              fontFamily: 'var(--font-hand-body)',
              borderRadius: 'var(--wobbly-sm)'
            }}
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
              <div
                className="absolute top-full left-0 mt-1 w-32 bg-white z-20 py-1"
                style={{
                  border: '2px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly-sm)',
                  boxShadow: 'var(--shadow-hard)'
                }}
              >
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
                    className="w-full px-3 py-2 text-sm text-left transition-colors font-[var(--font-hand-body)]"
                    style={{
                      color: filterType === key ? 'var(--sketch-accent)' : 'var(--sketch-text)',
                      backgroundColor: filterType === key ? 'var(--sketch-paper)' : 'transparent'
                    }}
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
            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--sketch-muted)' }} />
            <p className="text-sm font-[var(--font-hand-body)]" style={{ color: 'var(--sketch-pencil)' }}>
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
        transition-all duration-200 font-[var(--font-hand-body)]
        ${isSelected
          ? 'border-2'
          : 'border-2 border-transparent hover:border-[var(--sketch-muted)]'
        }
      `}
      style={{
        backgroundColor: isSelected ? 'var(--sketch-paper)' : 'transparent',
        borderColor: isSelected ? 'var(--sketch-border)' : undefined,
        borderRadius: 'var(--wobbly-sm)'
      }}
    >
      {/* 文件图标 */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: 'var(--sketch-muted)',
          borderRadius: 'var(--wobbly-sm)'
        }}
      >
        {fileTypeIcons[item.type]}
      </div>

      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--sketch-text)' }}>
          {item.name}
        </p>
        <p className="text-xs" style={{ color: 'var(--sketch-pencil)' }}>
          {item.size} · {item.uploadTime}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className={`flex items-center gap-1 transition-opacity ${showActions || isDeleting ? 'opacity-100' : 'opacity-0'
        }`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 rounded transition-colors"
          style={{
            backgroundColor: isDeleting ? '#ffebee' : 'transparent',
            color: isDeleting ? 'var(--sketch-accent)' : 'var(--sketch-pencil)'
          }}
          title={isDeleting ? '再次点击确认删除' : '删除'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
