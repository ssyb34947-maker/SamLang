import React from 'react';
import { motion } from 'framer-motion';
import { FeatureCard } from './FeatureCard';
import { FeatureItem, iconMap } from '../constants/features';
import { staggerContainer, viewportConfig } from '../constants';

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  features: FeatureItem[];
  delay?: number;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  subtitle,
  features,
  delay = 0,
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={staggerContainer}
      className="space-y-8"
    >
      {/* 分类标题 */}
      <motion.div variants={staggerContainer} className="text-center md:text-left">
        <motion.h3
          variants={staggerContainer}
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
        >
          {title}
        </motion.h3>
        <motion.p
          variants={staggerContainer}
          className="text-base md:text-lg"
          style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
        >
          {subtitle}
        </motion.p>
      </motion.div>

      {/* 功能卡片网格 */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => {
          const Icon = iconMap[feature.icon];
          return (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={Icon}
              index={index}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
};
