import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { fadeInUp, staggerContainer, viewportConfig } from '../constants';
import { useContent } from '../hooks';

export const Testimonials: React.FC = () => {
  const { TESTIMONIALS_SECTION, TESTIMONIALS_LIST } = useContent();

  return (
    <section id="testimonials" className="py-20 md:py-32">
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
            {TESTIMONIALS_SECTION.TITLE}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
          >
            {TESTIMONIALS_SECTION.SUBTITLE}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS_LIST.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? -1 : 1 }}
              transition={{ duration: 0.2 }}
              className="sketch-card-note relative"
              style={{
                transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)`,
              }}
            >
              <Quote
                className="absolute top-4 right-4 w-8 h-8 opacity-20"
                style={{ color: 'var(--sketch-border)' }}
              />
              <p
                className="text-base mb-6 relative z-10"
                style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-text)' }}
              >
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: 'var(--sketch-secondary)',
                    color: 'white',
                    fontFamily: 'var(--font-hand-heading)',
                    border: '2px solid var(--sketch-border)',
                  }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <p
                    className="font-bold"
                    style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
                  >
                    {testimonial.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
