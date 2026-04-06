import type { BootLogItem } from './types';

// CLI 配色方案
export const CLI_COLORS = {
  background: '#1e1e1e',
  backgroundLight: '#2a2a2a',
  border: '#3d3d3d',
  text: '#e5e0d8',
  textMuted: '#9ca3af',
  accent: '#5a8a9c',
  accent2: '#6b9b7a',
  accent3: '#c4a86b',
  accent4: '#9c6b6b',
  accent5: '#8b7d9c',
  prompt: '#6b9b7a',
} as const;

// ASCII Logo
export const ASCII_LOGO = [
  '',
  '   ███████╗ █████╗ ███╗   ███╗      ██████╗  ██████╗ ██╗     ██╗     ███████╗██████╗  ███████╗',
  '   ██╔════╝██╔══██╗████╗ ████║     ██╔════╝ ██╔═══██╗██║     ██║     ██╔════╝██╔════╝ ██╔════╝',
  '   ███████╗███████║██╔████╔██║     ██║      ██║   ██║██║     ██║     █████╗  ██║  ███╗█████╗  ',
  '   ╚════██║██╔══██║██║╚██╔╝██║     ██║      ██║   ██║██║     ██║     ██╔══╝  ██║   ██║██╔══╝  ',
  '   ███████║██║  ██║██║ ╚═╝ ██║     ╚██████╗ ╚██████╔╝███████╗███████╗███████╗╚██████╔╝███████╗',
  '   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝      ╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚══════╝',
  '',
  '                    Intelligent Learning Assistant v2.0.1',
  '',
];

// 启动日志序列
export const BOOT_LOGS: BootLogItem[] = [
  { content: '➜  Initializing SamLang Kernel...', progress: 10, delay: 800 },
  { content: '➜  Loading neural network modules...', progress: 25, delay: 600 },
  { content: '➜  Mounting knowledge base volumes...', progress: 40, delay: 500 },
  { content: '➜  Connecting to vector database...', progress: 55, delay: 700 },
  { content: '➜  Optimizing transformer weights...', progress: 70, delay: 400 },
  { content: '➜  Loading language models...', progress: 85, delay: 300 },
  { content: '➜  Starting agent services...', progress: 95, delay: 200 },
  { content: '➜  System ready.', progress: 100, delay: 100 },
];

// 缓存配置
export const CLI_CACHE_KEY = 'agent_cli_cache';
export const CLI_CACHE_VERSION = '1.0';
export const CLI_CACHE_MAX_LINES = 100;
export const CLI_CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 一周

// 帮助信息
export const HELP_MESSAGES = [
  '可用命令:',
  'help, ?              显示帮助信息',
  'clear                清空对话（保留系统信息）',
  'clear --all          清空所有并清除缓存',
  '/search <query>      搜索知识库（开发中）',
  '/knowledge           查看知识库列表（开发中）',
  '/delete <doc_id>     删除知识库文档（开发中）',
  'exit, quit           退出到 shell',
];
