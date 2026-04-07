import React from 'react';
import { motion } from 'framer-motion';
import { Play, Check } from 'lucide-react';
import { featureCardVariants } from '../animations';
import { sketchStyles, typography } from '../styles';
import { DEMO_VIDEO_CONTENT } from '../constants';

interface FeatureListProps {
  currentTime: number;
  activeFeatureId: string | null;
  onFeatureClick: (time: number, id: string) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const FeatureList: React.FC<FeatureListProps> = ({
  currentTime,
  activeFeatureId,
  onFeatureClick,
}) => {
  const features = DEMO_VIDEO_CONTENT.FEATURES;

  return (
    <div className="space-y-3">
      <h3
        className="text-xl font-bold mb-4"
        style={typography.featureTitle}
      >
        功能章节
      </h3>
      {features.map((feature, index) => {
        const isActive = activeFeatureId === feature.id;
        const isPast = currentTime >= feature.time && !isActive;

        return (
          <motion.div
            key={feature.id}
            variants={featureCardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFeatureClick(feature.time, feature.id)}
            className="flex items-center gap-3"
            style={{
              ...sketchStyles.featureCard,
              ...(isActive ? sketchStyles.featureCardActive : {}),
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: isActive
                  ? 'var(--sketch-accent)'
                  : isPast
                  ? 'var(--sketch-secondary)'
                  : 'var(--sketch-paper)',
                border: '2px solid var(--sketch-border)',
              }}
            >
              {isPast ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-4 h-4" style={{ color: isActive ? 'white' : 'var(--sketch-text)' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="font-bold text-base truncate"
                style={typography.featureTitle}
              >
                {feature.title}
              </h4>
              <p
                className="text-sm truncate"
                style={typography.featureDesc}
              >
                {feature.description}
              </p>
            </div>
            <span
              className="text-sm flex-shrink-0"
              style={typography.featureDesc}
            >
              {formatTime(feature.time)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};
