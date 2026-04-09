// ============================================
// 功能特性分类常量
// 分为：用户功能（可见）和 系统算法（底层）
// ============================================

import { LucideIcon, MessageCircle, BookOpen, Database, TrendingUp, FileText, User, Pencil, MessagesSquare, Terminal, RefreshCw, BarChart3, Command } from 'lucide-react';

// 图标映射表
export const iconMap: Record<string, LucideIcon> = {
  MessageCircle,
  MessagesSquare,
  BookOpen,
  Terminal,
  Database,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Command,
  FileText,
  User,
  Pencil,
};

// 功能项类型定义
export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// 功能分类类型
export interface FeatureCategory {
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

// 用户功能 - 用户直接感知和使用的功能
export const USER_FEATURES: FeatureCategory = {
  title: '用户功能',
  subtitle: '为学习者打造的直观体验',
  features: [
    {
      id: 'ai-chat',
      title: '教授授课',
      description: '集成最前沿智能体算法的教授AGENT，提供超越chatbot的教学体验',
      icon: 'MessageCircle',
    },
    {
      id: 'all-subjects',
      title: '全学科教学',
      description: '覆盖数学、物理、化学、英语等全学科内容，支持输出教学视频等多模态教学',
      icon: 'BookOpen',
    },
    {
      id: 'knowledge-base',
      title: '自支持知识库',
      description: '上传文档、PDF、笔记，AI 自动整理、归纳、关联知识点，构建个人知识网络',
      icon: 'Database',
    },
    {
      id: 'study-dashboard',
      title: '学习看板',
      description: '可视化展示学习进度、知识点掌握情况、学习时间分布，让进步一目了然',
      icon: 'TrendingUp',
    },
    {
      id: 'pdf-viewer',
      title: '笔记管理',
      description: '内置 Markdown 编辑器，支持标注、笔记、AI 智能解析文档内容',
      icon: 'FileText',
    },
    {
      id: 'sketch-style',
      title: '多风格系统+双语',
      description: '支持5种风格和中英文双语系统',
      icon: 'Pencil',
    },
  ],
};

// 系统算法 - 底层支撑能力（用户不可见但受益）
export const SYSTEM_FEATURES: FeatureCategory = {
  title: '系统算法',
  subtitle: '智能驱动的底层技术支撑',
  features: [
    {
      id: 'conversation-mgmt',
      title: '策略自迭代',
      description: '基于Open CLaw的记忆系统，24小时自动更新教学策略',
      icon: 'MessagesSquare',
    },
    {
      id: 'open-claw',
      title: 'Open Claw 系统',
      description: '系统级运行能力，深度集成操作系统，提供"养龙虾"的体验',
      icon: 'Terminal',
    },
    {
      id: 'self-update',
      title: '自更新知识库',
      description: '知识库持续进化，AI 自动发现新知识、更新旧内容，保持知识体系的前沿性',
      icon: 'RefreshCw',
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
      id: 'personal-info',
      title: '精准施教',
      description: '基于机器学习算法，由SKILL驱动。根据用户学习习惯、进度、反馈等特征，动态调整教学策略',
      icon: 'User',
    },
  ],
};

// 页面级标题
export const FEATURES_PAGE_TITLE = '强大功能，助力学习';
export const FEATURES_PAGE_SUBTITLE = '12+ 核心功能，覆盖学习全流程，让全学科学习变得更加高效、有趣';
