import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { componentStyles } from '../styles';
import { codeBlockVariants } from '../animations';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

const languageColors: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  bash: '#89e051',
  json: '#292929',
  http: '#00d8ff',
};

export const CodeBlock = ({
  code,
  language = 'javascript',
  filename,
  showLineNumbers = true,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <motion.div
      variants={codeBlockVariants}
      initial="hidden"
      animate="visible"
      style={{
        margin: '16px 0',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--api-border-light)',
      }}
    >
      <div style={componentStyles.codeHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: languageColors[language] || '#ccc',
            }}
          />
          <span style={{ fontSize: 13, color: 'var(--api-text-secondary)' }}>
            {filename || language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            background: 'transparent',
            border: '1px solid var(--api-border-color)',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
            color: copied ? 'var(--api-success)' : 'var(--api-text-secondary)',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      
      <div
        style={{
          backgroundColor: 'var(--api-code-bg)',
          padding: 16,
          overflow: 'auto',
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--api-code-text)',
          }}
        >
          {showLineNumbers ? (
            <code>
              {lines.map((line, i) => (
                <div key={i} style={{ display: 'flex' }}>
                  <span
                    style={{
                      minWidth: 30,
                      paddingRight: 16,
                      color: 'var(--api-text-tertiary)',
                      textAlign: 'right',
                      userSelect: 'none',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{line || ' '}</span>
                </div>
              ))}
            </code>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </motion.div>
  );
};
