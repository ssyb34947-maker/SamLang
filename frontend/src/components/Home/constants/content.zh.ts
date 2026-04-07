// ============================================
// 页面文案常量 - 首页所有文字内容集中管理 (中文版)
// ============================================

// ===== 品牌信息 =====
export const BRAND = {
  NAME: 'Sam College',
  SLOGAN: '山姆学院',
  SUB_SLOGAN: '全学科 AI 教学平台，让知识触手可及。\n支持 Open Claw 系统级运行，构建自更新知识库，追踪学习进度，打造个性化学习体验',
  TAGLINE: 'written by Sam',
} as const;

// ===== 导航 =====
export const NAVIGATION = {
  LINKS: [
    { label: '功能', href: '#features' },
    { label: '使用方法', href: '#how-it-works' },
    { label: '用户评价', href: '#testimonials' },
    { label: 'API 服务', href: '/api/docs', isExternal: false },
    { label: 'Demo 演示', href: '#demo', isExternal: false },
  ],
  BUTTONS: {
    LOGIN: '登录',
    REGISTER: '注册',
    DOWNLOAD: '下载客户端',
  },
} as const;

// ===== 外部链接 =====
export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com/ssyb34947-maker/SamLang',
  DOWNLOAD_WINDOWS: '#download-windows',
} as const;

// ===== Hero区域 =====
export const HERO = {
  BADGE: '全学科 AI 教学平台',
  CTA: {
    PRIMARY: '免费开始学习',
    SECONDARY_GUEST: '登录',
    SECONDARY_AUTH: '进入学习',
  },
  TRUST_BADGES: ['免费开始', '全学科覆盖', '随时取消'],
  DEMO: {
    TITLE: '{BRAND} Agent',
    AI_MESSAGES: [
      '你好！我是山姆教授。今天想学习什么内容？我会用最适合你的方法教会你。',
      '好的！让我为你整理圆锥曲线的核心知识点...相关数据已经保存，你也可以查看我为你准备的视频...',
    ],
    USER_MESSAGE: '我想复习高中数学的圆锥曲线部分',
    INPUT_PLACEHOLDER: '输入消息...',
  },
} as const;

// ===== 功能特性 =====
export const FEATURES_SECTION = {
  TITLE: '强大功能，助力学习',
  SUBTITLE: '12+ 核心功能，覆盖学习全流程，让全学科学习变得更加高效、有趣',
} as const;

export const FEATURES_LIST = [
  {
    id: 'ai-chat',
    title: '教授级授课',
    description: '集成最前沿智能体算法的教授AGENT，提供超越chatbot的教学体验',
    icon: 'MessageCircle',
  },
  {
    id: 'conversation-mgmt',
    title: '策略自迭代',
    description: '基于Open CLaw的记忆系统，24小时自动更新教学策略',
    icon: 'MessagesSquare',
  },
  {
    id: 'all-subjects',
    title: '全学科教学',
    description: '覆盖数学、物理、化学、英语等全学科内容，支持输出教学视频',
    icon: 'BookOpen',
  },
  {
    id: 'open-claw',
    title: 'Open Claw 系统',
    description: '系统级运行能力，深度集成操作系统，提供"养龙虾"的体验',
    icon: 'Terminal',
  },
  {
    id: 'knowledge-base',
    title: '自支持知识库',
    description: '上传文档、PDF、笔记，AI 自动整理、归纳、关联知识点，构建个人知识网络',
    icon: 'Database',
  },
  {
    id: 'self-update',
    title: '自更新知识库',
    description: '知识库持续进化，AI 自动发现新知识、更新旧内容，保持知识体系的前沿性',
    icon: 'RefreshCw',
  },
  {
    id: 'study-dashboard',
    title: '学习看板',
    description: '可视化展示学习进度、知识点掌握情况、学习时间分布，让进步一目了然',
    icon: 'TrendingUp',
  },
  {
    id: 'data-analysis',
    title: 'AI数据分析',
    description: '机器学习算法迭代，多维度洞察学习表现',
    icon: 'BarChart3',
  },
  {
    id: 'agent-cli',
    title: 'Agent 终端助教',
    description: '关注用户学习进度、反馈、需求，智能调整教学策略，提供个性化学习体验',
    icon: 'Command',
  },
  {
    id: 'pdf-viewer',
    title: '笔记管理',
    description: '内置 Markdown 编辑器，支持标注、笔记、AI 智能解析文档内容',
    icon: 'FileText',
  },
  {
    id: 'personal-info',
    title: '精准施教',
    description: '基于机器学习算法，由SKILL驱动。根据用户学习习惯、进度、反馈等特征，动态调整教学策略',
    icon: 'User',
  },
  {
    id: 'sketch-style',
    title: '手绘风格界面',
    description: '独特的草稿本设计风格，米白色背景，护眼模式，减少学习压力',
    icon: 'Pencil',
  },
] as const;

