// CLI 终端行类型
export type TerminalLineType =
  | 'logo'
  | 'system'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'input'
  | 'output'
  | 'agent'
  | 'thinking'
  | 'tool_call'
  | 'tool_result'
  | 'log'
  | 'empty';

// CLI 终端行
export interface TerminalLine {
  id: string;
  type: TerminalLineType;
  content: string;
  timestamp?: number;
  metadata?: any;
}

// CLI 缓存数据结构
export interface CLICache {
  version: string;
  lines: TerminalLine[];
  lastUpdated: number;
}

// 启动日志项
export interface BootLogItem {
  content: string;
  progress: number;
  delay: number;
}

// 命令处理结果
export interface CommandResult {
  handled: boolean;
  needExit?: boolean;
}
