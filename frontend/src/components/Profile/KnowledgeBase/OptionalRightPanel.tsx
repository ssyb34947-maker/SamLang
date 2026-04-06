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
          className="p-2 rounded-lg transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
          style={{ color: 'var(--sketch-pencil)' }}
          title="展开信息面板"
        >
          <PanelRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-[var(--font-hand-body)]">
      {/* 头部 */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b-2"
        style={{ borderColor: 'var(--sketch-border)' }}
      >
        <h3
          className="text-sm font-bold"
          style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
        >
          详细信息
        </h3>
        <button
          onClick={onToggle}
          className="p-1.5 rounded transition-all hover:shadow-[var(--shadow-hover)] hover:translate-x-[1px] hover:translate-y-[1px]"
          style={{ color: 'var(--sketch-pencil)' }}
          title="收起信息面板"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {!item ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--sketch-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--sketch-pencil)' }}>
              选择一个知识文件查看详细信息
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 文件图标和名称 */}
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-3 flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--sketch-paper)',
                  border: '2px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly-sm)',
                  boxShadow: 'var(--shadow-hard)',
                  transform: 'rotate(-1deg)'
                }}
              >
                {fileTypeIcons[item.type]}
              </div>
              <h4
                className="text-sm font-bold break-all"
                style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
              >
                {item.name}
              </h4>
              <p className="text-xs mt-1" style={{ color: 'var(--sketch-pencil)' }}>
                {fileTypeLabels[item.type]}
              </p>
            </div>

            {/* 元数据信息 */}
            <div className="space-y-3">
              <h5
                className="text-xs font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-pencil)' }}
              >
                基本信息
              </h5>

              <div className="space-y-2">
                <div
                  className="flex items-center justify-between py-2 border-b-2"
                  style={{ borderColor: 'var(--sketch-muted)' }}
                >
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--sketch-pencil)' }}>
                    <HardDrive className="w-4 h-4" />
                    <span>文件大小</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--sketch-text)' }}>
                    {item.size}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between py-2 border-b-2"
                  style={{ borderColor: 'var(--sketch-muted)' }}
                >
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--sketch-pencil)' }}>
                    <Clock className="w-4 h-4" />
                    <span>上传时间</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--sketch-text)' }}>
                    {item.uploadTime}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between py-2 border-b-2"
                  style={{ borderColor: 'var(--sketch-muted)' }}
                >
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--sketch-pencil)' }}>
                    <FileText className="w-4 h-4" />
                    <span>文件类型</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--sketch-text)' }}>
                    {item.type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* 标签 */}
            <div>
              <h5
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-pencil)' }}
              >
                标签
              </h5>
              {item.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: 'var(--sketch-paper)',
                        color: 'var(--sketch-text)',
                        border: '1px solid var(--sketch-border)',
                        fontFamily: 'var(--font-hand-body)'
                      }}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: 'var(--sketch-pencil)' }}>
                  暂无标签
                </p>
              )}
            </div>

            {/* 摘要 */}
            {item.summary && (
              <div>
                <h5
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-pencil)' }}
                >
                  摘要
                </h5>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--sketch-text)' }}>
                  {item.summary}
                </p>
              </div>
            )}

            {/* 操作提示 */}
            <div className="pt-4 border-t-2" style={{ borderColor: 'var(--sketch-muted)' }}>
              <p className="text-xs" style={{ color: 'var(--sketch-pencil)' }}>
                提示：在中间面板可以查看完整内容预览
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
