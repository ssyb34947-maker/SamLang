import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  MessagesSquare,
  BookOpen,
  TrendingUp,
  Terminal,
  Database,
  RefreshCw,
  BarChart3,
  Command,
  FileText,
  User,
  Pencil,
  LucideIcon,
} from 'lucide-react';
import { fadeInUp, staggerContainer, viewportConfig } from '../constants';
import { useContent } from '../hooks';

const iconMap: Record<string, LucideIcon> = {
  MessageCircle,
  MessagesSquare,
  BookOpen,
  TrendingUp,
  Terminal,
  Database,
  RefreshCw,
  BarChart3,
  Command,
  FileText,
  User,
  Pencil,
};

export const Features: React.FC = () => {
  const { FEATURES_SECTION, FEATURES_LIST } = useContent();

  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
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
            {FEATURES_SECTION.TITLE}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
          >
            {FEATURES_SECTION.SUBTITLE}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {FEATURES_LIST.map((feature) => {
            const Icon = iconMap[feature.icon] || MessageCircle;
            return (
              <motion.div
                key={feature.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, rotate: -0.5 }}
                transition={{ duration: 0.2 }}
                className="sketch-card group cursor-pointer"
                style={{
                  backgroundColor: 'white',
                  transformOrigin: 'center',
                }}
              >
                <div className="space-y-4">
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform"
                    style={{
                      backgroundColor: 'var(--sketch-paper)',
                      border: '3px solid var(--sketch-border)',
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: 'var(--sketch-secondary)' }} />
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-base"
                    style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
