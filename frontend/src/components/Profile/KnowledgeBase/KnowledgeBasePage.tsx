import React from 'react';
import { KnowledgeNotebookLayout } from './KnowledgeNotebookLayout';

/**
 * KnowledgeBase 页面组件
 * 
 * 使用三栏布局（类似 Google NotebookLM）：
 * - 左侧：Sources 面板（知识来源列表）
 * - 中间：Main Content 面板（内容展示）
 * - 右侧：Info 面板（详细信息）
 */
export const KnowledgeBasePage: React.FC = () => {
  return (
    <div className="h-full">
      <KnowledgeNotebookLayout />
    </div>
  );
};
