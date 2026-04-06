import React from 'react';
import { STYLES } from '../constants';

interface PinAnimationProps {
  progress: number; // 0-1，下落进度
  bounce: number; // 弹跳偏移
  color?: 'red' | 'green' | 'blue';
}

export const PinAnimation: React.FC<PinAnimationProps> = ({
  progress,
  bounce,
  color = 'red',
}) => {
  // 根据颜色选择渐变
  const getGradient = () => {
    switch (color) {
      case 'green':
        return 'radial-gradient(circle at 35% 35%, #4ecdc4, #2a9d8f)';
      case 'blue':
        return 'radial-gradient(circle at 35% 35%, #5c9ded, #2a5d9f)';
      case 'red':
      default:
        return STYLES.PIN.background;
    }
  };

  // 计算图钉位置 - 从上方落下
  const startY = -80; // 起始位置（上方）
  const endY = -14; // 结束位置（书卷上）
  const currentY = startY + (endY - startY) * progress;

  // 弹跳效果 - 当图钉接触书卷时产生晃动
  const bounceRotation = bounce * Math.sin(Date.now() * 0.02) * 0.5;
  const baseRotation = -46;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${currentY}px`,
        left: '50%',
        transform: `translateX(-80%) rotate(${baseRotation + bounceRotation}deg)`,
        zIndex: 10,
        transformOrigin: 'bottom center',
        transition: 'none', // 使用 JS 动画，不使用 CSS transition
      }}
    >
      {/* 图钉头部 */}
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: getGradient(),
          boxShadow: STYLES.PIN.boxShadow,
          position: 'relative',
        }}
      >
        {/* 图钉高光 */}
        <div
          style={{
            position: 'absolute',
            top: '5px',
            left: '6px',
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
          }}
        />
      </div>

      {/* 图钉针 */}
      <div
        style={{
          width: '3px',
          height: '14px',
          background: 'linear-gradient(to bottom, #adb5bd, #495057)',
          margin: '-3px auto 0',
          boxShadow: '2px 0 3px rgba(0,0,0,0.4)',
          borderRadius: '0 0 1px 1px',
        }}
      />

      {/* 阴影 - 随下落变化 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '6px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.2)',
          filter: 'blur(2px)',
          opacity: progress > 0.8 ? 0.3 + (1 - progress) * 0.4 : 0,
          transition: 'none',
        }}
      />
    </div>
  );
};

export default PinAnimation;
