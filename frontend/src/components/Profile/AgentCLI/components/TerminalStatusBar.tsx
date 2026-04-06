import React from 'react';
import { CLI_COLORS } from '../constants';

interface TerminalStatusBarProps {
  mode: 'shell' | 'agent';
  isProcessing: boolean;
  linesCount: number;
  inputLength: number;
}

export const TerminalStatusBar: React.FC<TerminalStatusBarProps> = ({
  mode,
  isProcessing,
  linesCount,
  inputLength,
}) => {
  return (
    <div
      className="flex items-center justify-between px-4 py-1 text-xs font-mono"
      style={{
        backgroundColor: CLI_COLORS.border,
        borderTop: `1px solid ${CLI_COLORS.accent}`,
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className={isProcessing ? 'animate-pulse' : ''}
          style={{
            color: isProcessing
              ? CLI_COLORS.accent3
              : mode === 'agent'
                ? CLI_COLORS.accent2
                : CLI_COLORS.textMuted,
          }}
        >
          {isProcessing ? 'PROCESSING' : mode === 'agent' ? 'READY' : 'SHELL'}
        </span>
        <span style={{ color: CLI_COLORS.textMuted }}>|</span>
        <span style={{ color: CLI_COLORS.accent }}>
          {mode === 'shell' ? 'bash' : 'agent-cli'}
        </span>
        <span style={{ color: CLI_COLORS.textMuted }}>|</span>
        <span style={{ color: CLI_COLORS.accent3 }}>utf-8</span>
      </div>
      <div
        className="flex items-center gap-4"
        style={{ color: CLI_COLORS.textMuted }}
      >
        <span>ln: {linesCount + 1}</span>
        <span>col: {inputLength + 1}</span>
      </div>
    </div>
  );
};

export default TerminalStatusBar;
