/**
 * 冷启动动画样式
 */

// 容器样式
export const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  minHeight: '300px',
};

// 齿轮容器样式
export const gearContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '120px',
  height: '120px',
  marginBottom: '2rem',
};

// 单个齿轮样式
export const gearStyle = (size: number, rotation: number): React.CSSProperties => ({
  position: 'absolute',
  width: `${size}px`,
  height: `${size}px`,
  border: '3px solid var(--sketch-border)',
  borderRadius: '50%',
  backgroundColor: '#fff9c4',
  transform: `rotate(${rotation}deg)`,
  transition: 'transform 0.1s linear',
});

// 齿轮齿样式
export const gearToothStyle = (angle: number): React.CSSProperties => ({
  position: 'absolute',
  width: '8px',
  height: '12px',
  backgroundColor: 'var(--sketch-border)',
  top: '-6px',
  left: '50%',
  transform: `translateX(-50%) rotate(${angle}deg)`,
  transformOrigin: '50% 200%',
});

// 进度条容器样式
export const progressContainerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '300px',
  height: '20px',
  backgroundColor: '#f5f5f5',
  border: '3px solid var(--sketch-border)',
  borderRadius: 'var(--wobbly-sm)',
  overflow: 'hidden',
  position: 'relative',
  marginBottom: '1rem',
};

// 进度条填充样式
export const progressFillStyle = (progress: number): React.CSSProperties => ({
  width: `${progress}%`,
  height: '100%',
  backgroundColor: '#a5d6a7',
  transition: 'width 0.1s linear',
  borderRadius: '2px',
});

// 进度条纹装饰
export const progressStripeStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)',
  animation: 'stripeMove 1s linear infinite',
};

// 状态文本样式
export const statusTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-hand-heading)',
  fontSize: '1.2rem',
  color: 'var(--sketch-text)',
  textAlign: 'center',
  marginBottom: '0.5rem',
  minHeight: '1.5rem',
};

// 百分比文本样式
export const percentageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-hand-heading)',
  fontSize: '2rem',
  fontWeight: 700,
  color: '#4caf50',
  textAlign: 'center',
};

// 粒子容器样式
export const particleContainerStyle: React.CSSProperties = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  pointerEvents: 'none',
};

// 粒子样式
export const particleStyle = (angle: number, distance: number): React.CSSProperties => ({
  position: 'absolute',
  width: '8px',
  height: '8px',
  backgroundColor: '#ffd54f',
  border: '2px solid var(--sketch-border)',
  borderRadius: '50%',
  top: '50%',
  left: '50%',
  transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${distance}px)`,
});

// 完成图标样式
export const completeIconStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#e8f5e9',
  border: '4px solid #4caf50',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2.5rem',
  marginBottom: '1rem',
  animation: 'popIn 0.5s ease-out',
};
