import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownStyles } from '../styles';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * 代码块组件 - 参考 Chat 页面实现
 */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 简单的语法高亮
  const highlightCode = (code: string) => {
    const keywords = [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'import', 'export', 'from', 'class', 'extends', 'new', 'this', 'async', 'await',
      'try', 'catch', 'throw', 'switch', 'case', 'break', 'continue', 'default',
      'true', 'false', 'null', 'undefined', 'typeof', 'in', 'of', 'as', 'interface',
      'type', 'enum', 'namespace', 'module', 'declare', 'abstract', 'readonly',
      'public', 'private', 'protected', 'static', 'get', 'set', 'constructor'
    ];

    const types = [
      'string', 'number', 'boolean', 'any', 'void', 'never', 'unknown',
      'Array', 'Promise', 'Object', 'Map', 'Set', 'Record', 'Partial',
      'Required', 'Pick', 'Omit', 'Exclude', 'Extract', 'ReturnType'
    ];

    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 高亮字符串
    highlighted = highlighted.replace(
      /(".*?'|`[\s\S]*?`)/g,
      '<span style="color: #228b22">$1</span>'
    );

    // 高亮数字
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span style="color: #ff8c00">$1</span>'
    );

    // 高亮关键字
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span style="color: #8b008b">$1</span>');
    });

    // 高亮类型
    types.forEach(type => {
      const regex = new RegExp(`\\b(${type})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span style="color: #0066cc">$1</span>');
    });

    // 高亮注释
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
      '<span style="color: #666">$1</span>'
    );

    return highlighted;
  };

  const highlightedCode = highlightCode(code);

  return (
    <div className="md-code-block" style={markdownStyles.codeBlock}>
      <div className="md-code-header" style={{
        ...markdownStyles.codeBlockHeader,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: copied ? '#228b22' : '#666',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s',
          }}
          title="复制代码"
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
      </div>
      <div className="md-code-pre" style={markdownStyles.codeBlockPre}>
        <pre style={{ margin: 0, padding: 0, background: 'transparent' }}>
          <code
            className="md-code-content"
            style={markdownStyles.codeBlockCode}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};

/**
 * Markdown渲染组件
 * 参考 Chat 页面的样式实现
 * 使用双层容器控制边距：外层控制卡片边距，内层控制内容边距
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body" style={{ width: '100%', padding: '5%' }}>
      {/* 内层容器 - 控制内容边距，无其他样式 */}
      <div style={markdownStyles.container}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // 标题 - 使用 className 确保样式优先级，添加 data-heading 用于目录定位
            h1: ({ children }) => {
              const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return <h1 id={id} data-heading={id} className="md-h1" style={markdownStyles.h1}>{children}</h1>;
            },
            h2: ({ children }) => {
              const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return <h2 id={id} data-heading={id} className="md-h2" style={markdownStyles.h2}>{children}</h2>;
            },
            h3: ({ children }) => {
              const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return <h3 id={id} data-heading={id} className="md-h3" style={markdownStyles.h3}>{children}</h3>;
            },
            h4: ({ children }) => {
              const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return <h4 id={id} data-heading={id} className="md-h4" style={markdownStyles.h4}>{children}</h4>;
            },
            h5: ({ children }) => {
              const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return <h5 id={id} data-heading={id} className="md-h5" style={markdownStyles.h5}>{children}</h5>;
            },
            h6: ({ children }) => {
              const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return <h6 id={id} data-heading={id} className="md-h6" style={markdownStyles.h6}>{children}</h6>;
            },

            // 段落
            p: ({ children }) => <p style={markdownStyles.p}>{children}</p>,

            // 链接
            a: ({ children, href }) => (
              <a
                href={href}
                style={markdownStyles.a}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, markdownStyles.aHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, markdownStyles.a)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),

            // 列表
            ul: ({ children, className }) => {
              const isTaskList = className?.includes('contains-task-list');
              return (
                <ul style={isTaskList ? markdownStyles.taskList : markdownStyles.ul}>
                  {children}
                </ul>
              );
            },
            ol: ({ children }) => <ol style={markdownStyles.ol}>{children}</ol>,
            li: ({ children, className }) => {
              const isTaskItem = className?.includes('task-list-item');
              if (isTaskItem) {
                return <li style={markdownStyles.taskListItem}>{children}</li>;
              }
              return <li style={markdownStyles.li}>{children}</li>;
            },

            // 强调
            strong: ({ children }) => <strong style={markdownStyles.strong}>{children}</strong>,
            em: ({ children }) => <em style={markdownStyles.em}>{children}</em>,
            del: ({ children }) => <del style={markdownStyles.del}>{children}</del>,

            // 代码 - 参考 Chat 页面实现
            code: ({ className, children }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (!className) {
                // 行内代码
                return (
                  <code style={markdownStyles.inlineCode}>
                    {children}
                  </code>
                );
              }

              // 代码块
              return (
                <CodeBlock
                  language={language}
                  code={String(children).replace(/\n$/, '')}
                />
              );
            },

            // 预格式化文本（用于代码块外层）
            pre: ({ children }) => <>{children}</>,

            // 引用
            blockquote: ({ children }) => (
              <blockquote style={markdownStyles.blockquote}>
                {children}
              </blockquote>
            ),

            // 表格 - Chat 风格简洁实现
            table: ({ children }) => (
              <div className="md-table-wrapper" style={markdownStyles.tableWrapper}>
                <table className="md-table" style={markdownStyles.table}>{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="md-thead" style={markdownStyles.thead}>{children}</thead>,
            tbody: ({ children }) => <tbody className="md-tbody">{children}</tbody>,
            tr: ({ children }) => (
              <tr
                className="md-tr"
                style={markdownStyles.tr}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
                }}
              >
                {children}
              </tr>
            ),
            th: ({ children }) => <th className="md-th" style={markdownStyles.th}>{children}</th>,
            td: ({ children }) => <td className="md-td" style={markdownStyles.td}>{children}</td>,

            // 分隔线
            hr: () => <hr style={markdownStyles.hr} />,

            // 图片
            img: ({ src, alt }) => (
              <figure style={{ margin: '1.5rem 0' }}>
                <img src={src} alt={alt} style={markdownStyles.img} />
                {alt && <figcaption style={markdownStyles.figcaption}>{alt}</figcaption>}
              </figure>
            ),

            // 其他元素
            sup: ({ children }) => <sup style={markdownStyles.sup}>{children}</sup>,
            sub: ({ children }) => <sub style={markdownStyles.sub}>{children}</sub>,
            mark: ({ children }) => <mark style={markdownStyles.mark}>{children}</mark>,

            // 任务列表复选框
            input: ({ checked }: any) => (
              <input
                type="checkbox"
                checked={checked}
                readOnly
                style={markdownStyles.checkbox}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
