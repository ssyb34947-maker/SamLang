import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, Menu, X, Edit, Trash2, User as UserIcon, Pin, PanelLeft, Sparkles, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { AIOutput } from './AIOutput';
import 'tailwindcss/tailwind.css';

// 对话类型定义
interface Conversation {
  id: string;
  conversation_id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  isPinned: boolean;
  unreadCount: number;
  isTemporary?: boolean; // 标记是否为临时对话（未保存到数据库）
}

// 消息类型定义
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
       
/**
 * Agent智能体聊天主页
 * 包含可推拉侧边栏、对话列表和聊天窗口
 */
export const ChatHome: React.FC = () => {
  // 导航
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 跳转到 Profile (SamCollege Studio)
  const navigateToProfile = () => {
    navigate('/profile');
  };

  // 状态管理
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string>('');
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTarget, setContextMenuTarget] = useState<string | null>(null);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // 对话数据
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // 消息数据
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // 生成唯一ID（用于临时对话）
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // 加载用户的对话列表
  const loadConversations = async () => {
    try {
      const response = await apiService.getConversations();
      const loadedConversations = response.conversations.map((conv: any) => ({
        id: conv.conversation_id,
        conversation_id: conv.conversation_id,
        title: conv.title,
        lastMessage: conv.last_message || '',
        lastMessageTime: conv.last_message_time 
          ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPinned: conv.is_pinned,
        unreadCount: 0,
        isTemporary: false
      }));
      setConversations(loadedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // 加载特定对话的消息
  const loadMessages = async (conversationId: string) => {
    try {
      const response = await apiService.getConversationMessages(conversationId);
      const loadedMessages = response.messages.map((msg: any) => ({
        id: msg.message_id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(prev => ({ ...prev, [conversationId]: loadedMessages }));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // 初始加载对话列表
  useEffect(() => {
    loadConversations();
  }, []);

  // 创建新对话（临时，不立即保存到数据库）
  const createNewConversation = () => {
    const newId = generateId();
    const newConversation: Conversation = {
      id: newId,
      conversation_id: newId,
      title: '新对话',
      lastMessage: '',
      lastMessageTime: '刚刚',
      isPinned: false,
      unreadCount: 0,
      isTemporary: true // 标记为临时对话
    };

    setConversations(prev => [newConversation, ...prev]);
    setMessages(prev => ({ ...prev, [newId]: [] }));
    setCurrentConversation(newId);
    setCurrentConversationId(undefined); // 临时对话没有数据库ID
  };

  // 进入页面时默认创建新对话（如果没有对话）
  useEffect(() => {
    if (conversations.length === 0 && !isLoading) {
      createNewConversation();
    }
  }, [conversations.length]);

  // 处理侧边栏展开/收起
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 处理侧边栏折叠/展开
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 开始调整侧边栏宽度
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // 调整侧边栏宽度
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth > 100 && newWidth < 500) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // 新建对话
  const handleNewConversation = () => {
    createNewConversation();
  };

  // 切换对话
  const handleConversationClick = async (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    setCurrentConversation(id);
    setCurrentConversationId(conversation.isTemporary ? undefined : conversation.conversation_id);
    
    // 如果不是临时对话，加载消息
    if (!conversation.isTemporary) {
      await loadMessages(conversation.conversation_id);
    }
    
    // 重置未读消息数
    setConversations(conversations.map(conv =>
      conv.id === id ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  // 显示右键菜单
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuTarget(id);
    setShowContextMenu(true);
  };

  // 隐藏右键菜单
  const hideContextMenu = () => {
    setShowContextMenu(false);
    setContextMenuTarget(null);
  };

  // 处理置顶/取消置顶
  const handlePinConversation = async () => {
    if (contextMenuTarget) {
      const conversation = conversations.find(c => c.id === contextMenuTarget);
      if (conversation && !conversation.isTemporary) {
        try {
          await apiService.updateConversation(conversation.conversation_id, {
            is_pinned: !conversation.isPinned
          });
          // 重新加载对话列表
          await loadConversations();
        } catch (error) {
          console.error('Failed to pin conversation:', error);
        }
      } else {
        // 临时对话只更新本地状态
        setConversations(conversations.map(conv =>
          conv.id === contextMenuTarget ? { ...conv, isPinned: !conv.isPinned } : conv
        ));
      }
      hideContextMenu();
    }
  };

  // 显示重命名对话框
  const handleRenameConversation = () => {
    if (contextMenuTarget) {
      const conversation = conversations.find(conv => conv.id === contextMenuTarget);
      if (conversation) {
        setNewConversationTitle(conversation.title);
        setRenameTarget(contextMenuTarget);
        setShowRenameDialog(true);
      }
      hideContextMenu();
    }
  };

  // 确认重命名
  const confirmRename = async () => {
    if (renameTarget && newConversationTitle.trim()) {
      const conversation = conversations.find(c => c.id === renameTarget);
      if (conversation && !conversation.isTemporary) {
        try {
          await apiService.updateConversation(conversation.conversation_id, {
            title: newConversationTitle.trim()
          });
          await loadConversations();
        } catch (error) {
          console.error('Failed to rename conversation:', error);
        }
      } else {
        setConversations(conversations.map(conv =>
          conv.id === renameTarget ? { ...conv, title: newConversationTitle.trim() } : conv
        ));
      }
      setShowRenameDialog(false);
      setRenameTarget(null);
      setNewConversationTitle('');
    }
  };

  // 删除对话
  const handleDeleteConversation = async () => {
    if (contextMenuTarget) {
      const conversation = conversations.find(c => c.id === contextMenuTarget);
      if (conversation && !conversation.isTemporary) {
        try {
          await apiService.deleteConversation(conversation.conversation_id);
          await loadConversations();
        } catch (error) {
          console.error('Failed to delete conversation:', error);
        }
      } else {
        // 临时对话直接删除
        setConversations(conversations.filter(conv => conv.id !== contextMenuTarget));
      }
      
      // 如果删除的是当前对话，切换到第一个对话
      if (contextMenuTarget === currentConversation && conversations.length > 1) {
        const firstConv = conversations.find(conv => conv.id !== contextMenuTarget);
        if (firstConv) {
          setCurrentConversation(firstConv.id);
          setCurrentConversationId(firstConv.isTemporary ? undefined : firstConv.conversation_id);
        }
      }
      hideContextMenu();
    }
  };

  // 发送消息 - 真正的实时流式
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversation) return;

    const userMessage: Message = {
      id: `${currentConversation}-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 更新消息列表（用户消息）
    setMessages(prev => ({
      ...prev,
      [currentConversation]: [...(prev[currentConversation] || []), userMessage]
    }));

    // 更新对话列表的最后一条消息
    setConversations(prev => prev.map(conv =>
      conv.id === currentConversation
        ? {
          ...conv,
          lastMessage: inputValue.trim(),
          lastMessageTime: userMessage.timestamp
        }
        : conv
    ));

    // 清空输入框
    setInputValue('');
    
    // 设置思考状态
    setIsThinking(true);

    // 调用真正的实时流式API
    try {
      const contentRef = { current: '' };
      const aiMessageId = `${currentConversation}-${Date.now() + 1}`;
      let hasReceivedToken = false;

      // 强制立即更新UI的函数
      const forceUpdate = (content: string) => {
        setMessages(prev => {
          const currentMessages = prev[currentConversation] || [];
          const lastMessage = currentMessages[currentMessages.length - 1];

          // 如果还没有AI消息，或者最后一条不是AI消息，添加新的
          if (!lastMessage || lastMessage.role !== 'assistant' || lastMessage.id !== aiMessageId) {
            const newMessage: Message = {
              id: aiMessageId,
              role: 'assistant',
              content: content,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            return {
              ...prev,
              [currentConversation]: [...currentMessages, newMessage]
            };
          }

          // 更新现有AI消息
          const updatedMessages = [...currentMessages];
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            content: content
          };
          return {
            ...prev,
            [currentConversation]: updatedMessages
          };
        });
      };

      await apiService.sendMessageStreamRealTime(
        userMessage.content,
        currentConversationId, // 如果是临时对话，这里为 undefined
        // onToken: 每收到一个token立即更新UI
        (token: string) => {
          // 收到第一个token时，取消思考状态
          if (!hasReceivedToken) {
            hasReceivedToken = true;
            setIsThinking(false);
          }
          contentRef.current += token;
          forceUpdate(contentRef.current);
        },
        // onComplete: 流完成时更新对话列表
        (fullResponse: string, newConversationId?: string, isNewConversation?: boolean) => {
          // 确保最后一次更新
          forceUpdate(fullResponse);

          // 如果是新创建的对话，更新状态
          if (isNewConversation && newConversationId) {
            setCurrentConversationId(newConversationId);
            setConversations(prev => prev.map(conv =>
              conv.id === currentConversation
                ? {
                  ...conv,
                  id: newConversationId,
                  conversation_id: newConversationId,
                  isTemporary: false
                }
                : conv
            ));
            // 更新消息key
            setMessages(prev => {
              const newMessages = { ...prev };
              newMessages[newConversationId] = newMessages[currentConversation];
              return newMessages;
            });
            setCurrentConversation(newConversationId);
          }

          setConversations(prev => prev.map(conv =>
            conv.id === (isNewConversation ? newConversationId : currentConversation)
              ? {
                ...conv,
                lastMessage: fullResponse,
                lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
              : conv
          ));
          // 确保思考状态被取消
          setIsThinking(false);
          console.log('Stream complete, full response:', fullResponse);
        },
        // onError: 错误处理
        (error: string) => {
          console.error('Stream error:', error);
          // 取消思考状态
          setIsThinking(false);

          // 更新AI消息为错误信息
          setMessages(prev => {
            const currentMessages = prev[currentConversation] || [];
            const updatedMessages = [...currentMessages];
            if (updatedMessages.length > 0) {
              updatedMessages[updatedMessages.length - 1] = {
                ...updatedMessages[updatedMessages.length - 1],
                content: '抱歉，发送消息时出现错误。请稍后再试。',
                role: 'assistant'
              };
            }
            return {
              ...prev,
              [currentConversation]: updatedMessages
            };
          });
        },
        // onConversationCreated: 新对话创建时的回调
        (convId: string) => {
          console.log('New conversation created:', convId);
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // 取消思考状态
      setIsThinking(false);

      // 更新AI消息为错误信息
      setMessages(prev => {
        const currentMessages = prev[currentConversation] || [];
        const updatedMessages = [...currentMessages];
        if (updatedMessages.length > 0) {
          updatedMessages[updatedMessages.length - 1] = {
            ...updatedMessages[updatedMessages.length - 1],
            content: '抱歉，发送消息时出现错误。请稍后再试。',
            role: 'assistant'
          };
        }
        return {
          ...prev,
          [currentConversation]: updatedMessages
        };
      });
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--sketch-bg)', color: 'var(--sketch-text)' }}>
      {/* 侧边栏 */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        conversations={conversations}
        currentConversation={currentConversation}
        onToggleSidebarCollapse={toggleSidebarCollapse}
        onNewConversation={handleNewConversation}
        onConversationClick={handleConversationClick}
        onContextMenu={handleContextMenu}
        onStartResizing={startResizing}
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--sketch-bg)' }}>
        {/* 顶部导航栏 - 手绘风格 */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            backgroundColor: 'white',
            borderBottom: '3px solid var(--sketch-border)',
            boxShadow: 'var(--shadow-hard)'
          }}
        >
          <div className="flex items-center gap-3">
            {/* 侧边栏推拉按钮 */}
            <button
              onClick={toggleSidebar}
              style={{
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--sketch-paper)',
                color: 'var(--sketch-text)',
                cursor: 'pointer',
                padding: '8px'
              }}
              title="切换侧边栏"
            >
              <PanelLeft size={20} />
            </button>

            {/* Logo 和标题 */}
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--sketch-paper)',
                  border: '3px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly-sm)',
                  boxShadow: 'var(--shadow-hard)',
                  transform: 'rotate(-3deg)'
                }}
              >
                <Sparkles size={18} style={{ color: 'var(--sketch-accent)' }} />
              </div>
              <h1
                className="text-xl"
                style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
              >
                {sidebarOpen && !sidebarCollapsed ?
                  conversations.find(c => c.id === currentConversation)?.title || '新对话' :
                  'SAM PROFESSOR AGENT'
                }
              </h1>
            </div>
          </div>

          {/* 用户信息和操作按钮 */}
          <div className="flex items-center gap-2">
            {/* 用户信息 */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-text)', fontSize: '14px' }}>
                    欢迎，{user.username}
                  </p>
                </div>
                <button
                  onClick={navigateToProfile}
                  className="sketch-btn"
                  style={{ padding: '8px' }}
                  title="SamCollege Studio"
                >
                  <UserIcon size={18} />
                </button>
                <button
                  onClick={() => logout()}
                  className="sketch-btn"
                  style={{
                    padding: '8px',
                    backgroundColor: 'var(--sketch-accent)',
                    color: 'white'
                  }}
                  title="登出"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}

            {/* 未登录用户显示 Studio 按钮 */}
            {!user && (
              <button
                onClick={navigateToProfile}
                className="sketch-btn"
                style={{ padding: '8px 16px' }}
                title="SamCollege Studio"
              >
                <UserIcon size={18} className="mr-2" />
                <span style={{ fontFamily: 'var(--font-hand-body)' }}>Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* 聊天窗口 */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--sketch-bg)' }}>
          {messages[currentConversation]?.length > 0 ? (
            <>
              {messages[currentConversation].map((message) => (
                <AIOutput
                  key={message.id}
                  content={message.content}
                  timestamp={message.timestamp}
                  isUser={message.role === 'user'}
                />
              ))}
              {/* AI 思考中动画 */}
              {isThinking && (
                <AIOutput
                  content=""
                  isUser={false}
                  isThinking={true}
                />
              )}
            </>
          ) : (
            /* 欢迎画面 */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="p-8 relative"
                style={{
                  backgroundColor: 'white',
                  border: '4px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly)',
                  boxShadow: 'var(--shadow-hard-lg)',
                  maxWidth: '500px'
                }}
              >
                {/* 胶带装饰 */}
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 -rotate-2"
                  style={{
                    width: '100px',
                    height: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid var(--sketch-border)',
                    borderRadius: '4px'
                  }}
                />

                {/* Logo */}
                <div
                  className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--sketch-paper)',
                    border: '3px solid var(--sketch-border)',
                    borderRadius: 'var(--wobbly-sm)',
                    boxShadow: 'var(--shadow-hard)',
                    transform: 'rotate(3deg)'
                  }}
                >
                  <Sparkles size={32} style={{ color: 'var(--sketch-accent)' }} />
                </div>

                <h2
                  className="text-lg md:text-xl mb-4"
                  style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 700, color: 'var(--sketch-text)' }}
                >
                  欢迎来到山姆学院！
                </h2>
                <p
                  className="mb-6"
                  style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-text)' }}
                >
                  我是你的 AI 学习助手，可以帮你解答问题、学习知识。
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--sketch-paper)',
                    border: '2px dashed var(--sketch-border)',
                    borderRadius: 'var(--wobbly-sm)',
                    padding: '16px',
                    marginBottom: '16px'
                  }}
                >
                  <p
                    className="text-sm mb-2"
                    style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-accent)' }}
                  >
                    💡 你可以这样问我：
                  </p>
                  <ul
                    className="text-sm space-y-1"
                    style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-text)' }}
                  >
                    <li>• "帮我解释一下什么是机器学习"</li>
                    <li>• "给我讲讲 Python 的基础语法"</li>
                    <li>• "如何准备雅思考试？"</li>
                  </ul>
                </div>

                <p
                  className="text-sm"
                  style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                >
                  ✏️ 在下方输入框开始你的学习之旅吧！
                </p>
              </div>
            </div>
          )}
        </div>


        {/* 输入区域 - 手绘风格 */}
        {/* 输入区域 - 手绘风格 */}
        <div
          className="p-4"
          style={{
            backgroundColor: 'white',
            borderTop: '3px solid var(--sketch-border)',
            boxShadow: '0 -4px 0px 0px var(--sketch-border)'
          }}
        >
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入你想学习的内容吧～"
              className="chat-input flex-1"
              rows={2}
              style={{ minHeight: '60px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="sketch-btn"
              style={{
                backgroundColor: inputValue.trim() ? 'var(--sketch-secondary)' : 'var(--sketch-muted)',
                color: inputValue.trim() ? 'white' : 'var(--sketch-pencil)'
              }}
            >
              <Send size={20} />
            </button>
          </div>
          <p
            className="text-xs mt-3 text-center"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
          >
            按 Enter 发送消息，Shift + Enter 换行
          </p>
        </div>
      </div>

      {/* 右键菜单 - 手绘风格 */}
      {showContextMenu && contextMenuTarget && (
        <div
          className="fixed z-50 py-2"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            backgroundColor: 'white',
            border: '3px solid var(--sketch-border)',
            borderRadius: 'var(--wobbly-sm)',
            boxShadow: 'var(--shadow-hard)'
          }}
          onMouseLeave={hideContextMenu}
        >
          <button
            onClick={handlePinConversation}
            className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'var(--font-hand-body)' }}
          >
            <Pin size={16} style={{ color: 'var(--sketch-secondary)' }} />
            <span>{conversations.find(c => c.id === contextMenuTarget)?.isPinned ? '取消置顶' : '置顶'}</span>
          </button>
          <button
            onClick={handleRenameConversation}
            className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'var(--font-hand-body)' }}
          >
            <Edit size={16} style={{ color: 'var(--sketch-secondary)' }} />
            <span>重命名</span>
          </button>
          <button
            onClick={handleDeleteConversation}
            className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-accent)' }}
          >
            <Trash2 size={16} />
            <span>删除</span>
          </button>
        </div>
      )}

      {/* 重命名对话框 - 手绘风格 */}
      {showRenameDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(45, 45, 45, 0.5)' }}
        >
          <div
            className="p-6 w-96"
            style={{
              backgroundColor: 'white',
              border: '4px solid var(--sketch-border)',
              borderRadius: 'var(--wobbly)',
              boxShadow: 'var(--shadow-hard-lg)'
            }}
          >
            <h3
              className="text-lg mb-4"
              style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 700 }}
            >
              重命名对话
            </h3>
            <input
              type="text"
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
              className="sketch-input mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRenameDialog(false)}
                className="sketch-btn"
                style={{ padding: '8px 16px' }}
              >
                取消
              </button>
              <button
                onClick={confirmRename}
                className="sketch-btn"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--sketch-secondary)',
                  color: 'white'
                }}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
