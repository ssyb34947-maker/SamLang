import React from 'react';
import type { TerminalLine, TerminalLineType } from './types';
import { CLI_COLORS } from './constants';

interface TerminalLineItemProps {
  line: TerminalLine;
}

const baseStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
  fontSize: '13px',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const getLineStyle = (type: TerminalLineType): React.CSSProperties => {
  switch (type) {
    case 'logo':
      return { ...baseStyle, color: '#e07b39' };
    case 'system':
      return { ...baseStyle, color: CLI_COLORS.accent };
    case 'info':
      return { ...baseStyle, color: CLI_COLORS.textMuted };
    case 'success':
      return { ...baseStyle, color: CLI_COLORS.accent2 };
    case 'warning':
      return { ...baseStyle, color: CLI_COLORS.accent3 };
    case 'error':
      return { ...baseStyle, color: CLI_COLORS.accent4 };
    case 'input':
      return { ...baseStyle, color: CLI_COLORS.text };
    case 'output':
      return { ...baseStyle, color: CLI_COLORS.textMuted, marginLeft: '2ch' };
    case 'agent':
      return { ...baseStyle, color: CLI_COLORS.accent5 };
    case 'thinking':
      return { ...baseStyle, color: CLI_COLORS.accent3, fontStyle: 'italic' };
    case 'tool_call':
      return { ...baseStyle, color: CLI_COLORS.accent };
    case 'tool_result':
      return { ...baseStyle, color: CLI_COLORS.accent2, marginLeft: '2ch' };
    case 'log':
      return { ...baseStyle, color: CLI_COLORS.textMuted };
    case 'empty':
      return { height: '1em' };
    default:
      return baseStyle;
  }
};

export const TerminalLineItem: React.FC<TerminalLineItemProps> = ({ line }) => {
  const { type, content, id } = line;
  const style = getLineStyle(type);

  // Agent 类型特殊处理：空内容时显示光标
  if (type === 'agent') {
    return (
      <div key={id} style={style}>
        {content || <span className="animate-pulse">▊</span>}
      </div>
    );
  }

  // 空行特殊处理
  if (type === 'empty') {
    return <div key={id} style={style} />;
  }

  return (
    <div key={id} style={style}>
      {content}
    </div>
  );
};

export default TerminalLineItem;
