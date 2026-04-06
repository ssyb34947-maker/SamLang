import { useEffect, useRef, useCallback } from 'react';

export const useTerminalScroll = (lines: unknown[]) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  return { terminalEndRef, scrollToBottom };
};

export default useTerminalScroll;
