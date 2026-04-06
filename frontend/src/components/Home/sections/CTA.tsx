import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PRODUCT_NAME } from '../constants';
import { fadeInUp, staggerContainer, viewportConfig } from '../constants';

export const CTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="sketch-card text-center max-w-4xl mx-auto"
          style={{
            backgroundColor: 'var(--sketch-paper)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{
              background: 'repeating-linear-gradient(90deg, var(--sketch-accent) 0px, var(--sketch-accent) 20px, var(--sketch-secondary) 20px, var(--sketch-secondary) 40px)',
            }}
          />

          <motion.div variants={fadeInUp} className="space-y-6">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--sketch-accent)' }} />
              <span
                className="text-lg"
                style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
              >
                准备好开始了吗？
              </span>
            </div>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
            >
              加入 {PRODUCT_NAME}，开启你的<br className="hidden md:block" />山姆学院之旅
            </h2>

            <p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
            >
              免费注册，立即入学山姆学院
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => navigate('/register')}
                className="sketch-btn sketch-btn-secondary text-lg"
                style={{ padding: '16px 40px' }}
              >
                免费开始使用
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="sketch-btn text-lg"
                style={{ padding: '16px 40px' }}
              >
                先试试看
              </button>
            </div>

            <p
              className="text-sm pt-4"
              style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
            >
              无任何费用 · 随时取消 · 免费版可用
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
