import React from 'react';
import { CLI_COLORS } from '../constants';

interface TerminalHeaderProps {
  mode: 'shell' | 'agent';
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({ mode }) => {
  return (
    <div
      className="flex items-center justify-between px-4 py-2"
      style={{
        backgroundColor: CLI_COLORS.border,
        borderBottom: `1px solid ${CLI_COLORS.accent}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: CLI_COLORS.accent2 }}>⬤</span>
        <span style={{ color: CLI_COLORS.accent3 }}>⬤</span>
        <span style={{ color: CLI_COLORS.accent4 }}>⬤</span>
        <span
          className="ml-3 font-mono text-sm"
          style={{ color: CLI_COLORS.textMuted }}
        >
          {mode === 'shell' ? 'user@sam-lang' : 'agent@sam-lang'}
        </span>
      </div>
      <span
        className="font-mono text-xs"
        style={{ color: CLI_COLORS.textMuted }}
      >
        bash — 80x24
      </span>
    </div>
  );
};

export default TerminalHeader;
