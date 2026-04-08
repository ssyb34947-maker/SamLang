import { useState, useCallback, useEffect } from 'react';
import { API_DOCS_CONFIG } from '../constants';

export const useSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(API_DOCS_CONFIG.sidebar.defaultExpanded);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setIsExpanded(prev => !prev);
    }
  }, [isMobile]);

  const expandCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const isCategoryExpanded = useCallback((categoryId: string) => {
    return expandedCategories.includes(categoryId);
  }, [expandedCategories]);

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return {
    isExpanded,
    isMobile,
    mobileOpen,
    expandedCategories,
    toggleSidebar,
    expandCategory,
    isCategoryExpanded,
    closeMobileSidebar,
  };
};
