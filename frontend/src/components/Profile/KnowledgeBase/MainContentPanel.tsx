import React, { useState, useEffect } from 'react';
import {
  FileText,
  PanelLeft,
  PanelRight,
  Download,
  Trash2,
  Edit3,
  Clock,
  FileType,
  FileCode,
  Layers
} from 'lucide-react';
import { MainContentPanelProps, KnowledgeType, ChunkData } from './types';
import { DocumentViewer } from './DocumentViewer';
import { ChunkViewer } from './ChunkViewer';

/**
 * MainContentPanel - 中间面板组件
 * 
 * 功能：
 * - 显示选中知识的详细内容
 * - 空状态提示
 * - 内容预览（文本、Markdown、代码等）
 * - 顶部操作栏
 */

// 文件类型图标
const fileTypeIcons: Record<KnowledgeType, React.ReactNode> = {
  pdf: <FileType className="w-6 h-6 text-red-500" />,
  doc: <FileText className="w-6 h-6 text-blue-500" />,
  text: <FileText className="w-6 h-6 text-gray-500" />,
  markdown: <FileCode className="w-6 h-6 text-purple-500" />,
  json: <FileCode className="w-6 h-6 text-yellow-500" />,
  csv: <FileCode className="w-6 h-6 text-green-500" />,
  other: <FileText className="w-6 h-6 text-gray-400" />
};

// 文件类型标签
const fileTypeLabels: Record<KnowledgeType, string> = {
  pdf: 'PDF 文档',
  doc: 'Word 文档',
  text: '文本文件',
  markdown: 'Markdown',
  json: 'JSON',
  csv: 'CSV',
  other: '其他文件'
};

