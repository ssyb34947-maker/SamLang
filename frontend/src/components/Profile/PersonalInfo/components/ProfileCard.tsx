import React, { useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { STYLES } from '../constants';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { PinAnimation } from './PinAnimation';
import type { UserInfo } from '../types';

interface ProfileCardProps {
  children: React.ReactNode;
  isEditing: boolean;
  error: string | null;
  onEdit: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  children,
  isEditing,
  error,
  onEdit,
}) => {
  const { state, startAnimation } = useScrollAnimation();

  // 组件挂载时启动动画
  useEffect(() => {
    const timer = setTimeout(() => {
      startAnimation();
    }, 100);
    return () => clearTimeout(timer);
  }, [startAnimation]);

  // 书卷样式 - 根据动画状态动态变化
  const scrollStyle: React.CSSProperties = {
    backgroundColor: 'white',
    border: '3px solid var(--sketch-border)',
    borderRadius: 'var(--wobbly-md)',
    boxShadow: 'var(--shadow-hard)',
    transform: `rotate(${state.scrollRotation}deg) scale(${state.scrollScale})`,
    padding: '2rem',
    position: 'relative',
    marginTop: '20px',
    transformOrigin: 'center center',
    overflow: 'hidden',
    // 书卷卷起效果 - 使用 clip-path 模拟
    clipPath: state.scrollProgress < 1
      ? `inset(0 ${(1 - state.scrollProgress) * 50}% 0 0)`
      : undefined,
  };

  // 内容区域样式
  const contentStyle: React.CSSProperties = {
    opacity: state.contentOpacity,
    transform: `translateY(${state.contentY}px)`,
    transition: 'none',
  };

  return (
    <div className="max-w-3xl mx-auto" style={{ position: 'relative', perspective: '1000px' }}>
      {/* 书卷容器 */}
      <div style={scrollStyle}>
        {/* 图钉动画 */}
        <PinAnimation
          progress={state.pinProgress}
          bounce={state.pinBounce}
          color="red"
        />

        {/* 胶带装饰 */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)',
            ...STYLES.TAPE,
            opacity: state.scrollProgress,
          }}
        >
          个人档案
        </div>

        {/* 内容区域 */}
        <div style={contentStyle}>
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-8" style={{ marginTop: '1rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-hand-heading)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--sketch-text)',
                transform: 'rotate(-1deg)',
              }}
            >
              ✏️ 我的资料
            </h2>
            {!isEditing && (
              <button
                onClick={onEdit}
                style={{
                  ...STYLES.BUTTON.base,
                  ...STYLES.BUTTON.edit,
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.95rem',
                  transform: 'rotate(1deg)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(1deg) scale(1.05)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-hard)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(1deg)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                }}
              >
                <Pencil className="w-4 h-4" />
                修改信息
              </button>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '12px 16px',
                backgroundColor: '#fee2e2',
                border: '2px solid #ef4444',
                borderRadius: 'var(--wobbly-sm)',
                color: '#dc2626',
                fontFamily: 'var(--font-hand)',
                transform: 'rotate(0.5deg)',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* 子内容 */}
          {children}
        </div>
      </div>

      {/* 装饰元素 */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '30px',
          fontSize: '3rem',
          opacity: 0.15 * state.contentOpacity,
          transform: `rotate(15deg) translateY(${30 - state.contentY}px)`,
          pointerEvents: 'none',
          transition: 'none',
        }}
      >
        📝
      </div>
    </div>
  );
};

export default ProfileCard;
