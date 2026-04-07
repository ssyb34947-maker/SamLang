// ============================================
// Demo视频组件常量配置
// ============================================

export const DEMO_VIDEO_CONTENT = {
  SECTION_ID: 'demo',
  TITLE: '产品演示',
  SUBTITLE: '观看山姆学院的核心功能演示，了解如何在山姆学院学习',
  VIDEO: {
    POSTER: '/demo/demo-poster.png',
    SOURCES: [
      { src: '/demo/demo.mp4', type: 'video/mp4' },
    ],
    TITLE: 'Sam College 产品演示',
  },
  FEATURES: [
    {
      id: 'ai-teaching',
      title: 'AI 智能教学',
      description: '教授级AI实时解答问题',
      time: 0,
    },
    {
      id: 'knowledge-base',
      title: '知识库管理',
      description: '自动整理学习资料',
      time: 30,
    },
    {
      id: 'progress-tracking',
      title: '学习追踪',
      description: '可视化学习进度',
      time: 60,
    },
  ],
} as const;

export const VIDEO_PLAYER_CONFIG = {
  CONTROLS_TIMEOUT: 3000,
  VOLUME_STEP: 0.1,
  SEEK_STEP: 10,
  PLAYBACK_RATES: [0.5, 0.75, 1, 1.25, 1.5, 2],
  DEFAULT_PLAYBACK_RATE: 1,
  AUTO_PLAY_DELAY: 600, // 导航跳转后自动播放延迟（毫秒）
} as const;

export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ' ',
  MUTE: 'm',
  FULLSCREEN: 'f',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
} as const;
