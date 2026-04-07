import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { VideoPlayer, FeatureList } from './components';
import { containerVariants, titleVariants } from './animations';
import { typography } from './styles';
import { DEMO_VIDEO_CONTENT } from './constants';
import { viewportConfig } from '../../constants';

export const DemoSection: React.FC = () => {
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    
    // Auto-detect active feature based on current time
    const features = DEMO_VIDEO_CONTENT.FEATURES;
    for (let i = features.length - 1; i >= 0; i--) {
      if (time >= features[i].time) {
        setActiveFeatureId(features[i].id);
        break;
      }
    }
  }, []);

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

  return (
    <section
      id={DEMO_VIDEO_CONTENT.SECTION_ID}
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
              {DEMO_VIDEO_CONTENT.TITLE}
            </h2>
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              style={typography.subtitle}
            >
              {DEMO_VIDEO_CONTENT.SUBTITLE}
            </p>
          </motion.div>

          {/* Video and Features Layout */}
          <motion.div
            variants={titleVariants}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Video Player */}
            <div className="lg:col-span-2">
              <VideoPlayer
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />
            </div>

            {/* Feature List */}
            <div className="lg:col-span-1">
              <FeatureList
                currentTime={currentTime}
                activeFeatureId={activeFeatureId}
                onFeatureClick={handleFeatureClick}
              />
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
              快捷键：空格键 播放/暂停 | ← → 快进/快退 | ↑ ↓ 音量 | M 静音 | F 全屏
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
