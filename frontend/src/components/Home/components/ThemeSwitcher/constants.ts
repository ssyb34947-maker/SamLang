// ============================================
// 主题切换组件常量配置
// ============================================

export type ThemeType = 'default' | 'ins' | 'green' | 'dark' | 'red';

export interface ThemeOption {
  id: ThemeType;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  previewColor: string;
  previewGradient?: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'default',
    name: '原版',
    nameEn: 'Default',
    description: '米黄色底+手绘风格',
    descriptionEn: 'Beige background + hand-drawn style',
    previewColor: '#FDFBF7',
    previewGradient: 'linear-gradient(135deg, #FDFBF7 0%, #F5F0E8 100%)',
  },
  {
    id: 'ins',
    name: '米白网格',
    nameEn: 'Grid',
    description: '原版颜色+浅灰网格',
    descriptionEn: 'Default colors + light gray grid',
    previewColor: '#FDFBF7',
    previewGradient: 'repeating-linear-gradient(0deg, transparent, transparent 29px, rgba(180,170,150,0.3) 29px, rgba(180,170,150,0.3) 30px), repeating-linear-gradient(90deg, transparent, transparent 29px, rgba(180,170,150,0.3) 29px, rgba(180,170,150,0.3) 30px), #FDFBF7',
  },
  {
    id: 'green',
    name: '浅绿色',
    nameEn: 'Green',
    description: '浅绿底+深绿文字',
    descriptionEn: 'Light green bg + dark green text',
    previewColor: '#E8F5E9',
    previewGradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
  },
  {
    id: 'dark',
    name: '暗黑色',
    nameEn: 'Dark',
    description: '深蓝黑底+浅色文字',
    descriptionEn: 'Dark blue-black bg + light text',
    previewColor: '#1A1A2E',
    previewGradient: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
  },
  {
    id: 'red',
    name: '淡红色',
    nameEn: 'Rose',
    description: '淡红底+深红文字',
    descriptionEn: 'Light rose bg + dark red text',
    previewColor: '#FFEBEE',
    previewGradient: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
  },
] as const;

export const THEME_SWITCHER_CONTENT = {
  TITLE: '切换主题风格',
  TITLE_EN: 'Switch Theme',
  SUBTITLE: '选择你喜欢的界面风格',
  SUBTITLE_EN: 'Choose your preferred interface style',
  CLOSE: '关闭',
  CLOSE_EN: 'Close',
  APPLY: '应用',
  APPLY_EN: 'Apply',
} as const;

export const MODAL_CONFIG = {
  ANIMATION_DURATION: 0.3,
  BACKDROP_OPACITY: 0.5,
  CARD_SIZE: 120,
  GRID_GAP: 16,
} as const;
