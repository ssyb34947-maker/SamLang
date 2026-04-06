import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ThinkingIndicator } from './ThinkingIndicator';

interface AIOutputProps {
  content: string;
  timestamp?: string;
  isUser?: boolean;
  isThinking?: boolean;
}
  
 /**
 * AI 输出组件
 * 封装 AI 消息和用户消息的显示，支持复制功能
 */
export const AIOutput: React.FC<AIOutputProps> = ({ 
  content, 
  timestamp, 
  isUser = false,
  isThinking = false 
}) => {
  const [copied, setCopied] = useState(false);

  // 复制内容到剪贴板
  const handleCopy = async () => {
    if (!content || isThinking) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      // 2秒后恢复复制按钮状态
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
          ) : isThinking ? (
            <ThinkingIndicator />
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
  
        {/* 操作栏：时间戳 + 复制按钮 */}
        <div className="flex items-center gap-2 mt-2">
          {timestamp && !isThinking && (
            <p
              className="text-xs"
              style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
            >
              {timestamp}
            </p>
          )}
          
          {/* 复制按钮 - 仅对AI消息且非思考状态显示 */}
          {!isUser && !isThinking && content && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded transition-all hover:bg-gray-100"
              style={{
                fontFamily: 'var(--font-hand-body)',
                fontSize: '12px',
                color: copied ? 'var(--sketch-secondary)' : 'var(--sketch-pencil)'
              }}
              title={copied ? '已复制' : '复制内容'}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>复制</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIOutput;
