/**
 * 完成步骤组件
 */

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ColdStartScreen } from './ColdStart';
import {
  titleStyle,
  subtitleStyle,
  buttonBaseStyle,
  primaryButtonStyle,
  completeIconStyle,
} from '../styles';

interface CompleteStepProps {
  onComplete: () => void;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({ onComplete }) => {
  const [showColdStart, setShowColdStart] = useState(false);

  const handleStart = () => {
    setShowColdStart(true);
  };

  const handleColdStartComplete = () => {
    onComplete();
  };

  if (showColdStart) {
    return <ColdStartScreen onComplete={handleColdStartComplete} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1rem 0',
      }}
    >
      {/* 完成图标 */}
      <div style={completeIconStyle}>
        <Sparkles className="w-12 h-12 text-green-600" />
      </div>

      {/* 标题 */}
      <h2 style={titleStyle}>🎉 设置完成！</h2>

      {/* 副标题 */}
      <p style={subtitleStyle}>
        欢迎来到山姆学院，开始你的学习之旅吧！
      </p>

      {/* 装饰文字 */}
      <div
        style={{
          fontFamily: 'var(--font-hand)',
          fontSize: '1rem',
          color: 'var(--sketch-pencil)',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#fff9c4',
          border: '2px dashed var(--sketch-border)',
          borderRadius: 'var(--wobbly-sm)',
          transform: 'rotate(-1deg)',
        }}
      >
        ✨ 你的学习档案已创建完成
      </div>

      {/* 进入按钮 */}
      <button
        onClick={handleStart}
        style={{
          ...buttonBaseStyle,
          ...primaryButtonStyle,
          padding: '14px 32px',
          fontSize: '1.1rem',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = 'var(--shadow-hard)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
        }}
      >
        开始学习之旅 →
      </button>
    </div>
  );
};

export default CompleteStep;
