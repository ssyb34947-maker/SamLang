// ============================================
// Constants Export - Supports Language Switching
// ============================================

// Language configuration - Change this to switch languages
// Options: 'zh' | 'en'
export const CURRENT_LANGUAGE: 'zh' | 'en' = 'zh';

// Export all content based on current language
export * from './content.zh';

// Export animations (language independent)
export * from './animations';

// Language switching helper
export const getLanguageLabel = () => {
  return CURRENT_LANGUAGE === 'zh' ? '中文' : 'English';
};

export const getAvailableLanguages = () => [
  { code: 'zh' as const, label: '中文' },
  { code: 'en' as const, label: 'English' },
];
