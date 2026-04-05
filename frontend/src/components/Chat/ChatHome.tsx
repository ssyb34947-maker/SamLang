import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, Menu, X, Edit, Trash2, User as UserIcon, Pin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Sidebar } from './Sidebar';
import { MarkdownRenderer } from './MarkdownRenderer';
import 'tailwindcss/tailwind.css';

// 对话类型定义
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  isPinned: boolean;
  unreadCount: number;
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

  // 跳转到 Profile (SamCollege Studio)
  const navigateToProfile = () => {
    navigate('/profile');
  };

  // 状态管理
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string>('1');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTarget, setContextMenuTarget] = useState<string | null>(null);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  // 模拟对话数据
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'React学习',
      lastMessage: '如何使用useEffect钩子？',
      lastMessageTime: '10:30',
      isPinned: true,
      unreadCount: 0
    },
    {
      id: '2',
      title: 'TypeScript基础',
      lastMessage: '接口和类型的区别是什么？',
      lastMessageTime: '09:15',
      isPinned: false,
      unreadCount: 2
    },
    {
      id: '3',
      title: 'Tailwind CSS',
      lastMessage: '如何实现响应式布局？',
      lastMessageTime: '昨天',
      isPinned: false,
      unreadCount: 0
    },
    {
      id: '4',
      title: 'API设计',
      lastMessage: 'RESTful API的最佳实践',
      lastMessageTime: '2天前',
      isPinned: false,
      unreadCount: 0
    }
  ]);

  // 模拟消息数据
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      { id: '1-1', role: 'user', content: '你好，我想学习React的useEffect钩子', timestamp: '10:25' },
      { id: '1-2', role: 'assistant', content: 'useEffect是React中的一个钩子，用于处理副作用。它接收两个参数：一个回调函数和一个依赖数组。当依赖数组中的值发生变化时，回调函数会被执行。', timestamp: '10:30' },
      { id: '1-3', role: 'user', content: '如何使用useEffect钩子？', timestamp: '10:30' }
    ],
    '2': [
      { id: '2-1', role: 'user', content: 'TypeScript中的接口和类型有什么区别？', timestamp: '09:10' },
      { id: '2-2', role: 'assistant', content: '接口和类型在TypeScript中都用于定义类型，但接口只能用于对象类型，而类型可以用于任何类型。此外，接口可以被扩展，而类型不能。', timestamp: '09:15' }
    ],
    '3': [
      { id: '3-1', role: 'user', content: '如何使用Tailwind CSS实现响应式布局？', timestamp: '昨天' },
      { id: '3-2', role: 'assistant', content: 'Tailwind CSS提供了响应式前缀，如sm:, md:, lg:, xl:等，用于在不同屏幕尺寸下应用不同的样式。例如，sm:text-lg表示在小屏幕及以上尺寸应用text-lg样式。', timestamp: '昨天' }
    ],
    '4': [
      { id: '4-1', role: 'user', content: 'RESTful API的最佳实践有哪些？', timestamp: '2天前' },
      { id: '4-2', role: 'assistant', content: 'RESTful API的最佳实践包括：使用HTTP方法（GET, POST, PUT, DELETE）、使用资源路径、使用状态码、使用JSON格式、使用版本控制等。', timestamp: '2天前' }
    ]
  });

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
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: '新对话',
      lastMessage: '',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPinned: false,
      unreadCount: 0
    };
    setConversations([newConv, ...conversations]);
    setCurrentConversation(newId);
    setMessages({ ...messages, [newId]: [] });
  };

  // 切换对话
  const handleConversationClick = (id: string) => {
    setCurrentConversation(id);
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
  const handlePinConversation = () => {
    if (contextMenuTarget) {
      setConversations(conversations.map(conv =>
        conv.id === contextMenuTarget ? { ...conv, isPinned: !conv.isPinned } : conv
      ));
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
  const confirmRename = () => {
    if (renameTarget && newConversationTitle.trim()) {
      setConversations(conversations.map(conv =>
        conv.id === renameTarget ? { ...conv, title: newConversationTitle.trim() } : conv
      ));
      setShowRenameDialog(false);
      setRenameTarget(null);
      setNewConversationTitle('');
    }
  };

  // 删除对话
  const handleDeleteConversation = () => {
    if (contextMenuTarget) {
      setConversations(conversations.filter(conv => conv.id !== contextMenuTarget));
      // 如果删除的是当前对话，切换到第一个对话
      if (contextMenuTarget === currentConversation && conversations.length > 1) {
        const firstConv = conversations.find(conv => conv.id !== contextMenuTarget);
        if (firstConv) {
          setCurrentConversation(firstConv.id);
        }
      }
      hideContextMenu();
    }
  };

  // 发送消息 - 真正的实时流式
  const handleSendMessage = async () => {
    if (inputValue.trim() && currentConversation) {
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

      // 创建AI消息的占位符（初始为空）
      const aiMessageId = `${currentConversation}-${Date.now() + 1}`;
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',  // 初始为空，会逐步填充
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // 添加AI消息的占位符到消息列表
      setMessages(prev => ({
        ...prev,
        [currentConversation]: [...(prev[currentConversation] || []), aiMessage]
      }));

      // 调用真正的实时流式API
      try {
        // 使用 ref 来存储当前内容，避免闭包问题
        const contentRef = { current: '' };
        // 使用 ref 来标记是否有待处理的更新
        const pendingUpdateRef = { current: false };
        // 使用 ref 存储最新的消息ID
        const messageIdRef = { current: aiMessageId };

        // 强制立即更新UI的函数
        const forceUpdate = (content: string) => {
          setMessages(prev => {
            const currentMessages = prev[currentConversation] || [];
            const lastMessage = currentMessages[currentMessages.length - 1];

            if (lastMessage && lastMessage.id === messageIdRef.current) {
              const updatedMessages = [...currentMessages];
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: content
              };
              return {
                ...prev,
                [currentConversation]: updatedMessages
              };
            }
            return prev;
          });
        };

        await apiService.sendMessageStreamRealTime(
          userMessage.content,
          // onToken: 每收到一个token立即更新UI
          (token: string) => {
            contentRef.current += token;
            // 直接立即更新，不批量处理
            forceUpdate(contentRef.current);
          },
          // onComplete: 流完成时更新对话列表
          (fullResponse: string) => {
            // 确保最后一次更新
            forceUpdate(fullResponse);

            setConversations(prev => prev.map(conv =>
              conv.id === currentConversation
                ? {
                  ...conv,
                  lastMessage: fullResponse,
                  lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
                : conv
            ));
            console.log('Stream complete, full response:', fullResponse);
          },
          // onError: 错误处理
          (error: string) => {
            console.error('Stream error:', error);

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
        );
      } catch (error) {
        console.error('Error sending message:', error);

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
            <button
              onClick={toggleSidebar}
              className="sketch-btn p-2"
              style={{ padding: '8px 12px' }}
              title={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 
              className="text-xl"
              style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
            >
              {sidebarOpen && !sidebarCollapsed ?
                conversations.find(c => c.id === currentConversation)?.title || '新对话' :
                <span
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={navigateToProfile}
                  style={{ color: 'var(--sketch-secondary)' }}
                >
                  SamCollege Studio
                </span>
              }
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="sketch-btn p-2"
              style={{ padding: '8px 12px' }}
              onClick={navigateToProfile}
              title="SamCollege Studio"
            >
              <UserIcon size={20} />
            </button>
            <button className="sketch-btn p-2" style={{ padding: '8px 12px' }}>
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* 聊天窗口 */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--sketch-bg)' }}>
          {messages[currentConversation]?.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                {/* AI对话区域使用黑体，其他使用手绘字体 */}
                <div 
                  className={`inline-block p-4 ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
                  style={{
                    fontFamily: 'var(--font-chat)',
                    backgroundColor: message.role === 'user' ? 'var(--sketch-paper)' : 'white',
                  }}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <p style={{ fontFamily: 'var(--font-chat)' }}>{message.content}</p>
                  )}
                </div>
                <p 
                  className="text-xs mt-2"
                  style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          )) || (
              <div 
                className="flex flex-col items-center justify-center h-full"
                style={{ color: 'var(--sketch-pencil)', fontFamily: 'var(--font-hand-body)' }}
              >
                <div 
                  className="sketch-card-note text-center p-8"
                  style={{ maxWidth: '400px' }}
                >
                  <p className="text-lg mb-4">选择一个对话或创建新对话开始聊天</p>
                  <div className="sketch-divider" />
                  <p className="text-sm mt-4" style={{ color: 'var(--sketch-accent)' }}>
                    ✏️ 开始你的学习之旅吧！
                  </p>
                </div>
              </div>
            )}
        </div>

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
              placeholder="输入消息..."
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
