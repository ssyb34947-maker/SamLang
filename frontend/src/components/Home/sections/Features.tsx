import React from 'react';
import { motion } from 'framer-motion';
import { FeatureSection } from '../components/FeatureSection';
import { SketchDivider } from '../components/SketchDivider';
import { USER_FEATURES, SYSTEM_FEATURES, FEATURES_PAGE_TITLE, FEATURES_PAGE_SUBTITLE } from '../constants/features';
import { fadeInUp, staggerContainer, viewportConfig } from '../constants';

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
          >
            {FEATURES_PAGE_TITLE}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
          >
            {FEATURES_PAGE_SUBTITLE}
          </motion.p>
        </motion.div>

        {/* 左右布局：用户功能 + 系统算法 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-4">
          {/* 左侧：用户功能 */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <FeatureSection
                title={USER_FEATURES.title}
                subtitle={USER_FEATURES.subtitle}
                features={USER_FEATURES.features}
              />
            </div>
          </div>

          {/* 中间：手绘分界线 */}
          <SketchDivider className="min-h-[400px]" />

          {/* 右侧：系统算法 */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <FeatureSection
                title={SYSTEM_FEATURES.title}
                subtitle={SYSTEM_FEATURES.subtitle}
                features={SYSTEM_FEATURES.features}
                delay={0.2}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