export const MainContentPanel: React.FC<MainContentPanelProps> = ({
  item,
  isLeftCollapsed,
  isRightCollapsed,
  onToggleLeft,
  onToggleRight
}) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<'preview' | 'chunks'>('preview');
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);

  // 当item变化时，重置状态
  useEffect(() => {
    setActiveTab('preview');
    setChunks([]);
  }, [item?.id]);

  // 当切换到chunks标签时，总是重新加载数据
  useEffect(() => {
    if (activeTab === 'chunks' && item?.doc_id) {
      loadChunks();
    }
  }, [activeTab, item?.id]);

  // 加载文档chunks
  const loadChunks = async () => {
    if (!item?.doc_id) {
      console.log('[MainContentPanel] 没有doc_id，跳过加载');
      return;
    }

    console.log('[MainContentPanel] 开始加载文档chunks:', item.doc_id);
    setIsLoadingChunks(true);
    try {
      // 获取token
      const token = localStorage.getItem('token');
      console.log('[MainContentPanel] Token:', token ? `${token.substring(0, 20)}...` : 'null');
      
      // 调用后端API获取chunks
      const apiUrl = `/api/knowledge/documents/${item.doc_id}/chunks`;
      console.log('[MainContentPanel] API调用:', apiUrl);
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      console.log('[MainContentPanel] 请求headers:', headers);
      const response = await fetch(apiUrl, { headers });
      console.log('[MainContentPanel] API响应状态:', response.status, response.ok);
      console.log('[MainContentPanel] 响应Content-Type:', response.headers.get('content-type'));
      
      if (response.ok) {
        const data = await response.json();
        console.log('[MainContentPanel] API响应数据:', data);
        
        if (data.chunks && data.chunks.length > 0) {
          console.log('[MainContentPanel] 获取到chunks数量:', data.chunks.length);
          // 转换数据格式
          const formattedChunks: ChunkData[] = data.chunks.map((chunk: any, index: number) => ({
            index: chunk.index || index + 1,
            doc_name: data.doc_name || item.name,
            source: data.doc_name || item.name,
            score: 1.0, // 文档预览不需要相关度分数
            content: chunk.content,
            chunk_id: chunk.chunk_id,
            doc_id: chunk.doc_id,
            is_system: data.is_system || false,
            metadata: chunk.metadata || {}
          }));
          setChunks(formattedChunks);
        } else {
          console.log('[MainContentPanel] 没有获取到chunks数据');
          setChunks([]);
        }
      } else {
        console.error('[MainContentPanel] API响应失败:', response.statusText);
      }
    } catch (error) {
      console.error('[MainContentPanel] 加载文档分块失败:', error);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  // 渲染空状态
  if (!item) {
    return (
      <div className="flex flex-col h-full font-[var(--font-hand-body)]">
        {/* 顶部工具栏 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b-2"
          style={{ borderColor: 'var(--sketch-border)', backgroundColor: 'white' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLeft}
              className="p-2 rounded-lg transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
              style={{
                backgroundColor: isLeftCollapsed ? 'var(--sketch-paper)' : 'transparent',
                color: isLeftCollapsed ? 'var(--sketch-accent)' : 'var(--sketch-pencil)'
              }}
              title={isLeftCollapsed ? '展开左侧面板' : '收起左侧面板'}
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleRight}
              className="p-2 rounded-lg transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
              style={{
                backgroundColor: isRightCollapsed ? 'var(--sketch-paper)' : 'transparent',
                color: isRightCollapsed ? 'var(--sketch-accent)' : 'var(--sketch-pencil)'
              }}
              title={isRightCollapsed ? '展开右侧面板' : '收起右侧面板'}
            >
              <PanelRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 空状态内容 */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            className="w-24 h-24 flex items-center justify-center mb-6"
            style={{
              backgroundColor: 'var(--sketch-paper)',
              border: '3px solid var(--sketch-border)',
              borderRadius: 'var(--wobbly)',
              boxShadow: 'var(--shadow-hard)',
              transform: 'rotate(-2deg)'
            }}
          >
            <FileText className="w-12 h-12" style={{ color: 'var(--sketch-accent)' }} />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
          >
            选择一个知识文件
          </h3>
          <p className="text-center max-w-md mb-6" style={{ color: 'var(--sketch-pencil)' }}>
            从左侧列表中选择一个知识文件来查看其内容详情，或者上传新的知识文件。
          </p>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--sketch-pencil)' }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4caf50' }}></span>
              支持 PDF、Word
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sketch-secondary)' }}></span>
              支持 TXT、MD
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9c27b0' }}></span>
              支持 JSON、CSV
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 渲染内容视图
  return (
    <>
      <div className="flex flex-col h-full font-[var(--font-hand-body)]">
        {/* 顶部工具栏 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b-2 bg-white"
          style={{ borderColor: 'var(--sketch-border)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleLeft}
              className="p-2 rounded-lg transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
              style={{
                backgroundColor: isLeftCollapsed ? 'var(--sketch-paper)' : 'transparent',
                color: isLeftCollapsed ? 'var(--sketch-accent)' : 'var(--sketch-pencil)'
              }}
              title={isLeftCollapsed ? '展开左侧面板' : '收起左侧面板'}
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            {/* 文件标题 */}
            <div className="flex items-center gap-3">
              {fileTypeIcons[item.type]}
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
                >
                  {item.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--sketch-pencil)' }}>
                  {fileTypeLabels[item.type]} · {item.size} · {item.uploadTime}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 操作按钮 */}
            <button
              className="p-2 rounded-lg transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
              style={{ color: 'var(--sketch-pencil)' }}
              title="下载"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
              style={{ color: 'var(--sketch-pencil)' }}
              title="重命名"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
              style={{ color: 'var(--sketch-pencil)' }}
              title="删除"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--sketch-muted)' }} />

            <button
              onClick={onToggleRight}
              className="p-2 rounded-lg transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
              style={{
                backgroundColor: isRightCollapsed ? 'var(--sketch-paper)' : 'transparent',
                color: isRightCollapsed ? 'var(--sketch-accent)' : 'var(--sketch-pencil)'
              }}
              title={isRightCollapsed ? '展开右侧面板' : '收起右侧面板'}
            >
              <PanelRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: 'var(--sketch-bg)' }}>
          <div className="max-w-4xl mx-auto">
            {/* 标签切换 */}
            {item.doc_id && (
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-white/50'
                  }`}
                  style={{
                    color: activeTab === 'preview' ? 'var(--sketch-accent)' : 'var(--sketch-pencil)',
                    border: activeTab === 'preview' ? '2px solid var(--sketch-border)' : '2px solid transparent'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    原始预览
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('chunks')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'chunks'
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-white/50'
                  }`}
                  style={{
                    color: activeTab === 'chunks' ? 'var(--sketch-accent)' : 'var(--sketch-pencil)',
                    border: activeTab === 'chunks' ? '2px solid var(--sketch-border)' : '2px solid transparent'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    分块预览
                  </span>
                </button>
              </div>
            )}

            {/* 内容预览卡片 */}
            <div
              className="bg-white overflow-hidden"
              style={{
                border: '3px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly)',
                boxShadow: 'var(--shadow-hard)'
              }}
            >
              {/* 内容头部 */}
              <div
                className="px-6 py-4 border-b-2"
                style={{ borderColor: 'var(--sketch-muted)', backgroundColor: 'var(--sketch-bg)' }}
              >
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--sketch-pencil)' }}>
                  <Clock className="w-4 h-4" />
                  <span>上传时间：{item.uploadTime}</span>
                  {item.doc_id && (
                    <>
                      <span className="mx-2">·</span>
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                        已索引
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 内容主体 */}
              <div className="p-6">
                {/* 分块预览模式 */}
                {activeTab === 'chunks' && item.doc_id ? (
                  isLoadingChunks ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="mt-4 text-sm" style={{ color: 'var(--sketch-pencil)' }}>
                        正在加载文档分块...
                      </p>
                    </div>
                  ) : chunks.length > 0 ? (
                    <ChunkViewer
                      chunks={chunks}
                      expandable={true}
                      defaultExpanded={false}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Layers className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--sketch-muted)' }} />
                      <p style={{ color: 'var(--sketch-pencil)' }}>
                        暂无分块数据
                      </p>
                    </div>
                  )
                ) : (
                  /* 原始预览模式 */
                  <>
                    {/* PDF 和 Word 使用 DocumentViewer */}
                    {(item.type === 'pdf' || item.type === 'doc') && item.source ? (
                      <div className="h-[600px]">
                        <DocumentViewer
                          fileUrl={item.source}
                          fileType={item.type}
                          fileName={item.name}
                        />
                      </div>
                    ) : item.content ? (
                      <ContentRenderer type={item.type} content={item.content} />
                    ) : (
                      <div className="text-center py-12">
                        <FileType className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--sketch-muted)' }} />
                        <p style={{ color: 'var(--sketch-pencil)' }}>
                          此文件类型暂不支持预览
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--sketch-pencil)' }}>
                          请下载后查看完整内容
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 标签展示 */}
            {item.tags.length > 0 && (
              <div className="mt-6">
                <h4
                  className="text-sm font-bold mb-3"
                  style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
                >
                  标签
                </h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: 'var(--sketch-paper)',
                        color: 'var(--sketch-text)',
                        border: '1px solid var(--sketch-border)',
                        fontFamily: 'var(--font-hand-body)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// 内容渲染器组件
interface ContentRendererProps {
  type: KnowledgeType;
  content: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ type, content }) => {
  // Markdown 渲染
  if (type === 'markdown') {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
      </div>
    );
  }

  // JSON 渲染
  if (type === 'json') {
    try {
      const jsonObj = JSON.parse(content);
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm font-mono">
          {JSON.stringify(jsonObj, null, 2)}
        </pre>
      );
    } catch {
      return <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>;
    }
  }

  // CSV 渲染
  if (type === 'csv') {
    const rows = content.split('\n').map(row => row.split(','));
    return (
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i === 0 ? 'bg-gray-100 dark:bg-gray-700 font-medium' : 'border-t border-gray-100 dark:border-gray-700'}>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 默认文本渲染
  return (
    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
      {content}
    </pre>
  );
};

// 简单的 Markdown 渲染函数
function renderMarkdown(md: string): string {
  return md
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-6">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto my-4"><code>$1</code></pre>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\n/gim, '<br>');
}
