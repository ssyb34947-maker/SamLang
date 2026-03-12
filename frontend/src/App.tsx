import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import './App.css'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Message type definition
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// Simulated AI responses for demo (fallback)
const SIMULATED_RESPONSES = [
  "AI: 收到你的消息啦！这是一个像素风格的回复～",
  "AI: 我在思考中... 这是一个模拟的 AI 回复！",
  "AI: 你好呀！我是像素 AI 助手，目前还在测试阶段哦！",
  "AI: 你的消息我已经收到了，现在只能回复固定内容呢～",
  "AI: 像素风格的世界真有趣！期待接入真实 API 的那一天！",
  "AI: 收到～ 现在我只是个模拟的 AI，但界面很酷不是吗？",
  "AI: 8-bit 风格万岁！让我继续为你服务吧！",
  "AI: 这是一个随机回复，展示多消息轮换效果！",
]

function App() {
  // State management
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [useRealAPI, setUseRealAPI] = useState(true) // Toggle between real API and simulation
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  // Generate unique ID
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Call real backend API
  const callRealAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error('API call failed:', error)
      // Fallback to simulation if API fails
      setUseRealAPI(false)
      throw error
    }
  }

  // Simulate AI response (fallback)
  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate network delay (1-2 seconds)
    const delay = Math.floor(Math.random() * 1000) + 1000
    await new Promise(resolve => setTimeout(resolve, delay))

    // Return a simulated response
    const randomIndex = Math.floor(Math.random() * SIMULATED_RESPONSES.length)
    return SIMULATED_RESPONSES[randomIndex]
  }

  // Handle sending message
  const handleSendMessage = async () => {
    const trimmedValue = inputValue.trim()
    if (!trimmedValue || isThinking) return

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmedValue,
      timestamp: Date.now(),
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsThinking(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      // Try real API first, fallback to simulation if it fails
      let aiResponseContent: string

      if (useRealAPI) {
        try {
          aiResponseContent = await callRealAPI(trimmedValue)
        } catch (error) {
          console.log('Falling back to simulation mode')
          aiResponseContent = await simulateAIResponse(trimmedValue)
        }
      } else {
        aiResponseContent = await simulateAIResponse(trimmedValue)
      }

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: aiResponseContent,
        timestamp: Date.now(),
      }

      // Add AI message to chat
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error generating AI response:', error)

      // Show error message
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'SAM 出错了... 请稍后再试！',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsThinking(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return (
    <div className="pixel-container h-screen flex flex-col">
      {/* Header */}
      <header className="pixel-header flex-shrink-0">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-pixel-primary animate-pulse" />
          <h1 className="text-xl md:text-2xl neon-text-primary text-pixel-primary">
            SAM LANG AGENT
          </h1>
          <Sparkles className="w-6 h-6 text-pixel-primary animate-pulse" />
        </div>
        <p className="text-xs text-pixel-secondary mt-3 opacity-80">
          ENGLISH LEARNING
        </p>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Welcome Message (shown when no messages) */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="pixel-border-accent p-8 rounded-lg">
                <Bot className="w-16 h-16 text-pixel-accent mx-auto mb-6" />
                <h2 className="text-lg md:text-xl text-pixel-accent mb-4 neon-text-primary">
                  欢迎来到山姆外语！
                </h2>
                <p className="text-xs md:text-sm text-gray-400 mb-6 max-w-md">
                  这是一个外语学习 WEB
                  <br />
                  输入消息开始和我聊天吧～
                </p>
                <div className="pixel-divider w-32 mx-auto" />
                <p className="text-xs text-pixel-warning mt-4 animate-pulse">
                  ▶ 按 Enter 发送消息
                </p>
                {/* API Status Indicator */}
                <div className="mt-4 text-xs">
                  <span className={useRealAPI ? 'text-pixel-accent' : 'text-pixel-warning'}>
                    {useRealAPI ? '✓ 已连接真实 API' : '⚠ 模拟模式'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center pixel-border ${message.role === 'user' ? 'bg-pixel-secondary' : 'bg-pixel-primary'}`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-pixel-bg" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div
                    className={`${message.role === 'user'
                      ? 'pixel-bubble-user'
                      : 'pixel-bubble-ai'
                      } rounded-sm`}
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-gray-500 mt-2 px-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center pixel-border bg-pixel-primary">
                  <Bot className="w-4 h-4 text-pixel-bg animate-pulse" />
                </div>
                <div className="pixel-bubble-ai rounded-sm">
                  <span className="pixel-loading">SAM 正在思考中...</span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 border-t-4 border-pixel-primary bg-pixel-bg p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            {/* Textarea */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isThinking ? "SAM 正在思考中..." : "输入消息... (Enter 发送，Shift+Enter 换行)"}
                disabled={isThinking}
                className="pixel-input w-full resize-none min-h-[60px] md:min-h-[80px]"
                rows={2}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isThinking}
              className="pixel-btn flex items-center gap-2 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden md:inline">发送</span>
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-gray-500 mt-3 text-center">
            {messages.length === 0
              ? "👾 开始聊天吧！"
              : `💬 已发送 ${messages.length} 条消息`}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
