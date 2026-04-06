import React from 'react';
import { User, FileText } from 'lucide-react';
import { STYLES, PLACEHOLDERS } from '../constants';
import type { UserInfo } from '../types';

interface InfoDisplayProps {
  userInfo: UserInfo | null;
}

export const InfoDisplay: React.FC<InfoDisplayProps> = ({ userInfo }) => {
  const cardBaseStyle = {
    padding: '16px 20px',
    border: '3px solid var(--sketch-border)',
    borderRadius: 'var(--wobbly-sm)',
    boxShadow: 'var(--shadow-soft)',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-hand-heading)',
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 用户名展示 */}
      <div
        style={{
          ...cardBaseStyle,
          ...STYLES.DISPLAY_CARD.yellow,
          transform: 'rotate(-1deg)',
        }}
      >
        <label style={labelStyle}>
          <User className="w-4 h-4" />
          昵称
        </label>
        <p
          style={{
            fontFamily: 'var(--font-hand-heading)',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--sketch-text)',
          }}
        >
          {userInfo?.username || PLACEHOLDERS.NO_USERNAME}
        </p>
      </div>

      {/* 邮箱展示 - 只读 */}
      <div
        style={{
          ...cardBaseStyle,
          ...STYLES.DISPLAY_CARD.green,
          transform: 'rotate(0.5deg)',
        }}
      >
        <label style={labelStyle}>✉️ 邮箱</label>
        <p
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: '1.1rem',
            color: '#555',
          }}
        >
          {userInfo?.email || PLACEHOLDERS.NO_EMAIL}
        </p>
        <p
          style={{
            fontSize: '0.75rem',
            color: '#999',
            marginTop: '4px',
            fontFamily: 'var(--font-hand)',
          }}
        >
          * 邮箱不可修改
        </p>
      </div>

      {/* 个人简介展示 */}
      <div
        style={{
          ...cardBaseStyle,
          ...STYLES.DISPLAY_CARD.purple,
          transform: 'rotate(-0.5deg)',
        }}
      >
        <label style={labelStyle}>
          <FileText className="w-4 h-4" />
          个人简介
        </label>
        <p
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: '1.05rem',
            color: 'var(--sketch-text)',
            lineHeight: '1.7',
            whiteSpace: 'pre-wrap',
          }}
        >
          {userInfo?.bio || PLACEHOLDERS.NO_BIO}
        </p>
      </div>
    </div>
  );
};

export default InfoDisplay;
