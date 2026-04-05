import React from 'react';
import { 
  FileText, 
  PanelLeft, 
  PanelRight, 
  Download, 
  Trash2, 
  Edit3,
  Clock,
  FileType,
  FileCode
} from 'lucide-react';
import { MainContentPanelProps, KnowledgeType } from './types';

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
  // 渲染空状态
  if (!item) {
    return (
      <div className="flex flex-col h-full">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLeft}
              className={`p-2 rounded-lg transition-colors ${
                isLeftCollapsed 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title={isLeftCollapsed ? '展开左侧面板' : '收起左侧面板'}
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleRight}
              className={`p-2 rounded-lg transition-colors ${
                isRightCollapsed 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title={isRightCollapsed ? '展开右侧面板' : '收起右侧面板'}
            >
              <PanelRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 空状态内容 */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            选择一个知识文件
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
            从左侧列表中选择一个知识文件来查看其内容详情，或者上传新的知识文件。
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              支持 PDF、Word
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              支持 TXT、MD
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              支持 JSON、CSV
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 渲染内容视图
  return (
    <div className="flex flex-col h-full">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLeft}
            className={`p-2 rounded-lg transition-colors ${
              isLeftCollapsed 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title={isLeftCollapsed ? '展开左侧面板' : '收起左侧面板'}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          {/* 文件标题 */}
          <div className="flex items-center gap-3">
            {fileTypeIcons[item.type]}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fileTypeLabels[item.type]} · {item.size} · {item.uploadTime}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 操作按钮 */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="下载"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="重命名"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="删除"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          
          <button
            onClick={onToggleRight}
            className={`p-2 rounded-lg transition-colors ${
              isRightCollapsed 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title={isRightCollapsed ? '展开右侧面板' : '收起右侧面板'}
          >
            <PanelRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* 内容预览卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* 内容头部 */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>上传时间：{item.uploadTime}</span>
              </div>
            </div>

            {/* 内容主体 */}
            <div className="p-6">
              {item.content ? (
                <ContentRenderer type={item.type} content={item.content} />
              ) : (
                <div className="text-center py-12">
                  <FileType className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    此文件类型暂不支持预览
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    请下载后查看完整内容
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 标签展示 */}
          {item.tags.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                标签
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
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
