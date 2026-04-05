import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AIOutputProps {
  content: string;
  timestamp?: string;
  isUser?: boolean;
}

/**
 * AI 输出组件
 * 封装 AI 消息和用户消息的显示
 */
export const AIOutput: React.FC<AIOutputProps> = ({ content, timestamp, isUser = false }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        {/* 消息气泡 */}
        <div
          className={`inline-block p-4 ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
          style={{
            fontFamily: 'var(--font-chat)',
            backgroundColor: isUser ? 'var(--sketch-paper)' : 'white',
          }}
        >
          {isUser ? (
            <p style={{ fontFamily: 'var(--font-chat)' }}>{content}</p>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>

        {/* 时间戳 */}
        {timestamp && (
          <p
            className="text-xs mt-2"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIOutput;
