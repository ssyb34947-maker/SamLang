/**
 * API Service
 * 处理所有API请求
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;
  private requestCallbacks: {
    onRequestStart: (() => void) | null;
    onRequestEnd: (() => void) | null;
  } = {
      onRequestStart: null,
      onRequestEnd: null
    };

  constructor() {
    // 从localStorage获取token
    this.token = localStorage.getItem('token');
  }

  /**
   * 设置请求回调
   * @param callbacks 请求开始和结束的回调函数
   */
  setRequestCallbacks(callbacks: {
    onRequestStart: () => void;
    onRequestEnd: () => void;
  }) {
    this.requestCallbacks = callbacks;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request<T>(endpoint: string, options: RequestInit & { skipLoading?: boolean } = {}): Promise<T> {
    const { skipLoading, ...fetchOptions } = options;

    try {
      // 开始请求时显示 loading（如果未跳过）
      if (!skipLoading && this.requestCallbacks.onRequestStart) {
        this.requestCallbacks.onRequestStart();
      }

      const headers = {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...fetchOptions.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } finally {
      // 请求结束时隐藏 loading（如果未跳过）
      if (!skipLoading && this.requestCallbacks.onRequestEnd) {
        this.requestCallbacks.onRequestEnd();
      }
    }
  }

  // 认证相关API
  async register(username: string, email: string, password: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(usernameOrEmail: string, password: string) {
    // 判断是邮箱还是用户名
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);

    const body = isEmail
      ? { email: usernameOrEmail, password }
      : { username: usernameOrEmail, password };

    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // 聊天相关API
  async sendMessage(message: string, skipLoading: boolean = true): Promise<{ success: boolean, message: string, thinking_steps?: any[] }> {
    return this.request<{ success: boolean, message: string, thinking_steps?: any[] }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
      skipLoading,
    });
  }

  /**
   * 真正的流式对话：后端每生成一个token，前端立即收到并显示
   * 
   * @param message 用户消息
   * @param onToken 每收到一个token时的回调
   * @param onComplete 流结束时的回调
   * @param onError 错误时的回调
   * @param skipLoading 是否跳过loading显示
   */
  async sendMessageStreamRealTime(
    message: string,
    onToken: (token: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: string) => void,
    skipLoading: boolean = true
  ): Promise<void> {
    try {
      // 开始请求时显示 loading（如果未跳过）
      if (!skipLoading && this.requestCallbacks.onRequestStart) {
        this.requestCallbacks.onRequestStart();
      }

      console.log('Sending real-time streaming request to:', `${API_BASE_URL}/api/chat/stream`);

      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        },
        body: JSON.stringify({ message }),
      });

      console.log('Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream complete, full response length:', fullResponse.length);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 处理SSE数据行 - 立即处理所有完整的事件
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的行

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const dataStr = trimmedLine.substring(6).trim();
          if (!dataStr) continue;

          try {
            const event = JSON.parse(dataStr);
            // 减少日志输出频率，避免影响性能
            if (event.type !== 'token') {
              console.log('Received event:', event.type);
            }

            if (event.type === 'token' && event.data?.content) {
              // 收到token，立即回调
              const token = event.data.content;
              fullResponse += token;
              // 使用 setTimeout 0 确保UI更新不会被阻塞
              setTimeout(() => onToken(token), 0);
            } else if (event.type === 'final_response') {
              // 流结束
              if (event.data?.content) {
                fullResponse = event.data.content;
              }
              onComplete(fullResponse);
              return;
            } else if (event.type === 'error') {
              // 错误
              onError(event.data?.message || 'Unknown error');
              return;
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e, 'Line:', dataStr);
          }
        }
      }

      // 处理剩余的buffer
      if (buffer.trim()) {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data: ')) {
          const dataStr = trimmedLine.substring(6).trim();
          try {
            const event = JSON.parse(dataStr);
            if (event.type === 'final_response') {
              onComplete(event.data?.content || fullResponse);
            } else if (event.type === 'error') {
              onError(event.data?.message || 'Unknown error');
            }
          } catch (e) {
            console.error('Error parsing final buffer:', e);
            onComplete(fullResponse);
          }
        }
      }

    } catch (error: any) {
      console.error('Error in stream:', error);
      onError(error.message || 'Stream failed');
    } finally {
      // 请求结束时隐藏 loading（如果未跳过）
      if (!skipLoading && this.requestCallbacks.onRequestEnd) {
        this.requestCallbacks.onRequestEnd();
      }
    }
  }

  /**
   * 旧的流式方法（保留兼容）
   */
  async sendMessageStream(message: string, onEvent: (eventType: string, data: any) => void, skipLoading: boolean = true): Promise<string> {
    try {
      if (!skipLoading && this.requestCallbacks.onRequestStart) {
        this.requestCallbacks.onRequestStart();
      }

      console.log('Sending streaming request to:', `${API_BASE_URL}/api/chat/stream`);

      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        },
        body: JSON.stringify({ message }),
      });

      console.log('Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream complete, full response length:', fullResponse.length);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        buffer += chunk;

        // 处理每一行
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的行

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          console.log('Processing line:', trimmedLine);

          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.substring(6).trim();
            if (dataStr) {
              try {
                const data = JSON.parse(dataStr);
                console.log('Parsed JSON:', data);
                if (data.type && data.data) {
                  onEvent(data.type, data.data);

                  // 累计最终响应内容
                  if (data.type === 'final_response' && data.data.content) {
                    fullResponse = data.data.content;
                    console.log('Got final response:', fullResponse);
                    // 标记已经触发了 final_response
                    (onEvent as any).finalResponseTriggered = true;
                  }
                } else if (data.content) {
                  // 如果直接包含 content，当作最终响应处理
                  fullResponse = data.content;
                  onEvent('final_response', { content: fullResponse });
                  console.log('Got direct content response:', fullResponse);
                  // 标记已经触发了 final_response
                  (onEvent as any).finalResponseTriggered = true;
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, 'Line:', dataStr);
              }
            }
          } else if (trimmedLine.startsWith('event: ')) {
            // 处理 SSE 事件格式：event: type\ndata: ...
            // 这部分会在下一行处理 data
            continue;
          } else {
            // 如果不是 data: 开头，尝试直接作为 JSON 解析
            try {
              const data = JSON.parse(trimmedLine);
              console.log('Direct JSON parsed:', data);
              if (data.type && data.data) {
                onEvent(data.type, data.data);
                if (data.type === 'final_response' && data.data.content) {
                  fullResponse = data.data.content;
                  // 标记已经触发了 final_response
                  (onEvent as any).finalResponseTriggered = true;
                }
              } else if (data.content) {
                fullResponse = data.content;
                onEvent('final_response', { content: fullResponse });
                // 标记已经触发了 final_response
                (onEvent as any).finalResponseTriggered = true;
              }
            } catch (e) {
              // 如果不是 JSON，累积到 fullResponse 作为普通文本
              console.log('Raw text chunk:', trimmedLine);
              fullResponse += trimmedLine;
            }
          }
        }
      }

      // 如果 buffer 还有内容，处理它
      if (buffer.trim()) {
        console.log('Processing remaining buffer:', buffer);
        try {
          const data = JSON.parse(buffer.trim());
          if (data.type && data.data) {
            onEvent(data.type, data.data);
            if (data.type === 'final_response' && data.data.content) {
              fullResponse = data.data.content;
              // 标记已经触发了 final_response
              (onEvent as any).finalResponseTriggered = true;
            }
          } else if (data.content) {
            fullResponse = data.content;
            onEvent('final_response', { content: fullResponse });
            // 标记已经触发了 final_response
            (onEvent as any).finalResponseTriggered = true;
          }
        } catch (e) {
          fullResponse += buffer;
        }
      }

      // 如果最后 fullResponse 不为空但还没有触发 final_response，触发一次
      if (fullResponse && !(onEvent as any).finalResponseTriggered) {
        console.log('Triggering final_response with accumulated content:', fullResponse);
        onEvent('final_response', { content: fullResponse });
      }

      return fullResponse;
    } finally {
      // 请求结束时隐藏 loading（如果未跳过）
      if (!skipLoading && this.requestCallbacks.onRequestEnd) {
        this.requestCallbacks.onRequestEnd();
      }
    }
  }
}

export const apiService = new ApiService();
