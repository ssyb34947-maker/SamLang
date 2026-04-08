// ============================================
// Demo视频组件样式配置
// ============================================

export const sketchStyles = {
  container: {
    backgroundColor: 'var(--sketch-bg)',
    borderRadius: 'var(--wobbly-lg)',
    border: '3px solid var(--sketch-border)',
    boxShadow: 'var(--shadow-hard)',
  },
  videoContainer: {
    backgroundColor: 'black',
    borderRadius: 'var(--wobbly-md)',
    border: '3px solid var(--sketch-border)',
  },
  controls: {
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
    borderRadius: '0 0 var(--wobbly-md) var(--wobbly-md)',
  },
  progressBar: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    height: '6px',
    borderRadius: '3px',
  },
  progressFill: {
    backgroundColor: 'var(--sketch-accent)',
    height: '100%',
    borderRadius: '3px',
  },
  button: {
    color: 'white',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: 'var(--wobbly-sm)',
    transition: 'all 0.2s ease',
  },
  featureCard: {
    backgroundColor: 'white',
    border: '2px solid var(--sketch-border)',
    borderRadius: 'var(--wobbly-md)',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  featureCardActive: {
    backgroundColor: 'var(--sketch-paper)',
    borderColor: 'var(--sketch-accent)',
    boxShadow: 'var(--shadow-hard)',
  },
} as const;

export const typography = {
  title: {
    fontFamily: 'var(--font-hand-heading)',
    color: 'var(--sketch-text)',
  },
  subtitle: {
    fontFamily: 'var(--font-hand-body)',
    color: 'var(--sketch-pencil)',
  },
  featureTitle: {
    fontFamily: 'var(--font-hand-heading)',
    color: 'var(--sketch-text)',
  },
  featureDesc: {
    fontFamily: 'var(--font-hand-body)',
    color: 'var(--sketch-pencil)',
  },
  timeDisplay: {
    fontFamily: 'var(--font-chat)',
    color: 'white',
    fontSize: '14px',
  },
} as const;
