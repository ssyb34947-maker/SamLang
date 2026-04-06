import type { TerminalLine, CLICache } from './types';
import {
  CLI_CACHE_KEY,
  CLI_CACHE_VERSION,
  CLI_CACHE_MAX_LINES,
  CLI_CACHE_EXPIRY_MS,
} from './constants';

/**
 * 保存 CLI 缓存到 localStorage
 */
export const saveCLICache = (lines: TerminalLine[]): void => {
  try {
    const cache: CLICache = {
      version: CLI_CACHE_VERSION,
      lines: lines.slice(-CLI_CACHE_MAX_LINES),
      lastUpdated: Date.now(),
    };
    localStorage.setItem(CLI_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save CLI cache:', e);
  }
};

/**
 * 从 localStorage 加载 CLI 缓存
 */
export const loadCLICache = (): TerminalLine[] | null => {
  try {
    const cached = localStorage.getItem(CLI_CACHE_KEY);
    if (!cached) return null;

    const cache: CLICache = JSON.parse(cached);

    // 检查版本
    if (cache.version !== CLI_CACHE_VERSION) {
      localStorage.removeItem(CLI_CACHE_KEY);
      return null;
    }

    // 检查过期时间
    if (Date.now() - cache.lastUpdated > CLI_CACHE_EXPIRY_MS) {
      localStorage.removeItem(CLI_CACHE_KEY);
      return null;
    }

    return cache.lines;
  } catch (e) {
    console.error('Failed to load CLI cache:', e);
    return null;
  }
};

/**
 * 清除 CLI 缓存
 */
export const clearCLICache = (): void => {
  localStorage.removeItem(CLI_CACHE_KEY);
};
