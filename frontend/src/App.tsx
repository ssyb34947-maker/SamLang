import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, LogOut, User as UserIcon, Layout } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useAuth } from './hooks/useAuth.tsx'
import { apiService } from './services/api'
import './App.css'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Message type definition
interface ToolCall {
    tool_name: string
    arguments: any
    result: string
}

interface ThinkingStep {
    thought: string
    tool_call?: ToolCall
}

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    thinkingSteps?: ThinkingStep[]
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
    const { user, logout } = useAuth()
    const navigate = useNavigate()

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

    // 使用apiService发送消息
    const callRealAPI = async (userMessage: string): Promise<{ success: boolean, message: string, thinking_steps?: any[] }> => {
        try {
            const response = await apiService.sendMessage(userMessage)
            return response
        } catch (error) {
            console.error('API call failed:', error)
            // Fallback to simulation if API fails
            setUseRealAPI(false)
            throw error
        }
    }

    // 使用apiService发送流式消息（支持实时思考过程）
    const callRealAPIWithStreaming = async (userMessage: string, onThinkingStep: (step: ThinkingStep) => void, onFinalResponse: (content: string) => void): Promise<string> => {
        try {
            return await apiService.sendMessageStream(userMessage, (eventType, data) => {
                if (eventType === 'thinking_step') {
                    onThinkingStep({
                        thought: data.thought,
                        tool_call: data.tool_call
                    })
                } else if (eventType === 'tool_call') {
                    onThinkingStep({
                        thought: '正在调用工具',
                        tool_call: {
                            tool_name: data.tool_name,
                            arguments: data.arguments,
                            result: '执行中...'
                        }
                    })
                } else if (eventType === 'tool_result') {
                    onThinkingStep({
                        thought: '工具执行完成',
                        tool_call: {
                            tool_name: data.tool_name,
                            arguments: data.arguments,
                            result: data.result
                        }
                    })
                } else if (eventType === 'final_response') {
                    onFinalResponse(data.content)
                }
            })
        } catch (error) {
            console.error('Streaming API call failed:', error)
            // Fallback to non-streaming API
            const response = await callRealAPI(userMessage)
            return response.message
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

        // Create AI message with empty content for streaming
        const aiMessageId = generateId()
        const aiMessage: Message = {
            id: aiMessageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        }

        try {
            // Try real API with streaming first
            if (useRealAPI) {
                try {
                    // Create a mutable array to hold thinking steps
                    const thinkingSteps: ThinkingStep[] = []

                    // Update the AI message as thinking steps and final response come in
                    let aiMessageAdded = false
                    const updateAiMessage = () => {
                        if (!aiMessageAdded) {
                            // Stop thinking indicator and add AI message
                            setIsThinking(false)
                            setMessages(prev => [...prev, { ...aiMessage, thinkingSteps: [] }])
                            aiMessageAdded = true
                        }
                        // Update the AI message with current thinking steps
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, thinkingSteps: [...thinkingSteps] }
                                : msg
                        ))
                    }

                    // Handle thinking steps
                    const handleThinkingStep = (step: ThinkingStep) => {
                        thinkingSteps.push(step)
                        updateAiMessage()
                    }

                    // Handle final response with streaming effect
                    const handleFinalResponse = (content: string) => {
                        // 确保消息已经添加到数组中
                        if (!aiMessageAdded) {
                            setIsThinking(false)
                            setMessages(prev => [...prev, { ...aiMessage, content: '', thinkingSteps: [] }])
                            aiMessageAdded = true
                        }

                        // 流式打印效果
                        let currentIndex = 0
                        const totalLength = content.length
                        const typingSpeed = 30 // 打字速度（毫秒/字符）

                        const typeWriter = () => {
                            if (currentIndex < totalLength) {
                                const newContent = content.substring(0, currentIndex + 1)
                                setMessages(prev => prev.map(msg =>
                                    msg.id === aiMessageId
                                        ? { ...msg, content: newContent }
                                        : msg
                                ))
                                currentIndex++
                                setTimeout(typeWriter, typingSpeed)
                            }
                        }

                        typeWriter()
                    }

                    // Call streaming API with real-time thinking process
                    await callRealAPIWithStreaming(trimmedValue, handleThinkingStep, handleFinalResponse)
                } catch (error) {
                    console.log('Falling back to non-streaming API')
                    // Fallback to non-streaming API
                    setIsThinking(false)
                    callRealAPI(trimmedValue).then(response => {
                        const content = response.message || ''
                        const thinkingSteps = response.thinking_steps || []
                        setMessages(prev => [...prev, { ...aiMessage, content, thinkingSteps }])
                    })
                }
            } else {
                // Use simulation
                const aiResponseContent = await simulateAIResponse(trimmedValue)
                setIsThinking(false)
                setMessages(prev => [...prev, { ...aiMessage, content: aiResponseContent }])
            }
        } catch (error) {
            console.error('Error generating AI response:', error)
            setIsThinking(false)
            // Add error message
            setMessages(prev => [...prev, { ...aiMessage, content: 'SAM 出错了... 请稍后再试！' }])
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

    // Fix Markdown table format
    const fixMarkdownTable = (content: string): string => {
        // Check if content contains a table
        if (!content.includes('|')) {
            return content
        }

        // Check if table is all in one line (no newlines between table rows)
        if (!content.includes('\n|')) {
            // Split the entire content by |
            const parts = content.split('|').map(part => part.trim()).filter(part => part !== '')

            // Find the separator line (contains multiple dashes)
            let separatorIndex = -1
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].match(/^-+$/)) {
                    separatorIndex = i
                    break
                }
            }

            if (separatorIndex === -1) {
                return content
            }

            // Extract header cells
            const headerCells = parts.slice(0, separatorIndex)
            const cellsPerRow = headerCells.length

            if (cellsPerRow === 0) {
                return content
            }

            // Extract separator
            const separator = parts[separatorIndex]
            const separatorLine = '| ' + Array(cellsPerRow).fill(separator).join(' | ') + ' |'

            // Extract rows
            const rowCells = parts.slice(separatorIndex + 1)
            const rowLines: string[] = []

            for (let i = 0; i < rowCells.length; i += cellsPerRow) {
                const row = rowCells.slice(i, i + cellsPerRow)
                if (row.length === cellsPerRow) {
                    rowLines.push('| ' + row.join(' | ') + ' |')
                }
            }

            // Reconstruct the table
            const headerLine = '| ' + headerCells.join(' | ') + ' |'
            const fixedTable = [
                headerLine,
                separatorLine,
                ...rowLines
            ].join('\n')

            // Find where the table starts and replace it
            const tableStart = content.indexOf('|')
            const tableEnd = content.lastIndexOf('|') + 1

            if (tableStart !== -1 && tableEnd !== -1) {
                return content.substring(0, tableStart) + fixedTable + content.substring(tableEnd)
            }
        }

        return content
    }

    return (
        <div className="pixel-container h-screen flex flex-col">
            {/* Header */}
            <header className="pixel-header flex-shrink-0">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-pixel-primary animate-pulse" />
                        <h1 className="text-xl md:text-2xl neon-text-primary text-pixel-primary">
                            SAM LANG AGENT
                        </h1>
                        <Sparkles className="w-6 h-6 text-pixel-primary animate-pulse" />
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm text-pixel-secondary">欢迎，{user.username}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            <button
                                onClick={() => navigate('/profile')}
                                className="pixel-border bg-pixel-secondary w-8 h-8 flex items-center justify-center hover:bg-pink-600 transition-colors"
                                title="SamLang Studio"
                            >
                                <UserIcon className="w-4 h-4 text-white" />
                            </button>
                            <button
                                onClick={() => logout()}
                                className="text-pixel-secondary hover:text-pixel-error transition-colors"
                                title="登出"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {/* Guest User Studio Access */}
                    {!user && (
                        <button
                            onClick={() => navigate('/profile')}
                            className="pixel-border bg-pixel-secondary px-4 py-2 hover:bg-pink-600 transition-colors flex items-center gap-2"
                            title="SamLang Studio"
                        >
                            <UserIcon className="w-4 h-4 text-white" />
                            <span className="text-sm">Studio</span>
                        </button>
                    )}
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
                                <img src="/logo.png" className="w-16 h-16 text-pixel-accent mx-auto mb-6" alt="AI Logo" />
                                <h2 className="text-lg md:text-xl text-pixel-accent mb-4 neon-text-primary">
                                    欢迎来到山姆外语！
                                </h2>
                                <p className="text-xs md:text-sm text-gray-400 mb-6 max-w-md">
                                    这是一个外语学习智能体
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
                                        {useRealAPI ? '✓ 已准备就绪' : '⚠ 模拟模式'}
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
                            <div className={`flex items-end gap-2 ${message.role === 'user' ? 'max-w-[95%] md:max-w-[85%] flex-row-reverse' : 'max-w-[95%] md:max-w-[90%] flex-row'}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center pixel-border ${message.role === 'user' ? 'bg-pixel-secondary' : 'bg-pixel-primary'}`}>
                                    {message.role === 'user' ? (
                                        <User className="w-4 h-4 text-white" />
                                    ) : (
                                        <img src="/logo.png" className="w-4 h-4" alt="AI Logo" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className="flex flex-col">
                                    <div className={`${message.role === 'user'
                                        ? 'pixel-bubble-user'
                                        : 'pixel-bubble-ai'
                                        } rounded-sm`}>
                                        {/* 思考过程（可折叠） */}
                                        {message.role === 'assistant' && message.thinkingSteps && message.thinkingSteps.length > 0 && (
                                            <div className="mb-3">
                                                <button
                                                    className="flex items-center gap-1 text-xs text-pixel-secondary hover:text-pixel-primary mb-2 font-bold"
                                                    onClick={() => {
                                                        const element = document.getElementById(`thinking-${message.id}`);
                                                        if (element) {
                                                            element.classList.toggle('hidden');
                                                        }
                                                    }}
                                                >
                                                    <span>💡 思考过程</span>
                                                    <span className="text-xs">▼</span>
                                                </button>
                                                <div id={`thinking-${message.id}`} className="bg-gray-900/80 border-2 border-gray-700 rounded p-4 text-xs hidden">
                                                    {message.thinkingSteps.map((step, index) => (
                                                        <div key={index} className="mb-4">
                                                            <div className="font-bold text-pixel-primary mb-2">思考 {index + 1}:</div>
                                                            <div className="text-gray-300 mb-2">{step.thought}</div>
                                                            {step.tool_call && (
                                                                <div className="mt-2 p-3 bg-gray-800/60 rounded border border-gray-600">
                                                                    <div className="font-bold text-pixel-accent mb-2">工具调用:</div>
                                                                    <div className="mt-1">
                                                                        <div className="text-pixel-secondary mb-1">工具名称: <span className="text-white">{step.tool_call.tool_name}</span></div>
                                                                        <div className="mt-1 mb-1">参数: <span className="text-white">{JSON.stringify(step.tool_call.arguments)}</span></div>
                                                                        <div className="mt-1">结果: <span className="text-white">{step.tool_call.result}</span></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 最终回答 */}
                                        {message.role === 'assistant' ? (
                                            <ReactMarkdown>{fixMarkdownTable(message.content)}</ReactMarkdown>
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
                            <div className="flex items-end gap-2 max-w-[95%] md:max-w-[90%]">
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center pixel-border bg-pixel-primary">
                                    <img src="/logo.png" className="w-4 h-4" alt="AI Logo" />
                                </div>
                                <div className="pixel-bubble-ai rounded-sm p-2">
                                    <div className="pixel-loading">
                                        <div className="pixel-loading-dot"></div>
                                        <div className="pixel-loading-dot"></div>
                                        <div className="pixel-loading-dot"></div>
                                        <div className="pixel-loading-dot"></div>
                                        <div className="pixel-loading-dot"></div>
                                        <div className="pixel-loading-dot"></div>
                                    </div>
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