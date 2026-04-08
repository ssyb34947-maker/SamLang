// ============================================
// API文档页面常量配置
// ============================================

export const API_DOCS_CONFIG = {
  // 页面基础信息
  PAGE_TITLE: 'API 文档中心',
  PAGE_TITLE_EN: 'API Documentation Center',
  PAGE_DESCRIPTION: 'Sam College API 接口文档，帮助开发者快速接入',
  PAGE_DESCRIPTION_EN: 'Sam College API documentation for developers',

  // 侧边栏配置
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 64,

  // 代码主题
  CODE_THEME: 'github',

  // 默认展开层级
  DEFAULT_EXPAND_LEVEL: 2,

  // 文档路径
  docsPath: '/apidocs',
  defaultDoc: 'overview',

  // 侧边栏默认展开
  sidebar: {
    defaultExpanded: true,
  },
} as const;

// 文档分类
export const DOC_CATEGORIES = [
  {
    id: 'getting-started',
    title: '快速开始',
    titleEn: 'Getting Started',
    icon: 'Rocket',
    children: [
      { id: 'overview', title: '概述', titleEn: 'Overview', file: 'overview.md' },
      { id: 'authentication', title: '认证授权', titleEn: 'Authentication', file: 'authentication.md' },
      { id: 'quickstart', title: '快速接入', titleEn: 'Quick Start', file: 'quickstart.md' },
    ],
  },
  {
    id: 'api-reference',
    title: 'API 参考',
    titleEn: 'API Reference',
    icon: 'Code',
    children: [
      { id: 'api-reference', title: 'API 参考', titleEn: 'API Reference', file: 'api-reference.md' },
    ],
  },
  {
    id: 'best-practices',
    title: '最佳实践',
    titleEn: 'Best Practices',
    icon: 'Lightbulb',
    children: [
      { id: 'best-practices', title: '最佳实践', titleEn: 'Best Practices', file: 'best-practices.md' },
    ],
  },
] as const;

// 代码示例语言
export const CODE_LANGUAGES = [
  { id: 'curl', name: 'cURL', icon: 'Terminal' },
  { id: 'javascript', name: 'JavaScript', icon: 'Code' },
  { id: 'python', name: 'Python', icon: 'Code' },
  { id: 'java', name: 'Java', icon: 'Coffee' },
  { id: 'go', name: 'Go', icon: 'Code' },
] as const;

// 响应式断点
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;
