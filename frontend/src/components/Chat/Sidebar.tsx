import React, { useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Pin } from 'lucide-react';

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
      className="bg-gray-800 border-r border-gray-700 transition-all duration-300 relative h-full flex-shrink-0"
      style={{ width: sidebarCollapsed ? '64px' : `${sidebarWidth}px`, minWidth: '64px' }}
    >
      {/* 侧边栏头部 */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!sidebarCollapsed && (
          <h2 className="text-xl font-bold text-cyan-400">对话列表</h2>
        )}
        <button
          onClick={onToggleSidebarCollapse}
          className="p-2 rounded hover:bg-gray-700 transition-colors"
          title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* 新建对话按钮 */}
      <div className="p-4">
        <button
          onClick={onNewConversation}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition-colors ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          <Plus size={20} />
          {!sidebarCollapsed && <span>新建对话</span>}
        </button>
      </div>

      {/* 对话列表 */}
      <div className="overflow-y-auto h-[calc(100%-140px)]">
        {sortedConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onConversationClick(conversation.id)}
            onContextMenu={(e) => onContextMenu(e, conversation.id)}
            className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${currentConversation === conversation.id ? 'bg-gray-700' : 'hover:bg-gray-750'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {conversation.isPinned && (
                  <Pin size={16} className="text-yellow-400 flex-shrink-0" />
                )}
                {!sidebarCollapsed && (
                  <h3 className="font-medium truncate">{conversation.title}</h3>
                )}
              </div>
              {!sidebarCollapsed && (
                <span className="text-xs text-gray-400">{conversation.lastMessageTime}</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-400 truncate">{conversation.lastMessage || '无消息'}</p>
                {conversation.unreadCount > 0 && (
                  <span className="bg-cyan-500 text-xs px-2 py-1 rounded-full">{conversation.unreadCount}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 调整手柄 */}
      {!sidebarCollapsed && (
        <div
          onMouseDown={onStartResizing}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-gray-600 hover:bg-gray-500 transition-colors"
          style={{ right: 0, top: 0, height: '100%' }}
        />
      )}
    </div>
  );
};
