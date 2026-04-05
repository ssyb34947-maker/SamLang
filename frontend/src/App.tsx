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
    "AI: 收到你的消息啦！这是一个手绘草稿本风格的回复～",
    "AI: 我在思考中... 这是一个模拟的 AI 回复！",
    "AI: 你好呀！我是手绘风格的 AI 助手，目前还在测试阶段哦！",
    "AI: 你的消息我已经收到了，现在只能回复固定内容呢～",
    "AI: 手绘风格的世界真有趣！期待接入真实 API 的那一天！",
    "AI: 收到～ 现在我只是个模拟的 AI，但界面很酷不是吗？",
    "AI: 草稿本风格万岁！让我继续为你服务吧！",
    "AI: 这是一个随机回复，展示多消息轮换效果！",
]

function App() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    // State management
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [useRealAPI, setUseRealAPI] = useState(true)
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
            setUseRealAPI(false)
            throw error
        }
    }

    // 使用apiService发送流式消息
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
            const response = await callRealAPI(userMessage)
            return response.message
        }
    }

    // Simulate AI response (fallback)
    const simulateAIResponse = async (userMessage: string): Promise<string> => {
        const delay = Math.floor(Math.random() * 1000) + 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        const randomIndex = Math.floor(Math.random() * SIMULATED_RESPONSES.length)
        return SIMULATED_RESPONSES[randomIndex]
    }

    // Handle sending message
    const handleSendMessage = async () => {
        const trimmedValue = inputValue.trim()
        if (!trimmedValue || isThinking) return

        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content: trimmedValue,
            timestamp: Date.now(),
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsThinking(true)

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }

        const aiMessageId = generateId()
        const aiMessage: Message = {
            id: aiMessageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        }

        try {
            if (useRealAPI) {
                try {
                    const thinkingSteps: ThinkingStep[] = []
                    let aiMessageAdded = false

                    const updateAiMessage = () => {
                        if (!aiMessageAdded) {
                            setIsThinking(false)
                            setMessages(prev => [...prev, { ...aiMessage, thinkingSteps: [] }])
                            aiMessageAdded = true
                        }
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, thinkingSteps: [...thinkingSteps] }
                                : msg
                        ))
                    }

                    const handleThinkingStep = (step: ThinkingStep) => {
                        thinkingSteps.push(step)
                        updateAiMessage()
                    }

                    const handleFinalResponse = (content: string) => {
                        if (!aiMessageAdded) {
                            setIsThinking(false)
                            setMessages(prev => [...prev, { ...aiMessage, content: '', thinkingSteps: [] }])
                            aiMessageAdded = true
                        }

                        let currentIndex = 0
                        const totalLength = content.length
                        const typingSpeed = 30

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

                    await callRealAPIWithStreaming(trimmedValue, handleThinkingStep, handleFinalResponse)
                } catch (error) {
                    console.log('Falling back to non-streaming API')
                    setIsThinking(false)
                    callRealAPI(trimmedValue).then(response => {
                        const content = response.message || ''
                        const thinkingSteps = response.thinking_steps || []
                        setMessages(prev => [...prev, { ...aiMessage, content, thinkingSteps }])
                    })
                }
            } else {
                const aiResponseContent = await simulateAIResponse(trimmedValue)
                setIsThinking(false)
                setMessages(prev => [...prev, { ...aiMessage, content: aiResponseContent }])
            }
        } catch (error) {
            console.error('Error generating AI response:', error)
            setIsThinking(false)
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
        if (!content.includes('|')) {
            return content
        }

        if (!content.includes('\n|')) {
            const parts = content.split('|').map(part => part.trim()).filter(part => part !== '')

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

            const headerCells = parts.slice(0, separatorIndex)
            const cellsPerRow = headerCells.length

            if (cellsPerRow === 0) {
                return content
            }

            const separator = parts[separatorIndex]
            const separatorLine = '| ' + Array(cellsPerRow).fill(separator).join(' | ') + ' |'

            const rowCells = parts.slice(separatorIndex + 1)
            const rowLines: string[] = []

            for (let i = 0; i < rowCells.length; i += cellsPerRow) {
                const row = rowCells.slice(i, i + cellsPerRow)
                if (row.length === cellsPerRow) {
                    rowLines.push('| ' + row.join(' | ') + ' |')
                }
            }

            const headerLine = '| ' + headerCells.join(' | ') + ' |'
            const fixedTable = [
                headerLine,
                separatorLine,
                ...rowLines
            ].join('\n')

            const tableStart = content.indexOf('|')
            const tableEnd = content.lastIndexOf('|') + 1

            if (tableStart !== -1 && tableEnd !== -1) {
                return content.substring(0, tableStart) + fixedTable + content.substring(tableEnd)
            }
        }

        return content
    }

    return (
        <div 
            className="h-screen flex flex-col"
            style={{ backgroundColor: 'var(--sketch-bg)' }}
        >
            {/* Header - 手绘风格 */}
            <header 
                className="flex-shrink-0"
                style={{ 
                    backgroundColor: 'white',
                    borderBottom: '3px solid var(--sketch-border)',
                    boxShadow: 'var(--shadow-hard)',
                    padding: '16px 20px'
                }}
            >
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 flex items-center justify-center"
                            style={{
                                backgroundColor: 'var(--sketch-paper)',
                                border: '3px solid var(--sketch-border)',
                                borderRadius: 'var(--wobbly-sm)',
                                boxShadow: 'var(--shadow-hard)',
                                transform: 'rotate(-3deg)'
                            }}
                        >
                            <Sparkles className="w-5 h-5" style={{ color: 'var(--sketch-accent)' }} />
                        </div>
                        <h1 
                            className="text-xl md:text-2xl"
                            style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 700, color: 'var(--sketch-text)' }}
                        >
                            SAM PROFESSOR AGENT
                        </h1>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-text)' }}>
                                    欢迎，{user.username}
                                </p>
                                <p style={{ fontFamily: 'var(--font-hand-body)', fontSize: '12px', color: 'var(--sketch-pencil)' }}>
                                    {user.email}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/profile')}
                                className="sketch-btn"
                                style={{ padding: '8px' }}
                                title="SamCollege Studio"
                            >
                                <UserIcon className="w-4 h-4" />
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
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {/* Guest User Studio Access */}
                    {!user && (
                        <button
                            onClick={() => navigate('/profile')}
                            className="sketch-btn"
                            style={{ padding: '8px 16px' }}
                            title="SamLang Studio"
                        >
                            <UserIcon className="w-4 h-4 mr-2" />
                            <span style={{ fontFamily: 'var(--font-hand-body)' }}>Studio</span>
                        </button>
                    )}
                </div>
                <p 
                    className="text-xs mt-2 text-center"
                    style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                >
                    AI LEARNING
                </p>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ backgroundColor: 'var(--sketch-bg)' }}>
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* Welcome Message */}
                    {messages.length === 0 && (
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
                                    <img src="/logo.png" className="w-12 h-12" alt="AI Logo" />
                                </div>
                                <h2 
                                    className="text-lg md:text-xl mb-4"
                                    style={{ fontFamily: 'var(--font-hand-heading)', fontWeight: 700, color: 'var(--sketch-text)' }}
                                >
                                    欢迎来到山姆学院！
                                </h2>
                                <p 
                                    className="text-sm mb-6 max-w-md"
                                    style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                                >
                                    这是一个学习智能体系统
                                    <br />
                                    输入你想学习的内容吧～
                                </p>
                                <div className="sketch-divider w-32 mx-auto" />
                                <p 
                                    className="text-xs mt-4"
                                    style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-accent)' }}
                                >
                                    ▶ 按 Enter 发送消息
                                </p>
                                <div className="mt-4">
                                    <span 
                                        className="text-xs"
                                        style={{ 
                                            fontFamily: 'var(--font-hand-body)', 
                                            color: useRealAPI ? '#4caf50' : 'var(--sketch-accent)' 
                                        }}
                                    >
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
                                <div 
                                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
                                    style={{
                                        backgroundColor: message.role === 'user' ? 'var(--sketch-accent)' : 'var(--sketch-secondary)',
                                        border: '3px solid var(--sketch-border)',
                                        borderRadius: 'var(--wobbly-sm)',
                                        boxShadow: 'var(--shadow-hard)'
                                    }}
                                >
                                    {message.role === 'user' ? (
                                        <User className="w-5 h-5 text-white" />
                                    ) : (
                                        <img src="/logo.png" className="w-5 h-5" alt="AI Logo" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className="flex flex-col">
                                    <div 
                                        className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                                        style={{ fontFamily: 'var(--font-chat)' }}
                                    >
                                        {/* 思考过程 */}
                                        {message.role === 'assistant' && message.thinkingSteps && message.thinkingSteps.length > 0 && (
                                            <div className="mb-3">
                                                <button
                                                    className="thinking-toggle"
                                                    onClick={() => {
                                                        const element = document.getElementById(`thinking-${message.id}`);
                                                        if (element) {
                                                            element.classList.toggle('hidden');
                                                        }
                                                    }}
                                                >
                                                    <span>💡 思考过程</span>
                                                    <span>▼</span>
                                                </button>
                                                <div id={`thinking-${message.id}`} className="thinking-content hidden">
                                                    {message.thinkingSteps.map((step, index) => (
                                                        <div key={index} className="thinking-step">
                                                            <div className="thinking-step-title">思考 {index + 1}:</div>
                                                            <div style={{ fontFamily: 'var(--font-chat)' }}>{step.thought}</div>
                                                            {step.tool_call && (
                                                                <div className="tool-call-box">
                                                                    <div className="tool-call-title">工具调用:</div>
                                                                    <div className="mt-1" style={{ fontFamily: 'var(--font-chat)', fontSize: '13px' }}>
                                                                        <div style={{ color: 'var(--sketch-secondary)' }}>工具名称: <span>{step.tool_call.tool_name}</span></div>
                                                                        <div className="mt-1">参数: <span>{JSON.stringify(step.tool_call.arguments)}</span></div>
                                                                        <div className="mt-1">结果: <span>{step.tool_call.result}</span></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 最终回答 - AI对话使用黑体 */}
                                        {message.role === 'assistant' ? (
                                            <ReactMarkdown className="markdown-body">{fixMarkdownTable(message.content)}</ReactMarkdown>
                                        ) : (
                                            <p style={{ fontFamily: 'var(--font-chat)' }}>{message.content}</p>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <span 
                                        className="text-xs mt-2 px-2"
                                        style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                                    >
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
                                <div 
                                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
                                    style={{
                                        backgroundColor: 'var(--sketch-secondary)',
                                        border: '3px solid var(--sketch-border)',
                                        borderRadius: 'var(--wobbly-sm)',
                                        boxShadow: 'var(--shadow-hard)'
                                    }}
                                >
                                    <img src="/logo.png" className="w-5 h-5" alt="AI Logo" />
                                </div>
                                <div 
                                    className="p-3"
                                    style={{
                                        backgroundColor: 'white',
                                        border: '3px solid var(--sketch-border)',
                                        borderRadius: 'var(--wobbly-md)',
                                        boxShadow: 'var(--shadow-hard)'
                                    }}
                                >
                                    <div className="sketch-loading">
                                        <div className="sketch-loading-dot"></div>
                                        <div className="sketch-loading-dot"></div>
                                        <div className="sketch-loading-dot"></div>
                                        <div className="sketch-loading-dot"></div>
                                        <div className="sketch-loading-dot"></div>
                                        <div className="sketch-loading-dot"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area - 手绘风格 */}
            <footer 
                className="flex-shrink-0 p-4 md:p-6"
                style={{ 
                    backgroundColor: 'white',
                    borderTop: '3px solid var(--sketch-border)',
                    boxShadow: '0 -4px 0px 0px var(--sketch-border)'
                }}
            >
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3 items-end">
                        {/* Textarea - 使用chat-input类，黑体 */}
                        <div className="flex-1">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={isThinking ? "SAM 正在思考中..." : "输入消息... (Enter 发送，Shift+Enter 换行)"}
                                disabled={isThinking}
                                className="chat-input w-full resize-none"
                                style={{ minHeight: '60px' }}
                                rows={2}
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isThinking}
                            className="sketch-btn"
                            style={{ 
                                padding: '12px 20px',
                                backgroundColor: !inputValue.trim() || isThinking ? 'var(--sketch-muted)' : 'var(--sketch-secondary)',
                                color: 'white'
                            }}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            <span className="hidden md:inline" style={{ fontFamily: 'var(--font-hand-heading)' }}>发送</span>
                        </button>
                    </div>

                    {/* Helper Text */}
                    <p 
                        className="text-xs mt-3 text-center"
                        style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                    >
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
