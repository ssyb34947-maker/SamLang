import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, viewportConfig } from '../constants';
import { useContent } from '../hooks';

export const HowItWorks: React.FC = () => {
  const { HOW_IT_WORKS_SECTION, HOW_IT_WORKS_STEPS } = useContent();

  return (
    <section id="how-it-works" className="py-20 md:py-32">
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
            {HOW_IT_WORKS_SECTION.TITLE}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
          >
            {HOW_IT_WORKS_SECTION.SUBTITLE}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {HOW_IT_WORKS_STEPS.map((item, index) => (
            <motion.div
              key={item.step}
              variants={fadeInUp}
              className="relative"
            >
              <div className="sketch-card text-center" style={{ backgroundColor: 'white' }}>
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: index === 1 ? 'var(--sketch-accent)' : 'var(--sketch-secondary)',
                    border: '3px solid var(--sketch-border)',
                    boxShadow: 'var(--shadow-hard)',
                  }}
                >
                  <span
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-hand-heading)' }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3
                  className="text-xl md:text-2xl font-bold mb-3"
                  style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-base"
                  style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                >
                  {item.description}
                </p>
              </div>

              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5"
                  style={{
                    background: 'repeating-linear-gradient(90deg, var(--sketch-border) 0px, var(--sketch-border) 8px, transparent 8px, transparent 14px)',
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
