import { useState, useRef, useCallback } from 'react';
import type { TerminalLine } from './types';
import { ASCII_LOGO, BOOT_LOGS } from './constants';
import { saveCLICache, loadCLICache, clearCLICache } from './cache';
import { apiService } from '../../../services/api';

const generateId = () => Math.random().toString(36).substring(2, 9);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type CLIMode = 'shell' | 'agent';

// 可用命令列表
export const AVAILABLE_COMMANDS = [
  { name: '/help', description: '显示帮助信息', alias: '/?' },
  { name: '/clear', description: '清空对话（保留系统信息）' },
  { name: '/clear --all', description: '清空所有并清除缓存' },
  { name: '/history', description: '查看历史对话列表' },
  { name: '/history <id>', description: '跳转到指定对话' },
  { name: '/exit', description: '退出到 shell', alias: '/quit' },
];

export interface UseAgentCLIReturn {
  // 状态
  mode: CLIMode;
  isBooting: boolean;
  bootProgress: number;
  lines: TerminalLine[];
  inputValue: string;
  isProcessing: boolean;
  systemLines: TerminalLine[];
  currentConversationId: string | null;

  // 设置器
  setInputValue: (value: string) => void;

  // 操作方法
  addLine: (type: TerminalLine['type'], content: string, metadata?: any) => TerminalLine;
  updateLine: (id: string, type: TerminalLine['type'], content: string) => void;
  executeBootSequence: () => Promise<void>;
  handleShellCommand: (command: string) => Promise<boolean>;
  handleAgentCommand: (command: string) => Promise<void>;
  handleSpecialCommand: (command: string) => Promise<{ handled: boolean; needExit?: boolean }>;
  executeChat: (message: string) => Promise<void>;
  restoreFromCache: () => boolean;
  clearLines: (clearAll?: boolean) => void;
  loadConversation: (conversationId: string) => Promise<void>;
  
  // 命令提示
  getCommandSuggestions: (input: string) => typeof AVAILABLE_COMMANDS;
}

