// ============================================
// API文档页面样式配置
// ============================================

export const colors = {
  // 主色调
  primary: '#1677ff',
  primaryHover: '#4096ff',
  primaryActive: '#0958d9',

  // 背景色
  bgPrimary: '#ffffff',
  bgSecondary: '#f5f5f5',
  bgTertiary: '#f0f0f0',

  // 文字色
  textPrimary: 'rgba(0, 0, 0, 0.88)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textTertiary: 'rgba(0, 0, 0, 0.45)',

  // 边框色
  border: '#d9d9d9',
  borderSplit: '#f0f0f0',

  // 代码高亮
  codeBg: '#f6f8fa',
  codeText: '#24292f',
} as const;

export const layoutStyles = {
  // 页面布局
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },

  // 头部
  header: {
    height: 64,
    backgroundColor: colors.bgPrimary,
    borderBottom: `1px solid ${colors.borderSplit}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },

  // 主体区域
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  // 侧边栏
  sidebar: {
    width: 280,
    backgroundColor: colors.bgPrimary,
    borderRight: `1px solid ${colors.borderSplit}`,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    padding: '16px 0',
  },

  // 内容区
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '40px 48px',
    maxWidth: 1200,
    margin: '0 auto',
  },

  // 右侧目录
  toc: {
    width: 200,
    padding: '24px 16px',
    borderLeft: `1px solid ${colors.borderSplit}`,
    display: 'none' as const,
  },
} as const;

export const typography = {
  // 标题
  h1: {
    fontSize: 36,
    fontWeight: 600,
    lineHeight: 1.25,
    color: colors.textPrimary,
    marginBottom: 24,
  },
  h2: {
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 1.35,
    color: colors.textPrimary,
    marginTop: 32,
    marginBottom: 16,
  },
  h3: {
    fontSize: 22,
    fontWeight: 600,
    lineHeight: 1.4,
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },

  // 正文
  paragraph: {
    fontSize: 15,
    lineHeight: 1.75,
    color: colors.textSecondary,
    marginBottom: 16,
  },

  // 代码
  code: {
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: 14,
    lineHeight: 1.6,
  },

  // 小字
  small: {
    fontSize: 13,
    color: colors.textTertiary,
  },
} as const;

export const componentStyles = {
  // 按钮
  button: {
    primary: {
      backgroundColor: colors.primary,
      color: '#fff',
      padding: '8px 16px',
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 500,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.textSecondary,
      padding: '8px 16px',
      borderRadius: 6,
      border: `1px solid ${colors.border}`,
      cursor: 'pointer',
      fontSize: 14,
    },
  },

  // 菜单项
  menuItem: {
    padding: '10px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: colors.textSecondary,
    transition: 'all 0.2s',
  },

  menuItemActive: {
    color: colors.primary,
    backgroundColor: 'rgba(22, 119, 255, 0.06)',
    borderRight: `2px solid ${colors.primary}`,
  },

  // 代码块
  codeBlock: {
    backgroundColor: colors.codeBg,
    borderRadius: 8,
    padding: 16,
    overflowX: 'auto' as const,
    marginBottom: 16,
  },

  // 表格
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: 24,
  },

  tableHeader: {
    backgroundColor: colors.bgSecondary,
    fontWeight: 600,
    textAlign: 'left' as const,
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.border}`,
  },

  tableCell: {
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.borderSplit}`,
  },
} as const;

export const markdownStyles = {
  // Markdown 内容样式
  wrapper: {
    lineHeight: 1.75,
    color: colors.textSecondary,
  },

  // 代码行内
  inlineCode: {
    backgroundColor: colors.codeBg,
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: typography.code.fontFamily,
    fontSize: 13,
    color: colors.codeText,
  },

  // 引用块
  blockquote: {
    borderLeft: `4px solid ${colors.primary}`,
    paddingLeft: 16,
    marginLeft: 0,
    color: colors.textTertiary,
    fontStyle: 'italic' as const,
  },

  // 列表
  list: {
    paddingLeft: 24,
    marginBottom: 16,
  },

  listItem: {
    marginBottom: 8,
  },

  // 链接
  link: {
    color: colors.primary,
    textDecoration: 'none',
  },

  linkHover: {
    textDecoration: 'underline',
  },
} as const;