// ===== 使用方法 =====
export const HOW_IT_WORKS_SECTION = {
  TITLE: '三步开启学习之旅',
  SUBTITLE: '简单上手，立即开始你的学习之旅',
} as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: '注册登录',
    description: '算法冷启动，入学即破冰',
  },
  {
    step: 2,
    title: '自由学习',
    description: '尽情使用整个学院资源',
  },
  {
    step: 3,
    title: '反馈迭代',
    description: '学习后无需关心总结，学院团队自动更新',
  },
] as const;

// ===== 用户评价 =====
export const TESTIMONIALS_SECTION = {
  TITLE: '用户怎么说',
  SUBTITLE: '来自真实用户的反馈',
} as const;

export const TESTIMONIALS_LIST = [
  {
    id: 1,
    name: '周瑜',
    role: '大都督',
    content: '山姆真是有伯牙子期之才啊。',
    avatar: 'Z',
  },
  {
    id: 2,
    name: '刘备',
    role: '汉左将军宜城亭侯领豫州牧、皇叔',
    content: '云从龙，风从虎，龙虎英雄傲苍穹。',
    avatar: 'L',
  },
  {
    id: 3,
    name: '公孙瓒',
    role: '幽州太守',
    content: '真可谓是天下谁人不识君啊。',
    avatar: 'GS',
  },
  {
    id: 4,
    name: '关羽',
    role: '汉寿亭侯',
    content: '山姆说的痛彻，当浮一大白。',
    avatar: 'G',
  },
  {
    id: 5,
    name: '曹操',
    role: '丞相',
    content: '山姆你走了，我们吃什么？',
    avatar: 'C',
  },
  {
    id: 6,
    name: '张飞',
    role: '屠猪卖酒之辈',
    content: '(指着山姆)我看你是舍不得这张帅案吧。',
    avatar: 'Z',
  },
] as const;

// ===== CTA区域 =====
export const CTA_SECTION = {
  BADGE: '准备好开始了吗？',
  TITLE: '加入 {BRAND}，开启你的\n山姆学院之旅',
  SUBTITLE: '免费注册，立即入学山姆学院',
  BUTTONS: {
    PRIMARY: '免费开始使用',
    SECONDARY: '先试试看',
  },
  FOOTER_NOTE: '无任何费用 · 随时取消 · 免费版可用',
} as const;

// ===== 页脚 =====
export const FOOTER = {
  TAGLINE: '山姆学院，让每一分钟的学习都有价值。',
  COPYRIGHT: '© 2026 {BRAND}. All rights reserved.',
  MADE_WITH: 'Made with ❤️ for every learner',
  LINK_GROUPS: [
    {
      title: '产品',
      links: ['功能介绍', '定价方案', '更新日志', '路线图'],
    },
    {
      title: '资源',
      links: ['帮助中心', 'API 文档', '社区论坛', '博客'],
    },
    {
      title: '公司',
      links: ['关于我们', '联系我们', '隐私政策', '服务条款'],
    },
  ],
  SOCIAL: {
    GITHUB: { label: 'GitHub', href: 'https://github.com/ssyb34947-maker/SamLang' },
    TWITTER: { label: 'Twitter', href: '#' },
    EMAIL: { label: 'Email', href: '#' },
  },
} as const;

// ===== 下载相关 =====
export const DOWNLOAD = {
  WINDOWS: {
    LABEL: '下载 Windows 客户端',
    DESCRIPTION: '支持 Windows 10/11',
    BUTTON_TEXT: '立即下载',
  },
} as const;
