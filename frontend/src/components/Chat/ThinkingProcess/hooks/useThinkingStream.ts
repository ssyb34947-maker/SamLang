import { useState, useCallback } from 'react';
import type { ThinkingEvent, ThinkingStep, ToolCallInfo, ThinkingProcessState } from '../types';

export function useThinkingStream() {
  const [state, setState] = useState<ThinkingProcessState>({
    isActive: false,
    steps: [],
    currentTool: null,
    animationState: 'idle',
  });

  const startThinking = useCallback(() => {
    setState({
      isActive: true,
      steps: [],
      currentTool: null,
      animationState: 'thinking',
    });
  }, []);

  const stopThinking = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      animationState: 'completing',
    }));
  }, []);

  const handleThinkingEvent = useCallback((event: ThinkingEvent) => {
    switch (event.type) {
      case 'thinking_step':
        setState((prev) => ({
          ...prev,
          steps: [
            ...prev.steps,
            {
              type: 'thought',
              content: event.data.thought || '',
              timestamp: Date.now(),
            },
          ],
        }));
        break;

      case 'tool_call':
        const newTool: ToolCallInfo = {
          toolName: event.data.tool_name || 'unknown',
          arguments: event.data.arguments || {},
          status: 'running',
        };
        setState((prev) => ({
          ...prev,
          currentTool: event.data.tool_name || null,
          steps: [
            ...prev.steps,
            {
              type: 'tool',
              toolCall: newTool,
              timestamp: Date.now(),
            },
          ],
          animationState: 'tool_calling',
        }));
        break;

      case 'tool_result':
        setState((prev) => {
          const lastStep = prev.steps[prev.steps.length - 1];
          if (lastStep?.type === 'tool' && lastStep.toolCall) {
            const updatedSteps = [...prev.steps];
            updatedSteps[updatedSteps.length - 1] = {
              ...lastStep,
              toolCall: {
                ...lastStep.toolCall,
                result: event.data.result,
                durationMs: event.data.duration_ms,
                status: 'completed',
              },
            };
            return {
              ...prev,
              steps: updatedSteps,
              animationState: 'processing',
            };
          }
          return prev;
        });
        break;

      case 'final_response':
        setState((prev) => ({
          ...prev,
          isActive: false,
          animationState: 'completing',
        }));
        break;
    }
  }, []);

  const getToolCalls = useCallback((): ToolCallInfo[] => {
    return state.steps
      .filter((step): step is ThinkingStep & { toolCall: ToolCallInfo } =>
        step.type === 'tool' && step.toolCall !== undefined
      )
      .map((step) => step.toolCall);
  }, [state.steps]);

  return {
    state,
    startThinking,
    stopThinking,
    handleThinkingEvent,
    getToolCalls,
    isActive: state.isActive,
    stepCount: state.steps.length,
  };
}
