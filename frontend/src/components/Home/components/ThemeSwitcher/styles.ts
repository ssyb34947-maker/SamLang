// ============================================
// 主题切换组件样式配置
// ============================================

export const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  backdrop: {
    position: 'absolute' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    backgroundColor: 'white',
    borderRadius: 'var(--wobbly-lg)',
    border: '3px solid var(--sketch-border)',
    boxShadow: 'var(--shadow-hard)',
    overflow: 'hidden',
  },
  header: {
    padding: '24px 24px 16px',
    borderBottom: '2px dashed var(--sketch-muted)',
  },
  content: {
    padding: '24px',
    overflowY: 'auto' as const,
    maxHeight: 'calc(90vh - 180px)',
  },
  footer: {
    padding: '16px 24px 24px',
    borderTop: '2px dashed var(--sketch-muted)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
} as const;

export const cardStyles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px',
  },
  card: {
    cursor: 'pointer',
    borderRadius: 'var(--wobbly-md)',
    border: '2px solid var(--sketch-border)',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },
  cardSelected: {
    borderColor: 'var(--sketch-accent)',
    boxShadow: '0 0 0 3px rgba(255, 107, 107, 0.3)',
  },
  preview: {
    height: '80px',
    width: '100%',
    borderBottom: '2px solid var(--sketch-border)',
  },
  info: {
    padding: '12px',
  },
  name: {
    fontFamily: 'var(--font-hand-heading)',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'var(--sketch-text)',
    marginBottom: '4px',
  },
  description: {
    fontFamily: 'var(--font-hand-body)',
    fontSize: '12px',
    color: 'var(--sketch-pencil)',
    lineHeight: 1.4,
  },
  checkmark: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--sketch-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
  },
} as const;

export const typography = {
  title: {
    fontFamily: 'var(--font-hand-heading)',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--sketch-text)',
    marginBottom: '8px',
  },
  subtitle: {
    fontFamily: 'var(--font-hand-body)',
    fontSize: '14px',
    color: 'var(--sketch-pencil)',
  },
  button: {
    fontFamily: 'var(--font-hand-body)',
    fontSize: '14px',
    fontWeight: 'bold',
  },
} as const;

export const buttonStyles = {
  primary: {
    padding: '10px 24px',
    backgroundColor: 'var(--sketch-secondary)',
    color: 'white',
    border: '2px solid var(--sketch-border)',
    borderRadius: 'var(--wobbly-sm)',
    cursor: 'pointer',
  },
  secondary: {
    padding: '10px 24px',
    backgroundColor: 'transparent',
    color: 'var(--sketch-text)',
    border: '2px solid var(--sketch-border)',
    borderRadius: 'var(--wobbly-sm)',
    cursor: 'pointer',
  },
  close: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--sketch-paper)',
    border: '2px solid var(--sketch-border)',
    borderRadius: 'var(--wobbly-sm)',
    cursor: 'pointer',
    color: 'var(--sketch-text)',
  },
} as const;
