import React, { useState, useEffect, useRef } from 'react';

/**
 * 助教Agent CLI组件
 * CLI风格的聊天界面，包含启动动画
 */
export const AgentCLI: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const hasBootedRef = useRef(false);

  // 自动滚动到底部
  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalLines, bootProgress]);

  // CLI启动动画效果
  useEffect(() => {
    // 防止重复执行（React 18 StrictMode）
    if (hasBootedRef.current) return;
    hasBootedRef.current = true;

    // SAM COLLEGE ASCII Logo - 一次性打印
    const logoContent = [
      '',
      '   ███████╗ █████╗ ███╗   ███╗      ██████╗  ██████╗ ██╗     ██╗     ███████╗██████╗  ███████╗',
      '   ██╔════╝██╔══██╗████╗ ████║     ██╔════╝ ██╔═══██╗██║     ██║     ██╔════╝██╔════╝ ██╔════╝',
      '   ███████╗███████║██╔████╔██║     ██║      ██║   ██║██║     ██║     █████╗  ██║  ███╗█████╗  ',
      '   ╚════██║██╔══██║██║╚██╔╝██║     ██║      ██║   ██║██║     ██║     ██╔══╝  ██║   ██║██╔══╝  ',
      '   ███████║██║  ██║██║ ╚═╝ ██║     ╚██████╗ ╚██████╔╝███████╗███████╗███████╗╚██████╔╝███████╗',
      '   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝      ╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚══════╝',

      '                    Intelligent Learning Assistant v2.0.1',
      '',
    ];

    // 启动日志 - 随机延迟，模拟真实执行时间    
    const bootLogs = [
      { content: '➜ ~ Initializing SamLang Kernel...', progress: 10, minDelay: 300, maxDelay: 600 },
      { content: '➜ ~ Loading neural network modules...', progress: 20, minDelay: 400, maxDelay: 800 },
      { content: '➜ ~ Mounting knowledge base volumes...', progress: 30, minDelay: 200, maxDelay: 500 },
      { content: '➜ ~ Connecting to vector database...', progress: 40, minDelay: 600, maxDelay: 1000 },
      { content: '➜ ~ Optimizing transformer weights...', progress: 50, minDelay: 800, maxDelay: 1500 },
      { content: '➜ ~ Calibrating attention mechanisms...', progress: 60, minDelay: 400, maxDelay: 700 },
      { content: '➜ ~ Loading language models...', progress: 70, minDelay: 1000, maxDelay: 2000 },
      { content: '➜ ~ Initializing conversation context...', progress: 80, minDelay: 300, maxDelay: 600 },
      { content: '➜ ~ Starting agent services...', progress: 90, minDelay: 500, maxDelay: 900 },
      { content: '➜ ~ Performing self-diagnostics...', progress: 95, minDelay: 700, maxDelay: 1200 },
      { content: '➜ ~ System ready.', progress: 100, minDelay: 200, maxDelay: 400 },
    ];

    const systemMessages = [
      { content: '', type: 'empty' },
      { content: '[INFO] SamLang Agent v2.0.1 initialized', type: 'info' },
      { content: '[INFO] Connected to neural network', type: 'info' },
      { content: '[INFO] Knowledge base: 1,024 documents indexed', type: 'info' },
      { content: '[OK] Ready for conversation', type: 'success' },
      { content: '', type: 'empty' },
      { content: '[SYSTEM] 你好！我是SAM COLLEGE助教Agent，有什么可以帮助你的吗？', type: 'system' },
    ];

    let currentDelay = 500; // 初始等待时间，模拟系统启动

    // 第一步：打印Logo（一次性）
    setTimeout(() => {
      logoContent.forEach((line) => {
        setTerminalLines(prev => [...prev, JSON.stringify({ content: line, type: line === '' ? 'empty' : 'logo' })]);
      });
    }, currentDelay);

    currentDelay += 800; // Logo显示后等待一段时间再开始启动日志    

    // 第二步：按顺序打印启动日志，使用随机延迟
    bootLogs.forEach((log) => {
      const randomDelay = Math.floor(Math.random() * (log.maxDelay - log.minDelay + 1)) + log.minDelay;
      currentDelay += randomDelay;

      setTimeout(() => {
        setTerminalLines(prev => [...prev, JSON.stringify({ content: log.content, type: 'log' })]);
        setBootProgress(log.progress);

        if (log.progress === 100) {
          // 启动完成后打印系统 消息
          setTimeout(() => {
            systemMessages.forEach((msg, index) => {
              setTimeout(() => {
                setTerminalLines(prev => [...prev, JSON.stringify(msg)]);
              }, index * 100);
            });

            // 最后标记启动完成
            setTimeout(() => {
              setIsBooting(false);
            }, systemMessages.length * 100 + 200);
          }, 300);
        }
      }, currentDelay);
    });
  }, []);

  // 处理输入提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // 添加用户输入到终端
    const userLine = `➜ ~ ${inputValue}`;
    setTerminalLines(prev => [...prev, JSON.stringify({ content: userLine, type: 'input' })]);

    // 模拟Agent回复
    setTimeout(() => {
      const responses = [
        '[AGENT] 收到你的问题，让我来帮你分析...',
        '[AGENT] 这是一个很好的问题！',
        '[AGENT] 根据我的知识库，我可以这样回答你...',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setTerminalLines(prev => [...prev, JSON.stringify({ content: randomResponse, type: 'agent' })]);
    }, 500);

    setInputValue('');
  };

  // 渲染终端行
  const renderLine = (line: string, index: number) => {
    const parsed = JSON.parse(line);
    const { content, type } = parsed;

    switch (type) {
      case 'logo':
        return <div key={index} className="text-cyan-400 whitespace-pre">{content}</div>;
      case 'subtitle':
        return <div key={index} className="text-purple-400 text-center">{content}</div>;
      case 'info':
        return <div key={index} className="text-gray-400">{content}</div>;
      case 'success':
        return <div key={index} className="text-green-400">{content}</div>;
      case 'system':
        return <div key={index} className="text-blue-400">{content}</div>;
      case 'agent':
        return <div key={index} className="text-purple-400">{content}</div>;
      case 'input':
        return <div key={index} className="text-white">{content}</div>;
      case 'empty':
        return <div key={index}>&nbsp;</div>;
      case 'log':
      default:
        return <div key={index} className="text-gray-300">{content}</div>;
    }
  };

  return (
    <div className="pixel-border p-4 h-[70vh] flex flex-col">
      {/* CLI标题栏 */}
      <div className="bg-gray-800 border-b-2 border-cyan-400 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-400">⬤</span>
          <span className="text-yellow-400">⬤</span>
          <span className="text-red-400">⬤</span>
          <span className="ml-3 text-cyan-400 font-mono text-sm">sam@studio: ~/sam-college</span>
        </div>
        <span className="text-gray-400 font-mono text-xs">bash — 80x24</span>
      </div>

      {/* CLI终端窗口 */}
      <div className="flex-1 bg-black font-mono text-sm p-4 overflow-y-auto">
        {/* 终端内容 */}
        <div className="min-h-full">
          {terminalLines.map((line, index) => renderLine(line, index))}

          {/* CLI风格进度条 - 使用ASCII字符 */}
          {isBooting && (
            <div className="mt-4 font-mono">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>[{bootProgress === 100 ? 'OK' : 'PROGRESS'}] Initializing system...</span>
                <span>{bootProgress}%</span>
              </div>
              <div className="text-cyan-400">
                {'['}
                {Array.from({ length: 20 }).map((_, i) => {
                  const filled = Math.floor((bootProgress / 100) * 20);
                  if (i < filled) return <span key={i} className="text-cyan-400">=</span>;
                  if (i === filled) return <span key={i} className="text-purple-400 animate-pulse">&gt;</span>;
                  return <span key={i} className="text-gray-600">-</span>;
                })}
                <span className="text-cyan-400">]</span>
              </div>
            </div>
          )}

          {/* CLI风格闪烁光标 */}
          {isBooting && (
            <div className="mt-2">
              <span className="text-green-400">➜</span>
              <span className="text-cyan-400 ml-1">~</span>
              <span className="text-gray-500 ml-1">_</span>
              <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
            </div>
          )}

          {/* 输入提示符（启动完成后） */}
          {!isBooting && (
            <form onSubmit={handleSubmit} className="flex items-center mt-2">
              <span className="text-green-400 mr-2">➜</span>
              <span className="text-cyan-400 mr-2">~</span>
              <span className="text-yellow-400 mr-2">git:(</span>
              <span className="text-red-400">main</span>
              <span className="text-yellow-400 mr-2">)</span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-transparent border-none outline-none text-white font-mono flex-1"
                placeholder="输入命令..."
                autoFocus
              />
            </form>
          )}

          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* CLI状态栏 */}
      <div className="bg-gray-800 border-t-2 border-cyan-400 px-4 py-1 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className={isBooting ? 'text-yellow-400 animate-pulse' : 'text-green-400'}>
            {isBooting ? 'BOOTING' : 'NORMAL'}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-cyan-400">sam-college.py</span>
          <span className="text-gray-400">|</span>
          <span className="text-yellow-400">utf-8</span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <span>ln: {terminalLines.length + 1}</span>
          <span>col: 1</span>
        </div>
      </div>
    </div>
  );
};
