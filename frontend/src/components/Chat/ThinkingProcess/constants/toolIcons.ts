import {
  Search,
  FileText,
  Book,
  Database,
  Code,
  MessageCircle,
  Globe,
  Calculator,
  Brain,
  Cpu,
  Network,
  Sparkles,
  Zap,
  Terminal,
  FileCode,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import type { ToolIconConfig } from '../types';

export const TOOL_ICONS: Record<string, ToolIconConfig> = {
  web_search: {
    icon: Search,
    color: '#3b82f6',
    label: '智能搜索',
    category: 'search',
  },
  websearch: {
    icon: Globe,
    color: '#0ea5e9',
    label: '网络检索',
    category: 'search',
  },
  read_file: {
    icon: FileText,
    color: '#10b981',
    label: '文件解析',
    category: 'file',
  },
  dictionary: {
    icon: Book,
    color: '#f59e0b',
    label: '知识查询',
    category: 'analysis',
  },
  youdaodictionary: {
    icon: Book,
    color: '#f97316',
    label: '词典翻译',
    category: 'analysis',
  },
  rag_search: {
    icon: Database,
    color: '#8b5cf6',
    label: '知识库检索',
    category: 'search',
  },
  exec_code: {
    icon: Code,
    color: '#ef4444',
    label: '代码执行',
    category: 'code',
  },
  assistant_conversation: {
    icon: MessageCircle,
    color: '#ec4899',
    label: '对话分析',
    category: 'communication',
  },
  assistant_knowledge: {
    icon: Brain,
    color: '#a855f7',
    label: '知识推理',
    category: 'analysis',
  },
  skill_download: {
    icon: Cpu,
    color: '#06b6d4',
    label: '技能加载',
    category: 'code',
  },
  material_organizer: {
    icon: Network,
    color: '#84cc16',
    label: '资源整合',
    category: 'analysis',
  },
  word_learning: {
    icon: Sparkles,
    color: '#f472b6',
    label: '词汇学习',
    category: 'analysis',
  },
  remotion: {
    icon: Zap,
    color: '#eab308',
    label: '视频生成',
    category: 'code',
  },
  terminal: {
    icon: Terminal,
    color: '#64748b',
    label: '终端操作',
    category: 'code',
  },
  code_interpreter: {
    icon: FileCode,
    color: '#dc2626',
    label: '代码解释',
    category: 'code',
  },
  data_analysis: {
    icon: BarChart3,
    color: '#0891b2',
    label: '数据分析',
    category: 'analysis',
  },
};

export const DEFAULT_TOOL_ICON: ToolIconConfig = {
  icon: Sparkles,
  color: '#6366f1',
  label: '智能处理',
  category: 'default',
};

export function getToolIconConfig(toolName: string): ToolIconConfig {
  const normalizedName = toolName.toLowerCase().replace(/_/g, '');
  return TOOL_ICONS[normalizedName] || TOOL_ICONS[toolName.toLowerCase()] || DEFAULT_TOOL_ICON;
}

export function getToolCategoryColor(category: ToolIconConfig['category']): string {
  const colors: Record<string, string> = {
    search: '#3b82f6',
    file: '#10b981',
    code: '#ef4444',
    analysis: '#f59e0b',
    communication: '#ec4899',
    default: '#6366f1',
  };
  return colors[category] || colors.default;
}
