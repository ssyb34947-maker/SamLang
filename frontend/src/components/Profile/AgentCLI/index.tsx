import React, { useEffect, useState, useCallback, useRef } from 'react';
import { TerminalLineItem } from './TerminalLineItem';
import { useAgentCLI } from './useAgentCLI';
import { saveCLICache, loadCLICache, clearCLICache } from './cache';
import { useTerminalScroll, useInputFocus } from './hooks';
import {
  SketchFrame,
  TerminalWindow,
  BootProgress,
  ShellWelcome,
} from './components';

export const AgentCLI: React.FC = () => {
  const {
    mode,
    isBooting,
    bootProgress,
    lines,
    inputValue,
    isProcessing,
    setInputValue,
    addLine,
    handleShellCommand,
    handleAgentCommand,
    restoreFromCache,
  } = useAgentCLI();

  const [isVisible, setIsVisible] = useState(false);
  const [displayInput, setDisplayInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasCheckedCache, setHasCheckedCache] = useState(false);
  const { terminalEndRef } = useTerminalScroll(lines);
  const inputRef = useInputFocus({ isBooting, isProcessing, mode });

  // 从其他页面切入时的渐变入场动画
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 保存缓存
  useEffect(() => {
    if (mode === 'agent' && !isBooting && lines.length > 0) {
      saveCLICache(lines);
    }
  }, [lines, isBooting, mode]);

  // 初始化 - 每次组件挂载时检查缓存
  useEffect(() => {
    if (hasCheckedCache) return;
    setHasCheckedCache(true);

    const cached = loadCLICache();
    if (cached && cached.length > 0) {
      // 有缓存，恢复显示
      restoreFromCache();
    } else {
      // 无缓存，显示自动输入过程
      startAutoTyping();
    }
  }, [hasCheckedCache, restoreFromCache]);

  // 自动输入 samcollege
  const startAutoTyping = () => {
    setIsTyping(true);
    const command = 'samcollege';
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex <= command.length) {
        setDisplayInput(command.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // 输入完成后执行命令
        setTimeout(async () => {
          setIsTyping(false);
          setDisplayInput('');
          addLine('input', `~/sam>${command}`);
          await handleShellCommand(command);
        }, 400);
      }
    }, 100);
  };

  // 提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing || isBooting) return;

    const command = inputValue.trim();
    addLine('input', `~/sam>${command}`);
    setInputValue('');

    if (mode === 'shell') {
      const handled = await handleShellCommand(command);
      if (!handled) {
        addLine('error', `command not found: ${command}`);
        addLine('empty', '');
        addLine('info', '提示: 输入 samcollege 启动 Agent');
        addLine('empty', '');
      }
    } else {
      await handleAgentCommand(command);
    }
  };

  // 决定显示什么内容在输入框
  const getInputDisplay = () => {
    if (isTyping) return displayInput;
    return inputValue;
  };

  // 是否显示欢迎信息
  const showWelcome = mode === 'shell' && lines.length === 0 && !isTyping && hasCheckedCache;

  return (
    <div
      className="flex items-center justify-center min-h-[calc(100vh-180px)] p-6"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translateY(0) scale(1)' 
          : 'translateY(30px) scale(0.95)',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <SketchFrame>
        <TerminalWindow
          mode={mode}
          lines={lines}
          inputValue={getInputDisplay()}
          isProcessing={isProcessing}
          isBooting={isBooting}
          onSubmit={handleSubmit}
          onInputChange={setInputValue}
          inputRef={inputRef}
          terminalEndRef={terminalEndRef}
        >
          {/* 终端行 - 显示缓存内容或新内容 */}
          {lines.map((line) => (
            <TerminalLineItem key={line.id} line={line} />
          ))}

          {/* Shell 欢迎信息 */}
          <ShellWelcome show={showWelcome} />

          {/* 启动进度条 */}
          {isBooting && <BootProgress progress={bootProgress} />}
        </TerminalWindow>
      </SketchFrame>
    </div>
  );
};

export default AgentCLI;
