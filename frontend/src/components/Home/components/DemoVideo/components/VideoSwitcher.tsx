import React from 'react';
import { motion } from 'framer-motion';
import { DEMO_VIDEOS } from '../constants';
import { sketchStyles, typography } from '../styles';

interface VideoSwitcherProps {
  currentVideoIndex: number;
  onSwitch: (index: number) => void;
}

export const VideoSwitcher: React.FC<VideoSwitcherProps> = ({
  currentVideoIndex,
  onSwitch,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {DEMO_VIDEOS.map((video, index) => {
        const isActive = index === currentVideoIndex;

        return (
          <motion.button
            key={video.id}
            onClick={() => onSwitch(index)}
            className="relative text-left transition-all duration-200"
            style={{
              ...sketchStyles.featureCard,
              ...(isActive ? sketchStyles.featureCardActive : {}),
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: '4px 4px 0 var(--sketch-border)',
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* 激活指示器 - 手绘风格 */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full"
                style={{
                  backgroundColor: 'var(--sketch-accent)',
                }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            <div className="flex items-center gap-3">
              {/* 视频序号 - 手绘风格圆圈 */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: isActive
                    ? 'var(--sketch-accent)'
                    : 'var(--sketch-paper)',
                  color: isActive ? 'white' : 'var(--sketch-text)',
                  border: '2px solid var(--sketch-border)',
                  fontFamily: 'var(--font-hand-heading)',
                }}
              >
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className="font-bold text-sm truncate"
                  style={{
                    ...typography.featureTitle,
                    color: isActive
                      ? 'var(--sketch-accent)'
                      : 'var(--sketch-text)',
                  }}
                >
                  {video.title}
                </h4>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={typography.featureDesc}
                >
                  {video.subtitle}
                </p>
              </div>

              {/* 播放状态图标 - 手绘风格 */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--sketch-paper)',
                    border: '2px solid var(--sketch-accent)',
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: 'var(--sketch-accent)' }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
