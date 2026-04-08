/**
 * AI助手侧边栏组件
 */

import { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AI_ASSISTANT_CONFIG, AI_SUGGESTED_QUESTIONS, AI_MOCK_RESPONSES, AI_DEFAULT_RESPONSE } from '../constants';
import type { AIMessage } from '../types';

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: AI_ASSISTANT_CONFIG.welcomeMessage,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getMockResponse = (question: string): string => {
    for (const [key, response] of Object.entries(AI_MOCK_RESPONSES)) {
      if (question.toLowerCase().includes(key.toLowerCase())) {
        return response;
      }
    }
    return AI_DEFAULT_RESPONSE;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // 模拟AI响应延迟
    setTimeout(() => {
      const response = getMockResponse(userMessage.content);
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <>
      {/* 切换按钮 */}
      <button
        onClick={onToggle}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 p-2 transition-all"
        style={{
          backgroundColor: 'var(--sketch-secondary)',
          border: '3px solid var(--sketch-border)',
          borderLeft: 'none',
          borderRadius: '0 var(--wobbly-sm) var(--wobbly-sm) 0',
          boxShadow: 'var(--shadow-hard)',
        }}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white" />
        )}
      </button>

      {/* 侧边栏 */}
      <div
        className="fixed left-0 top-0 h-full z-40 transition-transform duration-300"
        style={{
          width: 320,
          backgroundColor: 'white',
          borderRight: '3px solid var(--sketch-border)',
          boxShadow: 'var(--shadow-hard-lg)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* 头部 */}
        <div
          className="p-4 border-b-2"
          style={{ borderColor: 'var(--sketch-border)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{AI_ASSISTANT_CONFIG.avatar}</span>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-hand-heading)',
                  fontWeight: 700,
                  color: 'var(--sketch-text)',
                }}
              >
                {AI_ASSISTANT_CONFIG.name}
              </h3>
              <p
                className="text-xs"
                style={{
                  fontFamily: 'var(--font-hand-body)',
                  color: 'var(--sketch-pencil)',
                }}
              >
                AI数据助手
              </p>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100% - 280px)' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className="inline-block max-w-[85%] p-3"
                style={{
                  backgroundColor: msg.role === 'user' ? 'var(--sketch-secondary)' : 'var(--sketch-paper)',
                  border: '2px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly-sm)',
                  fontFamily: 'var(--font-hand-body)',
                  color: msg.role === 'user' ? 'white' : 'var(--sketch-text)',
                  fontSize: 14,
                  whiteSpace: 'pre-line',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-left mb-4">
              <div
                className="inline-block p-3"
                style={{
                  backgroundColor: 'var(--sketch-paper)',
                  border: '2px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly-sm)',
                }}
              >
                <div className="flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 建议问题 */}
        <div className="p-3 border-t-2" style={{ borderColor: 'var(--sketch-border)' }}>
          <p
            className="text-xs mb-2"
            style={{
              fontFamily: 'var(--font-hand-body)',
              color: 'var(--sketch-pencil)',
            }}
          >
            你可以问：
          </p>
          <div className="flex flex-wrap gap-2">
            {AI_SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestedQuestion(q)}
                className="text-xs px-2 py-1 transition-all hover:opacity-80"
                style={{
                  fontFamily: 'var(--font-hand-body)',
                  backgroundColor: 'var(--sketch-paper)',
                  border: '1px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly-sm)',
                  color: 'var(--sketch-text)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 输入框 */}
        <div
          className="p-4 border-t-2"
          style={{ borderColor: 'var(--sketch-border)' }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={AI_ASSISTANT_CONFIG.placeholder}
              className="flex-1 px-3 py-2 text-sm"
              style={{
                fontFamily: 'var(--font-hand-body)',
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 transition-all"
              style={{
                backgroundColor: input.trim() ? 'var(--sketch-secondary)' : 'var(--sketch-muted)',
                border: '2px solid var(--sketch-border)',
                borderRadius: 'var(--wobbly-sm)',
              }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
