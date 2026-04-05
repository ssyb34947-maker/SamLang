import React from 'react';
import {
  PanelRight,
  FileText,
  Clock,
  HardDrive,
  Tag,
  Info,
  FileType
} from 'lucide-react';
import { OptionalRightPanelProps, KnowledgeType } from './types';

/**
 * OptionalRightPanel - 右侧面板组件（可选）
 *
 * 功能：
 * - 显示选中知识的详细信息
 * - 元数据展示
 * - 标签管理
 * - 可折叠/展开
 */

// 文件类型图标
const fileTypeIcons: Record<KnowledgeType, React.ReactNode> = {
  pdf: <FileType className="w-8 h-8 text-red-500" />,
  doc: <FileText className="w-8 h-8 text-blue-500" />,
  text: <FileText className="w-8 h-8 text-gray-500" />,
  markdown: <FileText className="w-8 h-8 text-purple-500" />,
  json: <FileText className="w-8 h-8 text-yellow-500" />,
  csv: <FileText className="w-8 h-8 text-green-500" />,
  other: <FileText className="w-8 h-8 text-gray-400" />
};

// 文件类型标签
const fileTypeLabels: Record<KnowledgeType, string> = {
  pdf: 'PDF 文档',
  doc: 'Word 文档',
  text: '文本文件',
  markdown: 'Markdown 文档',
  json: 'JSON 文件',
  csv: 'CSV 表格',
  other: '其他文件'
};

export const OptionalRightPanel: React.FC<OptionalRightPanelProps> = ({
  item,
  isCollapsed,
  onToggle
}) => {
  // 折叠状态 - 显示展开按钮
  if (isCollapsed) {
    return (
      <div className="h-full flex items-center justify-center">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title="展开信息面板"
        >
          <PanelRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          详细信息
        </h3>
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title="收起信息面板"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {!item ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              选择一个知识文件查看详细信息
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 文件图标和名称 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {fileTypeIcons[item.type]}
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white break-all">
                {item.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {fileTypeLabels[item.type]}
              </p>
            </div>

            {/* 元数据信息 */}
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                基本信息
              </h5>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <HardDrive className="w-4 h-4" />
                    <span>文件大小</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.size}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>上传时间</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.uploadTime}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span>文件类型</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* 标签 */}
            <div>
              <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                标签
              </h5>
              {item.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  暂无标签
                </p>
              )}
            </div>

            {/* 摘要 */}
            {item.summary && (
              <div>
                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  摘要
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            )}

            {/* 操作提示 */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                提示：在中间面板可以查看完整内容预览
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
