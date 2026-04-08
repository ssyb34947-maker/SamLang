import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ThemeOption } from '../constants';
import { cardVariants, cardHoverVariants, cardSelectedVariants } from '../animations';
import { cardStyles } from '../styles';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ThemeCardProps {
  theme: ThemeOption;
  isSelected: boolean;
  onClick: () => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  isSelected,
  onClick,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <motion.div
      variants={cardVariants}
      whileHover={cardHoverVariants}
      animate={isSelected ? cardSelectedVariants : {}}
      onClick={onClick}
      style={{
        ...cardStyles.card,
        ...(isSelected ? cardStyles.cardSelected : {}),
        position: 'relative',
      }}
    >
      {/* Preview Area */}
      <div
        style={{
          ...cardStyles.preview,
          background: theme.previewGradient || theme.previewColor,
        }}
      />

      {/* Info Area */}
      <div style={cardStyles.info}>
        <h4 style={cardStyles.name}>
          {isEn ? theme.nameEn : theme.name}
        </h4>
        <p style={cardStyles.description}>
          {isEn ? theme.descriptionEn : theme.description}
        </p>
      </div>

      {/* Selected Checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={cardStyles.checkmark}
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}
    </motion.div>
  );
};
