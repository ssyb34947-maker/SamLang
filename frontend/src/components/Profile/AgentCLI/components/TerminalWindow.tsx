import React from 'react';
import { CLI_COLORS } from '../constants';
import { TerminalHeader } from './TerminalHeader';
import { TerminalStatusBar } from './TerminalStatusBar';
import type { TerminalLine } from '../types';

interface TerminalWindowProps {
  mode: 'shell' | 'agent';
  lines: TerminalLine[];
  inputValue: string;
  isProcessing: boolean;
  isBooting: boolean;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  terminalEndRef: React.RefObject<HTMLDivElement>;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  mode,
  lines,
  inputValue,
  isProcessing,
  isBooting,
  children,
  onSubmit,
  onInputChange,
  inputRef,
  terminalEndRef,
}) => {
  const canInput = mode === 'shell' || (mode === 'agent' && !isBooting);

  // Linux风格提示符
  const getPrompt = () => {
    if (mode === 'shell') {
      return (
        <>
          <span style={{ color: CLI_COLORS.accent2 }}>~/sam</span>
          <span style={{ color: CLI_COLORS.text }}>&gt;</span>
        </>
      );
    }
    return (
      <>
        <span style={{ color: CLI_COLORS.accent3 }}>~/sam</span>
        <span style={{ color: CLI_COLORS.accent2 }}>(agent)</span>
        <span style={{ color: CLI_COLORS.text }}>&gt;</span>
      </>
    );
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        backgroundColor: CLI_COLORS.background,
        border: `3px solid ${CLI_COLORS.border}`,
        borderRadius: '12px',
        boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0,0,0,0.3)',
        width: '1100px',
        height: '750px',
        maxWidth: '85vw',
        maxHeight: '75vh',
      }}
    >
      <TerminalHeader mode={mode} />

      {/* 终端内容区 */}
      <div
        className="flex-1 overflow-y-auto p-5 font-mono text-sm"
        style={{ backgroundColor: CLI_COLORS.background }}
      >
        {children}

        {/* 输入行 */}
        {canInput && (
          <form onSubmit={onSubmit} className="flex items-center mt-2">
            <span className="mr-2">{getPrompt()}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              disabled={isProcessing || isBooting}
              className="flex-1 bg-transparent border-none outline-none font-mono"
              style={{ color: CLI_COLORS.text, fontSize: '14px' }}
              placeholder={
                isProcessing
                  ? '处理中...'
                  : mode === 'shell'
                    ? '输入命令...'
                    : '输入命令或消息...'
              }
              autoFocus
            />
            {isProcessing && (
              <span className="animate-pulse" style={{ color: CLI_COLORS.accent2 }}>
                ▊
              </span>
            )}
          </form>
        )}

        <div ref={terminalEndRef} />
      </div>

      <TerminalStatusBar
        mode={mode}
        isProcessing={isProcessing}
        linesCount={lines.length}
        inputLength={inputValue.length}
      />
    </div>
  );
};

export default TerminalWindow;
