import { useLanguage } from '../contexts/LanguageContext';
import * as zhContent from '../constants/content.zh';
import * as enContent from '../constants/content.en';

export const useContent = () => {
  const { language } = useLanguage();
  
  const content = language === 'zh' ? zhContent : enContent;
  
  return {
    ...content,
    language,
  };
};
