import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * 代码块组件
 * 支持复制功能和简单的语法高亮
 */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 简单的语法高亮 - 关键字
  const highlightCode = (code: string, lang: string) => {
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
      /(".*?"|'.*?'|`[\s\S]*?`)/g,
      '<span class="text-green-400">$1</span>'
    );

    // 高亮数字
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="text-orange-400">$1</span>'
    );

    // 高亮关键字
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="text-purple-400">$1</span>');
    });

    // 高亮类型
    types.forEach(type => {
      const regex = new RegExp(`\\b(${type})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="text-cyan-400">$1</span>');
    });

    // 高亮注释
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
      '<span class="text-gray-500">$1</span>'
    );

    return highlighted;
  };

  const highlightedCode = highlightCode(code, language);

  return (
    <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-800 border border-gray-600">
      <div className="flex items-center justify-between bg-gray-700 px-4 py-2">
        <span className="text-gray-300 text-xs font-medium uppercase">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-colors px-2 py-1 rounded hover:bg-gray-600"
          title="复制代码"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400">已复制</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code
            className="font-mono text-gray-200"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};

/**
 * Markdown渲染组件
 * 支持GFM语法、代码高亮、表格等
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 段落
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-gray-100">{children}</p>
          ),

          // 标题
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-cyan-400 border-b border-gray-600 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3 text-cyan-300 border-b border-gray-700 pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2 text-cyan-200">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mb-2 text-cyan-100">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold mb-1 text-gray-300">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-semibold mb-1 text-gray-400">{children}</h6>
          ),

          // 代码块和行内代码
          code: ({ className, children }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (!className) {
              // 行内代码
              return (
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono text-sm">
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

          // 表格
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-gray-600">
              <table className="min-w-full border-collapse bg-gray-800">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-700">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-600">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-600 hover:bg-gray-700/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-gray-600 px-4 py-3 text-cyan-300 font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-600 px-4 py-3 text-gray-200">
              {children}
            </td>
          ),

          // 链接
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // 列表
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-100">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-100">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),

          // 引用块
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-cyan-500 pl-4 italic mb-4 bg-gray-800/50 p-3 rounded-r text-gray-300">
              {children}
            </blockquote>
          ),

          // 水平线
          hr: () => (
            <hr className="my-6 border-gray-600" />
          ),

          // 强调
          strong: ({ children }) => (
            <strong className="font-bold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-200">{children}</em>
          ),

          // 删除线
          del: ({ children }) => (
            <del className="line-through text-gray-400">{children}</del>
          ),

          // 图片
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg my-4 border border-gray-600"
              loading="lazy"
            />
          ),

          // 任务列表
          input: ({ checked }: any) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
            />
          ),

          // 预格式化文本（用于代码块外层）
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
