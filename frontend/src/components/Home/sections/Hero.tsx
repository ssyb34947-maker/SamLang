import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Download } from 'lucide-react';
import { EXTERNAL_LINKS, heroTextVariants, staggerContainer } from '../constants';
import { useContent } from '../hooks';
import { LobsterProfessor } from '../../LobsterProfessor';
import { DemoChat } from '../components';

// Windows Logo SVG Component
const WindowsLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 88 88" fill="currentColor">
    <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.377zm47.329 39.349l-.012 41.34-47.318-6.678-.066-34.739z"/>
  </svg>
);

const BrushStroke: React.FC = () => {
  const { BRAND } = useContent();
  
  return (
    <div className="relative w-full max-w-2xl mx-auto mt-4">
      <svg
        viewBox="0 0 600 100"
        className="w-full h-20 md:h-24"
        style={{ overflow: 'visible' }}
      >
        <motion.path
          d="M10,50 Q150,35 300,50 T590,50"
          fill="none"
          stroke="var(--sketch-text)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M20,58 Q160,45 310,58 T580,58"
          fill="none"
          stroke="var(--sketch-text)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.path
          d="M30,42 Q170,28 320,42 T570,42"
          fill="none"
          stroke="var(--sketch-text)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
        />
      </svg>
      <motion.span
        className="absolute right-4 -bottom-2 text-base md:text-lg"
        style={{
          fontFamily: "'Kalam', cursive",
          color: 'var(--sketch-pencil)',
          fontStyle: 'italic',
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        {BRAND.TAGLINE}
      </motion.span>
    </div>
  );
};

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { BRAND, HERO } = useContent();

  const handleDownload = () => {
    window.open(EXTERNAL_LINKS.DOWNLOAD_WINDOWS, '_blank');
  };

  return (
    <section className="min-h-screen pt-20 md:pt-24 flex items-center">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          <div className="space-y-8">
            <motion.div variants={heroTextVariants} className="inline-flex items-center gap-2">
              <span
                className="px-4 py-2 text-sm md:text-base"
                style={{
                  fontFamily: 'var(--font-hand-body)',
                  backgroundColor: 'var(--sketch-paper)',
                  border: '2px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly-sm)',
                  transform: 'rotate(-1deg)',
                }}
              >
                <Sparkles className="w-4 h-4 inline mr-1" style={{ color: 'var(--sketch-accent)' }} />
                {HERO.BADGE}
              </span>
            </motion.div>

            <motion.h1
              variants={heroTextVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{
                fontFamily: 'var(--font-hand-heading)',
                color: 'var(--sketch-text)',
              }}
            >
              {BRAND.SLOGAN}
            </motion.h1>

            <BrushStroke />

            <motion.p
              variants={heroTextVariants}
              className="text-lg md:text-xl max-w-xl"
              style={{
                fontFamily: 'var(--font-hand-body)',
                color: 'var(--sketch-pencil)',
              }}
            >
              {BRAND.SUB_SLOGAN}
            </motion.p>

            <motion.div variants={heroTextVariants} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="sketch-btn sketch-btn-secondary text-lg"
                  style={{ padding: '14px 32px' }}
                >
                  {HERO.CTA.PRIMARY}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="sketch-btn text-lg flex items-center gap-2"
                  style={{ padding: '14px 24px' }}
                >
                  <Download className="w-5 h-5" />
                  <span>{HERO.CTA.DOWNLOAD}</span>
                  <span className="text-sm opacity-70">(</span>
                  <WindowsLogo className="w-4 h-4" style={{ color: 'currentColor', opacity: 0.9 }} />
                  <span className="text-sm">Windows x86</span>
                  <span className="text-sm opacity-70">)</span>
                </button>
              </div>
            </motion.div>

            <motion.div variants={heroTextVariants} className="flex flex-wrap gap-4 pt-4">
              {HERO.TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="text-sm flex items-center gap-1"
                  style={{
                    fontFamily: 'var(--font-hand-body)',
                    color: 'var(--sketch-pencil)',
                  }}
                >
                  <span style={{ color: 'var(--sketch-accent)' }}>✓</span>
                  {badge}
                </span>
              ))}
            </motion .div>
          < /div>
 
          <div className="relative">
            <DemoChat />

            <motion.div
              className="absolute -top-16 -right-8 z-10"
              initial={{ opacity: 0, scale: 0.5, rotate: 15 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: [8, 12, 8, 4, 8],
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.8 },
                scale: { duration: 0.8, delay: 0.8 },
                rotate: {
                  duration: 3,
                  delay: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
               }}
            >
              <LobsterProfessor
                width={200}
                height={170}
                autoPlay={true}
                animationSpeed={0.8}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
