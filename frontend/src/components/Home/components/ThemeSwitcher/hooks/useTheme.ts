import { useState, useCallback, useEffect } from 'react';
import { ThemeType } from '../constants';

const STORAGE_KEY = 'sam-theme-preference';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeType;
      return saved || 'default';
    }
    return 'default';
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const changeTheme = useCallback((theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    // TODO: Implement actual theme switching logic
    console.log('Theme changed to:', theme);
  }, []);

  return {
    currentTheme,
    changeTheme,
    isReady,
  };
};
