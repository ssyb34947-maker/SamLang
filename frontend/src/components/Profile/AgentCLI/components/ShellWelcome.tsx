import React from 'react';
import { CLI_COLORS } from '../constants';

interface ShellWelcomeProps {
  show: boolean;
}

export const ShellWelcome: React.FC<ShellWelcomeProps> = ({ show }) => {
  if (!show) return null;

  return (
    <>
      <div
        style={{
          color: CLI_COLORS.textMuted,
          fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
          fontSize: '13px',
        }}
      >
        Welcome to SamLang Terminal
      </div>
      <div
        style={{
          color: CLI_COLORS.textMuted,
          fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
          fontSize: '13px',
          marginTop: '0.5em',
        }}
      >
        Type <span style={{ color: CLI_COLORS.accent2 }}>samcollege</span> to start the Agent
      </div>
      <div style={{ height: '1em' }} />
    </>
  );
};

export default ShellWelcome;
