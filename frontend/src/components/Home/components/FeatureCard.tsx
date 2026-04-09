import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { fadeInUp } from '../constants';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  index?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  index = 0,
}) => {
  return (
    <motion.div
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
          {title}
        </h3>
        <p
          className="text-base"
          style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
};
