// API 文档 Markdown 样式 - 完全参考 Chat 页面的简洁实用风格

export const markdownStyles = {
  // 内层容器 - 只控制内容边距
  container: {
    padding: '60px 60px 80px',
  },

  // 标题层级 - 大幅增大各级标题大小差距
  h1: {
    fontSize: '2.8rem',
    fontWeight: 700,
    color: '#000',
    marginTop: '3rem',
    marginBottom: '2rem',
    paddingBottom: '0.8rem',
    borderBottom: '1px solid #d9d9d9',
    lineHeight: 1.2,
  },

  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#000',
    marginTop: '2.8rem',
    marginBottom: '1.5rem',
    paddingBottom: '0.6rem',
    borderBottom: '1px solid #e0e0e0',
    lineHeight: 1.3,
  },

  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#000',
    marginTop: '2.2rem',
    marginBottom: '1.2rem',
    lineHeight: 1.35,
  },

  h4: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#000',
    marginTop: '1.8rem',
    marginBottom: '1rem',
    lineHeight: 1.4,
  },

  h5: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#000',
    marginTop: '1.5rem',
    marginBottom: '0.8rem',
    lineHeight: 1.4,
  },

  h6: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#666',
    marginTop: '1.2rem',
    marginBottom: '0.6rem',
    lineHeight: 1.4,
  },

  // 段落
  p: {
    marginBottom: '1rem',
    color: '#000',
    lineHeight: 1.75,
  },

  // 链接
  a: {
    color: '#0066cc',
    textDecoration: 'none',
  },

  aHover: {
    textDecoration: 'underline',
  },

  // 无序列表
  ul: {
    marginBottom: '1rem',
    paddingLeft: '1.5rem',
    listStyleType: 'disc',
  },

  // 有序列表
  ol: {
    marginBottom: '1rem',
    paddingLeft: '1.5rem',
  },

  // 列表项
  li: {
    marginBottom: '0.25rem',
    lineHeight: 1.75,
    color: '#000',
  },

  // 列表项标记（使用默认样式）
  liMarker: {
    display: 'none',
  },

  // 嵌套列表
  nestedList: {
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  },

  // 强调
  strong: {
    fontWeight: 700,
    color: '#000',
  },

  em: {
    fontStyle: 'italic',
    color: '#000',
  },

  // 删除线
  del: {
    textDecoration: 'line-through',
    color: '#666',
  },

  // 行内代码 - Chat 风格: 浅灰背景
  inlineCode: {
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    backgroundColor: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.9em',
    color: '#000',
  },

  // 代码块容器 - Chat 风格: bg-gray-100, border-gray-300
  codeBlock: {
    backgroundColor: '#f3f4f6',  // gray-100
    border: '1px solid #d1d5db', // gray-300
    borderRadius: '8px',
    marginBottom: '1rem',
    marginTop: '1rem',
    overflow: 'hidden',
  },

  // 代码块头部 - Chat 风格: bg-gray-200
  codeBlockHeader: {
    backgroundColor: '#e5e7eb',  // gray-200
    padding: '8px 16px',
    fontSize: '12px',
    color: '#374151',  // gray-700
    borderBottom: '1px solid #d1d5db',  // gray-300
    fontFamily: 'SFMono-Regular, Consolas, monospace',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
  },

  // 代码块内容
  codeBlockPre: {
    margin: 0,
    padding: '16px',
    overflowX: 'auto' as const,
    backgroundColor: '#f3f4f6',  // gray-100
  },

  // 代码块内的 code
  codeBlockCode: {
    backgroundColor: 'transparent',
    padding: 0,
    border: 'none',
    fontSize: '14px',
    lineHeight: 1.6,
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    color: '#000',
  },

  // 引用块 - Chat 风格
  blockquote: {
    borderLeft: '4px solid #9ca3af',  // gray-400
    paddingLeft: '16px',
    marginLeft: 0,
    marginBottom: '1rem',
    marginTop: '1rem',
    fontStyle: 'italic',
    backgroundColor: '#f3f4f6',  // gray-100
    padding: '12px 16px',
    borderRadius: '0 4px 4px 0',
    color: '#000',
  },

  // 表格容器 - Chat 风格: border-gray-300
  tableWrapper: {
    overflowX: 'auto' as const,
    marginBottom: '1rem',
    marginTop: '1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',  // gray-300
  },

  // 表格 - Chat 风格
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
    fontSize: '14px',
    minWidth: '100%',
  },

  // 表头 - Chat 风格: bg-gray-100
  thead: {
    backgroundColor: '#f3f4f6',  // gray-100
  },

  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#000',
    border: '1px solid #d1d5db',  // gray-300
  },

  // 表格单元格
  td: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',  // gray-300
    color: '#000',
    lineHeight: 1.5,
  },

  // 表格行
  tr: {
    borderBottom: '1px solid #d1d5db',  // gray-300
  },

  // 表格行悬停 - Chat 风格: hover:bg-gray-50
  trHover: {
    backgroundColor: '#f9fafb',  // gray-50
  },

  // 分隔线
  hr: {
    border: 'none',
    height: '1px',
    backgroundColor: '#d1d5db',  // gray-300
    margin: '2rem 0',
  },

  // 图片
  img: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    border: '1px solid #d1d5db',  // gray-300
    display: 'block',
    margin: '1.5rem auto',
  },

  // 图片标题
  figcaption: {
    textAlign: 'center' as const,
    fontSize: '0.9em',
    color: '#6b7280',  // gray-500
    marginTop: '0.5rem',
  },

  // 任务列表
  taskList: {
    listStyleType: 'none',
    paddingLeft: '1.5rem',
  },

  taskListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },

  // 复选框
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    marginRight: '8px',
  },

  // 上标下标
  sup: {
    fontSize: '0.75em',
    verticalAlign: 'super',
  },

  sub: {
    fontSize: '0.75em',
    verticalAlign: 'sub',
  },

  // 高亮标记
  mark: {
    backgroundColor: '#fef3c7',  // amber-100
    padding: '0.15em 0.4em',
    borderRadius: '3px',
  },
};
