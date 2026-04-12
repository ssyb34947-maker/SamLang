import { LucideIcon } from 'lucide-react';

export type ThinkingEventType = 'thinking_step' | 'tool_call' | 'tool_result' | 'final_response';

export type AnimationState = 'idle' | 'thinking' | 'tool_calling' | 'processing' | 'completing';

export interface ToolCallInfo {
  toolName: string;
  arguments: Record<string, unknown>;
  result?: string;
  durationMs?: number;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface ThinkingStep {
  type: 'thought' | 'tool';
  content?: string;
  toolCall?: ToolCallInfo;
  timestamp: number;
}

export interface ThinkingAnimationProps {
  isActive: boolean;
  currentStep: number;
  toolCalls: ToolCallInfo[];
  onComplete?: () => void;
}

export interface ThinkingProcessState {
  isActive: boolean;
  steps: ThinkingStep[];
  currentTool: string | null;
  animationState: AnimationState;
}

export interface ThinkingEvent {
  type: ThinkingEventType;
  data: {
    thought?: string;
    tool_name?: string;
    arguments?: Record<string, unknown>;
    result?: string;
    duration_ms?: number;
    content?: string;
    step_index?: number;
  };
}

export interface ToolIconConfig {
  icon: LucideIcon;
  color: string;
  label: string;
  category: 'search' | 'file' | 'code' | 'analysis' | 'communication' | 'default';
}

export interface AnimationConfig {
  pulseDuration: number;
  orbitDuration: number;
  transitionDuration: number;
  particleCount: number;
}

export interface ParticleConfig {
  id: string;
  angle: number;
  distance: number;
  speed: number;
  size: number;
  opacity: number;
}
