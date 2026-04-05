import React, { useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Pin, MessageSquare } from 'lucide-react';

// 对话类型定义
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  isPinned: boolean;
  unreadCount: number;
}

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  conversations: Conversation[];
  currentConversation: string;
  onToggleSidebarCollapse: () => void;
  onNewConversation: () => void;
  onConversationClick: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onStartResizing: (e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  sidebarCollapsed,
  sidebarWidth,
  conversations,
  currentConversation,
  onToggleSidebarCollapse,
  onNewConversation,
  onConversationClick,
  onContextMenu,
  onStartResizing,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 按置顶状态和最后消息时间排序对话
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessageTime.localeCompare(a.lastMessageTime);
  });

  if (!sidebarOpen) return null;

  return (
    <div
      ref={sidebarRef}
      className="transition-all duration-300 relative h-full flex-shrink-0"
      style={{ 
        width: sidebarCollapsed ? '80px' : `${sidebarWidth}px`, 
        minWidth: '80px',
        backgroundColor: 'white',
        borderRight: '3px solid var(--sketch-border)',
        boxShadow: 'var(--shadow-hard)'
      }}
    >
      {/* 侧边栏头部 */}
      <div 
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: '3px dashed var(--sketch-muted)' }}
      >
        {!sidebarCollapsed && (
          <h2 
            className="text-xl"
            style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 700, color: 'var(--sketch-text)' }}
          >
            对话列表
          </h2>
        )}
        <button
          onClick={onToggleSidebarCollapse}
          className="sketch-btn p-2"
          style={{ padding: '6px 10px' }}
          title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* 新建对话按钮 */}
      <div className="p-4">
        <button
          onClick={onNewConversation}
          className="sketch-btn w-full"
          style={{ 
            padding: sidebarCollapsed ? '10px' : '12px 16px',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}
        >
          <Plus size={20} />
          {!sidebarCollapsed && <span style={{ marginLeft: '8px' }}>新建对话</span>}
        </button>
      </div>

      {/* 对话列表 */}
      <div 
        className="overflow-y-auto"
        style={{ height: 'calc(100% - 140px)' }}
      >
        {sortedConversations.map((conversation, index) => (
          <div
            key={conversation.id}
            onClick={() => onConversationClick(conversation.id)}
            onContextMenu={(e) => onContextMenu(e, conversation.id)}
            className="cursor-pointer transition-all duration-200"
            style={{
              padding: sidebarCollapsed ? '12px 8px' : '16px',
              borderBottom: '2px dashed var(--sketch-muted)',
              backgroundColor: currentConversation === conversation.id ? 'var(--sketch-paper)' : 'transparent',
              borderLeft: currentConversation === conversation.id ? '4px solid var(--sketch-accent)' : '4px solid transparent',
              transform: currentConversation === conversation.id ? 'rotate(-0.5deg)' : 'none',
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2" style={{ width: '100%' }}>
                {conversation.isPinned && (
                  <Pin 
                    size={16} 
                    style={{ color: 'var(--sketch-accent)', flexShrink: 0 }} 
                  />
                )}
                {!sidebarCollapsed ? (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between">
                      <h3 
                        className="truncate"
                        style={{ 
                          fontFamily: 'var(--font-hand-heading)', 
                          fontWeight: 600,
                          color: 'var(--sketch-text)'
                        }}
                      >
                        {conversation.title}
                      </h3>
                      <span 
                        className="text-xs"
                        style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                      >
                        {conversation.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p 
                        className="text-sm truncate"
                        style={{ 
                          fontFamily: 'var(--font-hand-body)', 
                          color: 'var(--sketch-pencil)',
                          maxWidth: '70%'
                        }}
                      >
                        {conversation.lastMessage || '无消息'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span 
                          className="text-xs px-2 py-1"
                          style={{ 
                            backgroundColor: 'var(--sketch-accent)', 
                            color: 'white',
                            borderRadius: 'var(--wobbly-sm)',
                            fontFamily: 'var(--font-hand-heading)'
                          }}
                        >
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-center"
                    style={{ 
                      width: '40px', 
                      height: '40px',
                      backgroundColor: currentConversation === conversation.id ? 'var(--sketch-paper)' : 'var(--sketch-muted)',
                      border: '2px solid var(--sketch-border)',
                      borderRadius: 'var(--wobbly-sm)',
                      transform: index % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)'
                    }}
                  >
                    <MessageSquare size={18} style={{ color: 'var(--sketch-text)' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 调整手柄 */}
      {!sidebarCollapsed && (
        <div
          onMouseDown={onStartResizing}
          className="absolute top-0 cursor-col-resize hover:bg-gray-400 transition-colors"
          style={{ 
            right: 0, 
            top: 0, 
            height: '100%',
            width: '6px',
            backgroundColor: 'var(--sketch-muted)',
            borderLeft: '2px dashed var(--sketch-border)'
          }}
        />
      )}
    </div>
  );
};
