import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoPlayer, FeatureList, VideoSwitcher } from './components';
import { containerVariants, titleVariants } from './animations';
import { typography } from './styles';
import { DEMO_VIDEOS } from './constants';
import { viewportConfig } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';

export const DemoSection: React.FC = () => {
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { language } = useLanguage();

  // 当前视频数据
  const currentVideo = useMemo(() => DEMO_VIDEOS[currentVideoIndex], [currentVideoIndex]);

  // Get localized content based on language
  const getLocalizedContent = () => {
    if (language === 'en') {
      return {
        TITLE: 'Product Demo',
        SUBTITLE: 'Watch the core features demo of Sam College and learn how to study efficiently',
        FEATURES_TITLE: 'Feature Chapters',
        VIDEO_SWITCH_TITLE: 'Select Demo',
        SHORTCUTS: 'Shortcuts: Space Play/Pause | ← → Seek | ↑ ↓ Volume | M Mute | F Fullscreen',
      };
    }
    return {
      TITLE: '产品演示',
      SUBTITLE: '观看山姆学院的核心功能演示，了解如何在山姆学院学习',
      FEATURES_TITLE: '功能章节',
      VIDEO_SWITCH_TITLE: '切换演示',
      SHORTCUTS: '快捷键：空格键 播放/暂停 | ← → 快进/快退 | ↑ ↓ 音量 | M 静音 | F 全屏',
    };
  };

  const localized = getLocalizedContent();

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    
    // Auto-detect active feature based on current time
    const features = currentVideo.features;
    for (let i = features.length - 1; i >= 0; i--) {
      if (time >= features[i].time) {
        setActiveFeatureId(features[i].id);
        break;
      }
    }
  }, [currentVideo]);

  const handleFeatureClick = useCallback((time: number, id: string) => {
    setActiveFeatureId(id);
    // The video player will seek to this time
    // This is handled by the VideoPlayer component's internal state
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.currentTime = time;
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setActiveFeatureId(null);
  }, []);

  const handleVideoSwitch = useCallback((index: number) => {
    if (index !== currentVideoIndex) {
      setCurrentVideoIndex(index);
      setCurrentTime(0);
      setActiveFeatureId(null);
    }
  }, [currentVideoIndex]);

  // 检测是否是从导航栏点击跳转过来的（URL 包含 #demo）
  const shouldAutoPlay = useMemo(() => {
    return window.location.hash === '#demo';
  }, []);

  return (
    <section
      id="demo"
      className="py-20 md:py-32"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={titleVariants} className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={typography.title}
            >
              {localized.TITLE}
            </h2>
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              style={typography.subtitle}
            >
              {localized.SUBTITLE}
            </p>
          </motion.div>

          {/* Video and Features Layout */}
          <motion.div
            variants={titleVariants}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Video Player */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentVideo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <VideoPlayer
                    poster={currentVideo.poster}
                    sources={currentVideo.sources}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    autoPlay={shouldAutoPlay}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Side Panel: Video Switcher + Feature List */}
            <div className="lg:col-span-1 space-y-6">
              {/* Video Switcher */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {localized.VIDEO_SWITCH_TITLE}
                </h3>
                <VideoSwitcher
                  currentVideoIndex={currentVideoIndex}
                  onSwitch={handleVideoSwitch}
                />
              </div>

              {/* Feature List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {localized.FEATURES_TITLE}
                </h3>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentVideo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FeatureList
                      currentTime={currentTime}
                      activeFeatureId={activeFeatureId}
                      onFeatureClick={handleFeatureClick}
                      featuresTitle={localized.FEATURES_TITLE}
                      features={currentVideo.features}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Keyboard Shortcuts Hint */}
          <motion.div
            variants={titleVariants}
            className="mt-8 text-center"
          >
            <p
              className="text-sm"
              style={typography.subtitle}
            >
              {localized.SHORTCUTS}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
