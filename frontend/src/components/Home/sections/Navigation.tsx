import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, Languages, LogIn, Palette } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { EXTERNAL_LINKS, fadeIn } from '../constants';
import { useScrollAnimation, useContent } from '../hooks';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const isScrolled = useScrollAnimation(50);
  const navigate = useNavigate();
  const { toggleLanguage, language } = useLanguage();
  const { BRAND, NAVIGATION } = useContent();

  const handleNavClick = (href: string, isExternal?: boolean) => {
    setIsMobileMenuOpen(false);
    if (isExternal) {
      window.open(href, '_blank');
    } else if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  const openThemeModal = () => {
    setIsThemeModalOpen(true);
  };

  const closeThemeModal = () => {
    setIsThemeModalOpen(false);
  };

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: isScrolled ? 'rgba(253, 251, 247, 0.95)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          borderBottom: isScrolled ? '3px solid var(--sketch-border)' : 'none',
          boxShadow: isScrolled ? 'var(--shadow-hard)' : 'none',
        }}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16 md:h-20">
            <Link
              to="/"
              className="flex items-center gap-2 transition-transform hover:scale-105"
              style={{ fontFamily: 'var(--font-hand-heading)' }}
            >
              <span className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--sketch-text)' }}>
                {BRAND.NAME}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAVIGATION.LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href, link.isExternal)}
                  className="text-lg transition-all hover:rotate-1"
                  style={{
                    fontFamily: 'var(--font-hand-body)',
                    color: 'var(--sketch-text)',
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <a
                href={EXTERNAL_LINKS.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 transition-transform hover:scale-110 hover:rotate-6"
                style={{ color: 'var(--sketch-text)' }}
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <button
                onClick={toggleLanguage}
                className="p-2 transition-transform hover:scale-110 hover:rotate-6 flex items-center gap-1"
                style={{ color: 'var(--sketch-text)', fontFamily: 'var(--font-hand-body)' }}
                title="切换语言"
              >
                <Languages className="w-5 h-5" />
                <span className="text-sm">{language === 'zh' ? '中文' : 'EN'}</span>
              </button>
              <button
                onClick={openThemeModal}
                className="p-2 transition-transform hover:scale-110 hover:rotate-6 flex items-center gap-1"
                style={{ color: 'var(--sketch-text)', fontFamily: 'var(--font-hand-body)' }}
                title="切换主题"
              >
                <Palette className="w-5 h-5" />
                <span className="text-sm">{language === 'zh' ? '主题' : 'Theme'}</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="sketch-btn flex items-center gap-2"
                style={{ padding: '8px 20px', fontSize: '15px' }}
              >
                <LogIn className="w-4 h-4" />
                {NAVIGATION.BUTTONS.LOGIN}
              </button>
              <button
                onClick={() => navigate('/register')}
                className="sketch-btn sketch-btn-secondary"
                style={{ padding: '8px 20px', fontSize: '15px' }}
              >
                {NAVIGATION.BUTTONS.REGISTER}
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: 'var(--sketch-text)' }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: 'var(--sketch-text)' }} />
              )}
            </button>
          </nav>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
              style={{
                backgroundColor: 'var(--sketch-bg)',
                borderBottom: '3px solid var(--sketch-border)',
                boxShadow: 'var(--shadow-hard)',
              }}
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                <a
                  href={EXTERNAL_LINKS.GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2"
                  style={{
                    fontFamily: 'var(--font-hand-body)',
                    color: 'var(--sketch-text)',
                  }}
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </a>
                {NAVIGATION.LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href, link.isExternal)}
                    className="text-left text-lg py-2"
                    style={{
                      fontFamily: 'var(--font-hand-body)',
                      color: 'var(--sketch-text)',
                    }}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t-2 border-dashed" style={{ borderColor: 'var(--sketch-muted)' }}>
                  <button
                    onClick={toggleLanguage}
                    className="sketch-btn w-full justify-center flex items-center gap-2"
                  >
                    <Languages className="w-4 h-4" />
                    {language === 'zh' ? 'Switch to English' : '切换为中文'}
                  </button>
                  <button
                    onClick={openThemeModal}
                    className="sketch-btn w-full justify-center flex items-center gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    {language === 'zh' ? '切换主题' : 'Switch Theme'}
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="sketch-btn w-full justify-center flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {NAVIGATION.BUTTONS.LOGIN}
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="sketch-btn sketch-btn-secondary w-full justify-center"
                  >
                    {NAVIGATION.BUTTONS.REGISTER}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Theme Switcher Modal */}
      <ThemeSwitcher isOpen={isThemeModalOpen} onClose={closeThemeModal} />
    </>
  );
};
