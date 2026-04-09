import React from 'react';
import { motion } from 'framer-motion';

interface SketchDividerProps {
  className?: string;
}

export const SketchDivider: React.FC<SketchDividerProps> = ({ className = '' }) => {
  return (
    <div className={`hidden lg:flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 4 200"
        className="h-[60%] w-4"
        style={{ overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        {/* 主线条 - 手绘风格波浪 */}
        <motion.path
          d="M2,0 Q1,25 2,50 T2,100 T2,150 T2,200"
          fill="none"
          stroke="var(--sketch-border)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        {/* 装饰点 */}
        <motion.circle
          cx="2"
          cy="50"
          r="3"
          fill="var(--sketch-accent)"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.4 }}
        />
        <motion.circle
          cx="2"
          cy="100"
          r="3"
          fill="var(--sketch-secondary)"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.6 }}
        />
        <motion.circle
          cx="2"
          cy="150"
          r="3"
          fill="var(--sketch-accent)"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.8 }}
        />
      </svg>
    </div>
  );
};
