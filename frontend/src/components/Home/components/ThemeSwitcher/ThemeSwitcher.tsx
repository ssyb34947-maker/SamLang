import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ThemeCard } from './components';
import { useThemeModal } from './hooks';
import { THEME_OPTIONS, THEME_SWITCHER_CONTENT } from './constants';
import {
  backdropVariants,
  modalVariants,
  containerVariants,
  titleVariants,
  buttonHoverVariants,
  buttonTapVariants,
} from './animations';
import { modalStyles, typography, buttonStyles } from './styles';
import { useLanguage } from '../../contexts/LanguageContext';
import { useThemeContext } from '../../contexts/ThemeContext';

interface ThemeSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme: currentTheme, setTheme } = useThemeContext();
  const {
    selectedTheme,
    selectTheme,
    resetSelection,
  } = useThemeModal(currentTheme);
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      resetSelection(currentTheme);
    }
  }, [isOpen, currentTheme, resetSelection]);

  const handleApply = () => {
    setTheme(selectedTheme);
    onClose();
  };

  const handleClose = () => {
    resetSelection(currentTheme);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={modalStyles.overlay}>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={modalStyles.backdrop}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={modalStyles.modal}
          >
            {/* Close Button */}
            <motion.button
              whileHover={buttonHoverVariants}
              whileTap={buttonTapVariants}
              onClick={handleClose}
              style={buttonStyles.close}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Header */}
            <motion.div
              variants={titleVariants}
              initial="hidden"
              animate="visible"
              style={modalStyles.header}
            >
              <h2 style={typography.title}>
                {isEn ? THEME_SWITCHER_CONTENT.TITLE_EN : THEME_SWITCHER_CONTENT.TITLE}
              </h2>
              <p style={typography.subtitle}>
                {isEn ? THEME_SWITCHER_CONTENT.SUBTITLE_EN : THEME_SWITCHER_CONTENT.SUBTITLE}
              </p>
            </motion.div>

            {/* Theme Cards Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{
                ...modalStyles.content,
                ...{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '16px',
                },
              }}
            >
              {THEME_OPTIONS.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedTheme === theme.id}
                  onClick={() => selectTheme(theme.id)}
                />
              ))}
            </motion.div>

            {/* Footer */}
            <div style={modalStyles.footer}>
              <motion.button
                whileHover={buttonHoverVariants}
                whileTap={buttonTapVariants}
                onClick={handleClose}
                style={{
                  ...buttonStyles.secondary,
                  ...typography.button,
                }}
              >
                {isEn ? THEME_SWITCHER_CONTENT.CLOSE_EN : THEME_SWITCHER_CONTENT.CLOSE}
              </motion.button>
              <motion.button
                whileHover={buttonHoverVariants}
                whileTap={buttonTapVariants}
                onClick={handleApply}
                style={{
                  ...buttonStyles.primary,
                  ...typography.button,
                }}
              >
                {isEn ? THEME_SWITCHER_CONTENT.APPLY_EN : THEME_SWITCHER_CONTENT.APPLY}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
