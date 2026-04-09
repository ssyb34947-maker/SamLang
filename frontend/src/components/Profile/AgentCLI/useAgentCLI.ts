import { useState, useRef, useCallback } from 'react';
import type { TerminalLine } from './types';
import { ASCII_LOGO, BOOT_LOGS } from './constants';
import { saveCLICache, loadCLICache, clearCLICache } from './cache';
import { apiService } from '../../../services/api';

const generateId = () => Math.random().toString(36).substring(2, 9);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type CLIMode = 'shell' | 'agent';

export interface UseAgentCLIReturn {
  // 状态
  mode: CLIMode;
  isBooting: boolean;
  bootProgress: number;
  lines: TerminalLine[];
  inputValue: string;
  isProcessing: boolean;
  systemLines: TerminalLine[];

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
}

export const useAgentCLI = (): UseAgentCLIReturn => {
  const [mode, setMode] = useState<CLIMode>('shell');
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemLines, setSystemLines] = useState<TerminalLine[]>([]);

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
    newLines.push({ id: generateId(), type: 'info', content: '提示: 输入 help 查看可用命令', timestamp: now });
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
    addLine('info', '提示: 输入 help 查看可用命令');
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
        if (line.type === 'info' && line.content === '提示: 输入 help 查看可用命令') {
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
    if (command.toLowerCase() === 'samcollege') {
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
      clearCLICache();
    } else {
      setLines([...systemLines]);
    }
  }, [systemLines]);

  const handleSpecialCommand = useCallback(async (command: string): Promise<{ handled: boolean; needExit?: boolean }> => {
    const cmd = command.toLowerCase();

    if (cmd === 'help' || cmd === '?') {
      addLine('info', '可用命令:');
      addLine('output', 'help, ?              显示帮助信息');
      addLine('output', 'clear                清空对话（保留系统信息）');
      addLine('output', 'clear --all          清空所有并清除缓存');
      addLine('output', '/search <query>      搜索知识库（开发中）');
      addLine('output', '/knowledge           查看知识库列表（开发中）');
      addLine('output', '/delete <doc_id>     删除知识库文档（开发中）');
      addLine('output', 'exit, quit           退出到 shell');
      addLine('empty', '');
      return { handled: true };
    }

    if (cmd === 'clear') {
      clearLines(false);
      addLine('info', '[INFO] 对话已清空');
      addLine('empty', '');
      return { handled: true };
    }

    if (cmd === 'clear --all') {
      clearLines(true);
      addLine('success', '[OK] 已清空所有内容并清除缓存');
      addLine('empty', '');
      return { handled: true };
    }

    if (cmd.startsWith('/search ')) {
      addLine('info', '[INFO] /search 命令开发中...');
      addLine('empty', '');
      return { handled: true };
    }

    if (cmd === '/knowledge') {
      addLine('info', '[INFO] /knowledge 命令开发中...');
      addLine('empty', '');
      return { handled: true };
    }

    if (cmd.startsWith('/delete ')) {
      addLine('info', '[INFO] /delete 命令开发中...');
      addLine('empty', '');
      return { handled: true };
    }

    if (cmd === 'exit' || cmd === 'quit') {
      addLine('system', '[SYSTEM] Agent 会话已结束');
      addLine('empty', '');
      addLine('info', '提示: 输入 samcollege 重新启动 Agent');
      addLine('empty', '');
      // 清除缓存和状态
      clearCLICache();
      setLines([]);
      setSystemLines([]);
      setMode('shell');
      setIsBooting(false);
      return { handled: true, needExit: true };
    }

    return { handled: false };
  }, [addLine, clearLines]);

  const executeChat = useCallback(async (message: string) => {
    const responseId = generateId();
    currentResponseRef.current = '';
    addLine('agent', '', { responseId });

    try {
      await apiService.sendMessageStreamRealTime(
        message,
        undefined, // conversationId
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
        undefined, // onConversationCreated
        undefined, // onTokenStats
        true, // skipLoading
        2 // agentType: 2 = 助教Agent
      );
    } catch (error: any) {
      updateLine(responseId, 'error', `[ERROR] 对话失败: ${error.message}`);
    }
  }, [addLine, updateLine]);

  const handleAgentCommand = useCallback(async (command: string) => {
    setIsProcessing(true);

    const result = await handleSpecialCommand(command);
    if (result.handled) {
      setIsProcessing(false);
      return;
    }

    await executeChat(command);
    setIsProcessing(false);
  }, [executeChat, handleSpecialCommand]);

  return {
    mode,
    isBooting,
    bootProgress,
    lines,
    inputValue,
    isProcessing,
    systemLines,
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
  };
};

export default useAgentCLI;