export const useAgentCLI = (): UseAgentCLIReturn => {
  const [mode, setMode] = useState<CLIMode>('shell');
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemLines, setSystemLines] = useState<TerminalLine[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const currentResponseRef = useRef('');

  const addLine = useCallback((type: TerminalLine['type'], content: string, metadata?: any): TerminalLine => {
    const newLine: TerminalLine = {
      id: generateId(),
      type,
      content,
      timestamp: Date.now(),
      metadata,
    };
    setLines((prev) => [...prev, newLine]);
    return newLine;
  }, []);

  const updateLine = useCallback((id: string, type: TerminalLine['type'], content: string) => {
    setLines((prev) =>
      prev.map((line) =>
        line.metadata?.responseId === id ? { ...line, type, content } : line
      )
    );
  }, []);

  const createSystemLines = useCallback((): TerminalLine[] => {
    const newLines: TerminalLine[] = [];
    const now = Date.now();

    // Logo 行
    ASCII_LOGO.forEach((line) => {
      newLines.push({ id: generateId(), type: 'logo', content: line, timestamp: now });
    });

    // 启动日志行
    BOOT_LOGS.forEach((log) => {
      newLines.push({ id: generateId(), type: 'log', content: log.content, timestamp: now });
    });

    // 系统信息行
    newLines.push({ id: generateId(), type: 'empty', content: '', timestamp: now });
    newLines.push({ id: generateId(), type: 'info', content: '[INFO] SamLang Agent v2.0.1 initialized', timestamp: now });
    newLines.push({ id: generateId(), type: 'info', content: '[INFO] Connected to neural network', timestamp: now });
    newLines.push({ id: generateId(), type: 'success', content: '[OK] Ready for conversation', timestamp: now });
    newLines.push({ id: generateId(), type: 'empty', content: '', timestamp: now });
    newLines.push({ id: generateId(), type: 'info', content: '提示: 输入 /help 查看可用命令', timestamp: now });
    newLines.push({ id: generateId(), type: 'empty', content: '', timestamp: now });

    return newLines;
  }, []);

  const executeBootSequence = useCallback(async () => {
    setIsBooting(true);
    setBootProgress(0);
    setLines([]);

    // 显示 Logo
    ASCII_LOGO.forEach((line) => {
      addLine('logo', line);
    });

    await delay(100);

    // 显示启动日志
    for (const log of BOOT_LOGS) {
      addLine('log', log.content);
      setBootProgress(log.progress);
      await delay(log.delay);
    }

    await delay(200);

    // 显示系统信息
    addLine('empty', '');
    addLine('info', '[INFO] SamLang Agent v2.0.1 initialized');
    addLine('info', '[INFO] Connected to neural network');
    addLine('success', '[OK] Ready for conversation');
    addLine('empty', '');
    addLine('info', '提示: 输入 /help 查看可用命令');
    addLine('empty', '');

    // 保存系统行
    setSystemLines(createSystemLines());

    setIsBooting(false);
  }, [addLine, createSystemLines]);

  const restoreFromCache = useCallback((): boolean => {
    const cached = loadCLICache();
    if (cached && cached.length > 0) {
      setLines(cached);
      setIsBooting(false);

      // 恢复系统行
      const sysLines: TerminalLine[] = [];
      let foundSystemEnd = false;
      for (const line of cached) {
        if (line.type === 'info' && line.content === '提示: 输入 /help 查看可用命令') {
          foundSystemEnd = true;
        }
        if (!foundSystemEnd || (foundSystemEnd && line.type === 'empty')) {
          sysLines.push(line);
        }
        if (foundSystemEnd && line.type === 'empty') {
          break;
        }
      }
      setSystemLines(sysLines);
      return true;
    }
    return false;
  }, []);

  const handleShellCommand = useCallback(async (command: string): Promise<boolean> => {
    // Shell模式下只支持 /samcollege 启动Agent
    if (command.toLowerCase() === '/samcollege') {
      setMode('agent');
      const restored = restoreFromCache();
      if (!restored) {
        await executeBootSequence();
      } else {
        addLine('info', '[INFO] 已恢复上次对话');
        addLine('empty', '');
      }
      return true;
    }
    return false;
  }, [addLine, executeBootSequence, restoreFromCache]);

  const clearLines = useCallback((clearAll = false) => {
    if (clearAll) {
      setLines([]);
      setSystemLines([]);
      setCurrentConversationId(null);
      clearCLICache();
    } else {
      setLines([...systemLines]);
    }
  }, [systemLines]);

  // 加载指定对话
  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      addLine('info', `[INFO] 正在加载对话 ${conversationId}...`);
      
      // 调用API获取对话消息
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/assistant/conversations/${conversationId}/messages`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (!response.ok) {
        addLine('error', `[ERROR] 加载对话失败: ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      
      if (!data.messages || data.messages.length === 0) {
        addLine('warning', '[WARN] 该对话没有消息');
        return;
      }
      
      // 清空当前显示
      clearLines(false);
      
      // 显示对话标题
      addLine('info', `[INFO] 对话: ${data.title || '未命名对话'}`);
      addLine('info', `[INFO] 消息数: ${data.messages.length}`);
      addLine('empty', '');
      
      // 显示消息
      for (const msg of data.messages) {
        if (msg.role === 'user') {
          addLine('input', `~/sam>${msg.content}`);
        } else if (msg.role === 'assistant') {
          addLine('agent', msg.content);
        }
      }
      
      // 设置当前对话ID
      setCurrentConversationId(conversationId);
      addLine('empty', '');
      addLine('info', '[INFO] 对话加载完成，可以继续对话');
      addLine('empty', '');
      
    } catch (error) {
      addLine('error', `[ERROR] 加载对话失败: ${error}`);
    }
  }, [addLine, clearLines]);

  // 获取历史对话列表
  const fetchHistory = useCallback(async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/assistant/conversations`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (!response.ok) {
        addLine('error', `[ERROR] 获取历史对话失败: ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      
      if (!data.conversations || data.conversations.length === 0) {
        addLine('info', '[INFO] 暂无历史对话');
        return;
      }
      
      addLine('info', `[INFO] 历史对话列表 (共 ${data.conversations.length} 个):`);
      addLine('empty', '');
      
      for (const conv of data.conversations) {
        const date = new Date(conv.updated_at).toLocaleString('zh-CN');
        const preview = conv.last_message ? conv.last_message.slice(0, 30) + '...' : '无消息';
        addLine('output', `[${conv.conversation_id.slice(0, 8)}] ${conv.title}`);
        addLine('output', `  更新时间: ${date}`);
        addLine('output', `  最后消息: ${preview}`);
        addLine('output', `  输入 /history ${conv.conversation_id.slice(0, 8)} 跳转`);
        addLine('empty', '');
      }
      
    } catch (error) {
      addLine('error', `[ERROR] 获取历史对话失败: ${error}`);
    }
  }, [addLine]);

  const handleSpecialCommand = useCallback(async (command: string): Promise<{ handled: boolean; needExit?: boolean }> => {
    const cmd = command.toLowerCase().trim();

    // /help 或 /?
    if (cmd === '/help' || cmd === '/?') {
      addLine('info', '可用命令:');
      addLine('output', '/help, /?           显示帮助信息');
      addLine('output', '/clear               清空对话（保留系统信息）');
      addLine('output', '/clear --all         清空所有并清除缓存');
      addLine('output', '/history             查看历史对话列表');
      addLine('output', '/history <id>        跳转到指定对话');
      addLine('output', '/exit, /quit         退出到 shell');
      addLine('empty', '');
      addLine('info', '提示: 输入 / 可查看命令提示');
      addLine('empty', '');
      return { handled: true };
    }

    // /clear
    if (cmd === '/clear') {
      clearLines(false);
      addLine('info', '[INFO] 对话已清空');
      addLine('empty', '');
      return { handled: true };
    }

    // /clear --all
    if (cmd === '/clear --all') {
      clearLines(true);
      addLine('success', '[OK] 已清空所有内容并清除缓存');
      addLine('empty', '');
      return { handled: true };
    }

    // /history
    if (cmd === '/history') {
      await fetchHistory();
      return { handled: true };
    }

    // /history <id>
    if (cmd.startsWith('/history ')) {
      const id = command.slice(9).trim();
      if (id) {
        // 支持短ID匹配
        await loadConversation(id);
      } else {
        addLine('error', '[ERROR] 请提供对话ID，例如: /history abc123');
      }
      return { handled: true };
    }

    // /exit 或 /quit
    if (cmd === '/exit' || cmd === '/quit') {
      addLine('system', '[SYSTEM] Agent 会话已结束');
      addLine('empty', '');
      addLine('info', '提示: 输入 /samcollege 重新启动 Agent');
      addLine('empty', '');
      // 清除缓存和状态
      clearCLICache();
      setLines([]);
      setSystemLines([]);
      setCurrentConversationId(null);
      setMode('shell');
      setIsBooting(false);
      return { handled: true, needExit: true };
    }

    return { handled: false };
  }, [addLine, clearLines, fetchHistory, loadConversation]);

  // 获取命令建议
  const getCommandSuggestions = useCallback((input: string) => {
    if (!input.startsWith('/')) return [];
    
    const query = input.slice(1).toLowerCase();
    return AVAILABLE_COMMANDS.filter(cmd => 
      cmd.name.slice(1).startsWith(query) || 
      (cmd.alias && cmd.alias.slice(1).startsWith(query))
    );
  }, []);

  const executeChat = useCallback(async (message: string) => {
    const responseId = generateId();
    currentResponseRef.current = '';
    addLine('agent', '', { responseId });

    console.log('[AgentCLI] 发送消息，agentType=2');

    try {
      await apiService.sendMessageStreamRealTime(
        message,
        currentConversationId || undefined, // 使用当前对话ID
        (token) => {
          currentResponseRef.current += token;
          updateLine(responseId, 'agent', currentResponseRef.current);
        },
        (fullResponse) => {
          updateLine(responseId, 'agent', fullResponse);
        },
        (error) => {
          updateLine(responseId, 'error', `[ERROR] ${error}`);
        },
        (conversationId) => {
          // 新对话创建成功
          setCurrentConversationId(conversationId);
          console.log('[AgentCLI] 新对话创建:', conversationId);
        },
        undefined, // onTokenStats
        undefined, // onThinkingEvent
        true, // skipLoading
        2 // agentType: 2 = 助教Agent
      );
    } catch (error: any) {
      updateLine(responseId, 'error', `[ERROR] 对话失败: ${error.message}`);
    }
  }, [addLine, updateLine, currentConversationId]);

  const handleAgentCommand = useCallback(async (command: string) => {
    setIsProcessing(true);

    // 检查是否是 / 开头的命令
    if (command.startsWith('/')) {
      const result = await handleSpecialCommand(command);
      if (result.handled) {
        setIsProcessing(false);
        return;
      }
      // 如果命令以 / 开头但未被识别，提示错误
      addLine('error', `[ERROR] 未知命令: ${command}`);
      addLine('info', '提示: 输入 /help 查看可用命令');
      addLine('empty', '');
      setIsProcessing(false);
      return;
    }

    // 普通消息，调用Agent
    await executeChat(command);
    setIsProcessing(false);
  }, [addLine, executeChat, handleSpecialCommand]);

  return {
    mode,
    isBooting,
    bootProgress,
    lines,
    inputValue,
    isProcessing,
    systemLines,
    currentConversationId,
    setInputValue,
    addLine,
    updateLine,
    executeBootSequence,
    handleShellCommand,
    handleAgentCommand,
    handleSpecialCommand,
    executeChat,
    restoreFromCache,
    clearLines,
    loadConversation,
    getCommandSuggestions,
  };
};

export default useAgentCLI;
