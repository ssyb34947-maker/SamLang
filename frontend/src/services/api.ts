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
    // 清除 localStorage 中的所有数据
    localStorage.clear();
    // 清除 sessionStorage 中的所有数据
    sessionStorage.clear();
    // 清除所有 cookies
    this.clearAllCookies();
  }

  /**
   * 清除所有 cookies
   */
  private clearAllCookies() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      // 将 cookie 过期时间设置为过去的时间来删除它
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      // 同时尝试删除根域名下的 cookie
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    }
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

        // 处理 401 未授权错误，清除 token 并跳转登录页
        if (response.status === 401) {
          this.clearToken();
          // 如果不在登录页，则跳转
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }

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

  async updateCurrentUser(userData: {
    username?: string;
    email?: string;
    avatar?: string;
    bio?: string;
    gender?: string;
    age?: number;
    is_student?: boolean;
    student_grade?: string;
    occupation?: string;
    persona?: string;
  }): Promise<{
    id: number;
    uuid: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    gender?: string;
    age?: number;
    is_student?: boolean;
    student_grade?: string;
    occupation?: string;
    persona?: string;
    is_active: boolean;
    created_at: string;
  }> {
    return this.request('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * 更新用户画像（冷启动后使用）
   * @param persona 用户画像自然文本
   */
  async updateUserProfile(persona: string) {
    return this.updateCurrentUser({ persona });
  }

  /**
   * 冷启动预测 - 根据学习特征预测成绩
   * @param data 学习特征数据
   */
  async coldStartPredict(data: {
    gender: string;
    grade: string;
    daily_study_time: string;
    math_recognition: string;
    learning_autonomy: string;
    learning_perseverance: string;
    learning_curiosity: string;
    current_goal: string;
  }): Promise<{
    success: boolean;
    data: {
      math: { score: number; level: string };
      reading: { score: number; level: string };
      science: { score: number; level: string };
    };
    persona_text: string;
    message?: string;
  }> {
    return this.request('/api/cold-start/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `上传失败: ${response.status}`);
    }

    return response.json();
  }

  // 聊天相关API
  async sendMessage(message: string, conversationId?: string, skipLoading: boolean = true): Promise<{ success: boolean, message: string, thinking_steps?: any[], conversation_id?: string, is_new_conversation?: boolean }> {
    return this.request<{ success: boolean, message: string, thinking_steps?: any[], conversation_id?: string, is_new_conversation?: boolean }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
      skipLoading,
    });
  }

  /**
   * 真正的流式对话：后端每生成一个token，前端立即收到并显示
   * 
   * @param message 用户消息
   * @param conversationId 对话ID，为空则创建新对话
   * @param onToken 每收到一个token时的回调
   * @param onComplete 流结束时的回调
   * @param onError 错误时的回调
   * @param onConversationCreated 新对话创建时的回调
   * @param skipLoading 是否跳过loading显示
   */
  async sendMessageStreamRealTime(
    message: string,
    conversationId: string | undefined,
    onToken: (token: string) => void,
    onComplete: (fullResponse: string, conversationId?: string, isNewConversation?: boolean) => void,
    onError: (error: string) => void,
    onConversationCreated?: (conversationId: string) => void,
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
        body: JSON.stringify({ message, conversation_id: conversationId }),
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
              // 如果有conversation_id，说明是新创建的对话
              const convId = event.data?.conversation_id;
              const isNewConv = event.data?.is_new_conversation;
              if (convId && isNewConv && onConversationCreated) {
                onConversationCreated(convId);
              }
              onComplete(fullResponse, convId, isNewConv);
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
  // ==================== RAG 知识库 API ====================

  /**
   * 获取知识列表
   * @param includeSystem 是否包含系统知识
   * @param docType 文档类型过滤
   */
  async getKnowledgeList(includeSystem: boolean = true, docType?: string) {
    const params = new URLSearchParams();
    params.append('include_system', String(includeSystem));
    if (docType) params.append('doc_type', docType);

    return this.request(`/api/rag/knowledge?${params.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * 上传文件到知识库
   * @param files 文件列表
   * @param docType 文档类型
   * @param metadata 元数据
   * @param skipLoading 是否跳过 loading 显示
   */
  async ingestDocuments(
    files: File[],
    docType: string = 'other',
    metadata?: Record<string, any>,
    skipLoading: boolean = false
  ): Promise<any> {
    // 创建 FormData
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('doc_type', docType);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    // 注意：上传文件时不设置 Content-Type，让浏览器自动设置
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      if (!skipLoading && this.requestCallbacks.onRequestStart) {
        this.requestCallbacks.onRequestStart();
      }

      const response = await fetch(`${API_BASE_URL}/api/rag/ingest`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } finally {
      if (!skipLoading && this.requestCallbacks.onRequestEnd) {
        this.requestCallbacks.onRequestEnd();
      }
    }
  }

  /**
   * 删除知识
   * @param docId 文档ID
   */
  async deleteKnowledge(docId: string) {
    return this.request(`/api/rag/knowledge/${docId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 搜索知识
   * @param query 查询文本
   * @param topK 返回数量
   * @param filters 过滤条件
   */
  async searchKnowledge(
    query: string,
    topK: number = 10,
    filters?: Record<string, any>
  ) {
    return this.request('/api/rag/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        top_k: topK,
        filters,
      }),
    });
  }

  /**
   * 生成上下文
   * @param query 查询文本
   * @param topK 返回数量
   * @param maxContextLength 最大上下文长度
   */
  async generateContext(
    query: string,
    topK: number = 5,
    maxContextLength: number = 3000
  ) {
    return this.request('/api/rag/context', {
      method: 'POST',
      body: JSON.stringify({
        query,
        top_k: topK,
        max_context_length: maxContextLength,
      }),
    });
  }

  // ==================== 对话管理 API ====================

  /**
   * 获取用户的对话列表
   */
  async getConversations(includeArchived: boolean = false) {
    return this.request<{ conversations: any[], total: number }>(`/api/conversations?include_archived=${includeArchived}`);
  }

  /**
   * 获取单个对话详情
   */
  async getConversation(conversationId: string) {
    return this.request<any>(`/api/conversations/${conversationId}`);
  }

  /**
   * 获取对话的消息列表
   */
  async getConversationMessages(conversationId: string) {
    return this.request<{ conversation_id: string, messages: any[], total: number }>(`/api/conversations/${conversationId}/messages`);
  }

  /**
   * 更新对话信息
   */
  async updateConversation(conversationId: string, data: { title?: string, is_pinned?: boolean, is_archived?: boolean }) {
    return this.request<any>(`/api/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 删除对话
   */
  async deleteConversation(conversationId: string, permanent: boolean = false) {
    return this.request<{ success: boolean, message: string }>(`/api/conversations/${conversationId}?permanent=${permanent}`, {
      method: 'DELETE',
    });
  }

  /**
   * 搜索消息
   */
  async searchMessages(keyword: string) {
    return this.request<{ results: any[], total: number, keyword: string }>(`/api/conversations/search?keyword=${encodeURIComponent(keyword)}`);
  }

  // ==================== 管理员 API ====================

  /**
   * 管理员登录
   */
  async adminLogin(username: string, password: string) {
    return fetch(`${API_BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  }

  /**
   * 获取当前管理员信息
   */
  async getCurrentAdmin() {
    const adminToken = localStorage.getItem('admin_access_token');
    return fetch(`${API_BASE_URL}/api/admin/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
  }

  /**
   * 管理员登出
   */
  adminLogout() {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_info');
  }
}

export const apiService = new ApiService();
