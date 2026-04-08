/**
 * API 文档站点配置
 * 修改此文件可自定义文档站点的行为、外观和功能
 */

export interface ApiDocsSettings {
  // 站点基本信息
  site: {
    title: string;
    titleEn: string;
    description: string;
    logo: string;
    favicon: string;
  };

  // 文档配置
  docs: {
    // Markdown 文件存放路径（相对于 public 目录）
    path: string;
    // 默认打开的文档
    defaultDoc: string;
    // 文档版本
    version: string;
  };

  // 侧边栏配置
  sidebar: {
    // 默认是否展开
    defaultExpanded: boolean;
    // 是否允许折叠
    collapsible: boolean;
    // 默认展开的目录
    defaultExpandedCategories: string[];
  };

  // 主题配置
  theme: {
    // 主色调
    primaryColor: string;
    // 是否支持深色模式
    darkMode: boolean;
    // 默认主题: 'light' | 'dark' | 'system'
    defaultTheme: 'light' | 'dark' | 'system';
  };

  // 代码块配置
  codeBlock: {
    // 是否显示行号
    showLineNumbers: boolean;
    // 是否支持复制
    allowCopy: boolean;
    // 默认语言
    defaultLanguage: string;
    // 支持的语言列表
    supportedLanguages: string[];
  };

  // 搜索配置
  search: {
    // 是否启用搜索
    enabled: boolean;
    // 搜索占位符
    placeholder: string;
    // 最小搜索字符数
    minChars: number;
  };

  // 目录配置
  toc: {
    // 是否显示目录
    enabled: boolean;
    // 最小标题级别
    minLevel: number;
    // 最大标题级别
    maxLevel: number;
  };

  // 导航配置
  nav: {
    // 是否显示编辑按钮
    showEditButton: boolean;
    // 编辑链接模板，{path} 会被替换为文档路径
    editLinkTemplate: string;
    // 是否显示最后更新时间
    showLastUpdated: boolean;
  };

  // 多语言配置
  i18n: {
    // 默认语言
    defaultLocale: string;
    // 支持的语言列表
    locales: string[];
    // 语言名称映射
    localeNames: Record<string, string>;
  };

  // 页脚配置
  footer: {
    // 是否显示页脚
    enabled: boolean;
    // 版权信息
    copyright: string;
    // 链接组
    links: Array<{
      title: string;
      items: Array<{
        text: string;
        link: string;
      }>;
    }>;
  };

  // 性能配置
  performance: {
    // 是否懒加载文档
    lazyLoad: boolean;
    // 预加载相邻文档
    prefetchNeighbors: boolean;
    // 缓存时间（分钟）
    cacheTime: number;
  };
}

// 默认配置
const defaultSettings: ApiDocsSettings = {
  site: {
    title: 'SamLang API 文档',
    titleEn: 'SamLang API Documentation',
    description: 'SamLang API 官方文档中心',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
  },

  docs: {
    path: '/docs',
    defaultDoc: 'overview',
    version: 'v1.0.0',
  },

  sidebar: {
    defaultExpanded: true,
    collapsible: true,
    defaultExpandedCategories: ['getting-started'],
  },

  theme: {
    primaryColor: '#1677ff',
    darkMode: true,
    defaultTheme: 'system',
  },

  codeBlock: {
    showLineNumbers: true,
    allowCopy: true,
    defaultLanguage: 'javascript',
    supportedLanguages: [
      'javascript',
      'typescript',
      'python',
      'go',
      'java',
      'bash',
      'json',
      'html',
      'css',
      'sql',
      'yaml',
      'markdown',
    ],
  },

  search: {
    enabled: true,
    placeholder: '搜索文档...',
    minChars: 2,
  },

  toc: {
    enabled: true,
    minLevel: 2,
    maxLevel: 4,
  },

  nav: {
    showEditButton: true,
    editLinkTemplate: 'https://github.com/your-repo/edit/main/docs/{path}',
    showLastUpdated: true,
  },

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en-US'],
    localeNames: {
      'zh-CN': '简体中文',
      'en-US': 'English',
    },
  },

  footer: {
    enabled: true,
    copyright: '© 2024 SamLang. All rights reserved.',
    links: [
      {
        title: '产品',
        items: [
          { text: '功能介绍', link: '/features' },
          { text: '定价方案', link: '/pricing' },
          { text: '更新日志', link: '/changelog' },
        ],
      },
      {
        title: '资源',
        items: [
          { text: 'API 文档', link: '/docs' },
          { text: 'SDK 下载', link: '/sdk' },
          { text: '示例代码', link: '/examples' },
        ],
      },
      {
        title: '支持',
        items: [
          { text: '帮助中心', link: '/help' },
          { text: '社区论坛', link: '/community' },
          { text: '联系我们', link: '/contact' },
        ],
      },
    ],
  },

  performance: {
    lazyLoad: true,
    prefetchNeighbors: true,
    cacheTime: 30,
  },
};

// 合并用户配置和默认配置
export const createSettings = (
  userSettings?: Partial<ApiDocsSettings>
): ApiDocsSettings => {
  return {
    ...defaultSettings,
    ...userSettings,
    // 深度合并嵌套对象
    site: { ...defaultSettings.site, ...userSettings?.site },
    docs: { ...defaultSettings.docs, ...userSettings?.docs },
    sidebar: { ...defaultSettings.sidebar, ...userSettings?.sidebar },
    theme: { ...defaultSettings.theme, ...userSettings?.theme },
    codeBlock: { ...defaultSettings.codeBlock, ...userSettings?.codeBlock },
    search: { ...defaultSettings.search, ...userSettings?.search },
    toc: { ...defaultSettings.toc, ...userSettings?.toc },
    nav: { ...defaultSettings.nav, ...userSettings?.nav },
    i18n: { ...defaultSettings.i18n, ...userSettings?.i18n },
    footer: { ...defaultSettings.footer, ...userSettings?.footer },
    performance: { ...defaultSettings.performance, ...userSettings?.performance },
  };
};

// 导出默认配置实例
export default createSettings();

// 配置验证函数
export const validateSettings = (settings: ApiDocsSettings): string[] => {
  const errors: string[] = [];

  if (!settings.site.title) {
    errors.push('站点标题不能为空');
  }

  if (!settings.docs.path) {
    errors.push('文档路径不能为空');
  }

  if (settings.toc.minLevel > settings.toc.maxLevel) {
    errors.push('目录最小级别不能大于最大级别');
  }

  if (settings.search.minChars < 1) {
    errors.push('搜索最小字符数必须大于 0');
  }

  if (settings.performance.cacheTime < 0) {
    errors.push('缓存时间不能为负数');
  }

  return errors;
};
