// 文件上传配置
export const UPLOAD_CONFIG = {
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_BIO_LENGTH: 500,
} as const;

// 样式常量
export const STYLES = {
  // 卡片样式
  CARD: {
    backgroundColor: 'white',
    border: '3px solid var(--sketch-border)',
    borderRadius: 'var(--wobbly-md)',
    boxShadow: 'var(--shadow-hard)',
    transform: 'rotate(-0.5deg)',
    padding: '2rem',
    position: 'relative' as const,
    marginTop: '20px',
  },
  // 图钉样式
  PIN: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #ff6b6b, #c92a2a)',
    boxShadow: '3px 3px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.3)',
  },
  // 胶带样式
  TAPE: {
    backgroundColor: 'rgba(255, 193, 7, 0.6)',
    padding: '8px 40px',
    fontFamily: 'var(--font-hand-heading)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#5d4037',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  // 头像样式
  AVATAR: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    border: '4px solid var(--sketch-border)',
    boxShadow: 'var(--shadow-hard)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transform: 'rotate(-2deg)',
  },
  // 按钮基础样式
  BUTTON: {
    base: {
      fontFamily: 'var(--font-hand)',
      border: '2px solid var(--sketch-border)',
      borderRadius: 'var(--wobbly-sm)',
      boxShadow: 'var(--shadow-soft)',
      cursor: 'pointer',
    },
    primary: {
      backgroundColor: '#a5d6a7',
      color: '#2e7d32',
    },
    secondary: {
      backgroundColor: '#ffcdd2',
      color: '#c62828',
    },
    edit: {
      backgroundColor: 'var(--sketch-paper)',
      color: 'var(--sketch-text)',
    },
  },
  // 输入框样式
  INPUT: {
    width: '100%',
    padding: '12px 16px',
    fontFamily: 'var(--font-hand)',
    fontSize: '1rem',
    border: '3px solid var(--sketch-border)',
    borderRadius: 'var(--wobbly-sm)',
    backgroundColor: '#fffde7',
    outline: 'none',
  },
  // 展示卡片样式
  DISPLAY_CARD: {
    yellow: { backgroundColor: '#fff9c4' },
    green: { backgroundColor: '#e8f5e9', opacity: 0.9 },
    purple: { backgroundColor: '#f3e5f5', minHeight: '120px' },
    blue: { backgroundColor: '#e3f2fd', border: '2px solid #90caf9', color: '#1565c0' },
  },
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: '请选择图片文件（JPG、PNG、GIF、WebP）',
  FILE_TOO_LARGE: '图片大小不能超过 5MB',
  UPLOAD_FAILED: '上传头像失败',
  FETCH_FAILED: '获取用户信息失败',
  SAVE_FAILED: '保存失败',
} as const;

// 占位文本
export const PLACEHOLDERS = {
  USERNAME: '给自己起个酷酷的昵称吧',
  BIO: '写点什么介绍自己吧...',
  NO_BIO: '✨ 还没有填写个人简介，点击"修改信息"来介绍一下自己吧！',
  NO_USERNAME: '未设置昵称',
  NO_EMAIL: '未设置邮箱',
} as const;
