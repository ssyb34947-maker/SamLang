/**
 * 用户引导页面样式
 */

// 页面容器样式
export const pageContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  backgroundColor: 'var(--sketch-bg)',
};

// 主卡片样式
export const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '600px',
  backgroundColor: 'white',
  border: '4px solid var(--sketch-border)',
  borderRadius: 'var(--wobbly)',
  boxShadow: 'var(--shadow-hard-lg)',
  padding: '2rem',
  position: 'relative',
};

// 胶带装饰样式
export const tapeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%) rotate(-2deg)',
  padding: '8px 32px',
  backgroundColor: 'rgba(255, 193, 7, 0.8)',
  border: '2px solid var(--sketch-border)',
  borderRadius: '4px',
  fontFamily: 'var(--font-hand-heading)',
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#5d4037',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

// 标题样式
export const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-hand-heading)',
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--sketch-text)',
  textAlign: 'center',
  marginBottom: '0.5rem',
};

// 副标题样式
export const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-hand-body)',
  fontSize: '1rem',
  color: 'var(--sketch-pencil)',
  textAlign: 'center',
  marginBottom: '2rem',
};

// 表单区域样式
export const formContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

// 字段标签样式
export const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: 'var(--font-hand-heading)',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: 'var(--sketch-text)',
  marginBottom: '10px',
};

// 输入框基础样式
export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  fontFamily: 'var(--font-hand)',
  fontSize: '1rem',
  border: '3px solid var(--sketch-border)',
  borderRadius: 'var(--wobbly-sm)',
  backgroundColor: '#fffde7',
  outline: 'none',
};

// 选项卡片基础样式
export const optionCardBaseStyle: React.CSSProperties = {
  padding: '12px 16px',
  border: '3px solid var(--sketch-border)',
  borderRadius: 'var(--wobbly-sm)',
  cursor: 'pointer',
  fontFamily: 'var(--font-hand)',
  fontSize: '0.95rem',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

// 选项卡片选中样式
export const optionCardSelectedStyle = (isSelected: boolean, color: string): React.CSSProperties => ({
  backgroundColor: isSelected ? `${color}20` : '#f5f5f5',
  borderColor: isSelected ? color : 'var(--sketch-border)',
  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
});

// 按钮基础样式
export const buttonBaseStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontFamily: 'var(--font-hand-heading)',
  fontSize: '1rem',
  fontWeight: 600,
  border: '3px solid var(--sketch-border)',
  borderRadius: 'var(--wobbly-sm)',
  boxShadow: 'var(--shadow-soft)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
};

// 主要按钮样式
export const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#a5d6a7',
  color: '#2e7d32',
};

// 次要按钮样式
export const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#ffcdd2',
  color: '#c62828',
};

// 跳过按钮样式
export const skipButtonStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: 'var(--sketch-pencil)',
  border: '2px dashed var(--sketch-pencil)',
};

// 按钮组样式
export const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginTop: '2rem',
};

// 错误提示样式
export const errorStyle: React.CSSProperties = {
  padding: '12px 16px',
  backgroundColor: '#fee2e2',
  border: '2px solid #ef4444',
  borderRadius: 'var(--wobbly-sm)',
  color: '#dc2626',
  fontFamily: 'var(--font-hand)',
  fontSize: '0.95rem',
};

// 完成页面图标样式
export const completeIconStyle: React.CSSProperties = {
  width: '100px',
  height: '100px',
  margin: '0 auto 1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#e8f5e9',
  border: '4px solid #4caf50',
  borderRadius: '50%',
  fontSize: '3rem',
};
