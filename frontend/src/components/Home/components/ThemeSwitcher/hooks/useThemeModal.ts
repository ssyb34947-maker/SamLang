import { useState, useCallback } from 'react';
import { ThemeType } from '../constants';

export const useThemeModal = (initialTheme: ThemeType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(initialTheme);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectTheme = useCallback((theme: ThemeType) => {
    setSelectedTheme(theme);
  }, []);

  const resetSelection = useCallback((currentTheme: ThemeType) => {
    setSelectedTheme(currentTheme);
  }, []);

  return {
    isOpen,
    selectedTheme,
    openModal,
    closeModal,
    selectTheme,
    resetSelection,
  };
};
