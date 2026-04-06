import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PRODUCT_NAME, SLOGAN, SUB_SLOGAN, TRUST_BADGES } from '../constants';
import { heroTextVariants, staggerContainer, viewportConfig } from '../constants';
import { useAuth } from '../../../hooks/useAuth';
import { LobsterProfessor } from '../../LobsterProfessor';

// 毛笔手绘渐进横线组件 - 更大更粗
const BrushStroke: React.FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto mt-4">
      <svg
        viewBox="0 0 600 100"
        className="w-full h-20 md:h-24"
        style={{ overflow: 'visible' }}
      >
        {/* 主线条 - 更粗 */}
        <motion.path
          d="M10,50 Q150,35 300,50 T590,50"
          fill="none"
          stroke="var(--sketch-text)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {/* 辅助线条 1 */}
        <motion.path
          d="M20,58 Q160,45 310,58 T580,58"
          fill="none"
          stroke="var(--sketch-text)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        />
        {/* 辅助线条 2 - 细线 */}
        <motion.path
          d="M30,42 Q170,28 320,42 T570,42"
          fill="none"
          stroke="var(--sketch-text)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
        />
      </svg>
      <motion.span
        className="absolute right-4 -bottom-2 text-base md:text-lg"
        style={{
          fontFamily: "'Kalam', cursive",
          color: 'var(--sketch-pencil)',
          fontStyle: 'italic',
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        written by Sam
      </motion.span>
    </div>
  );
};

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // 处理登录按钮点击
  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="min-h-screen pt-20 md:pt-24 flex items-center">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          <div className="space-y-8">
            <motion.div variants={heroTextVariants} className="inline-flex items-center gap-2">
              <span
                className="px-4 py-2 text-sm md:text-base"
                style={{
                  fontFamily: 'var(--font-hand-body)',
                  backgroundColor: 'var(--sketch-paper)',
                  border: '2px solid var(--sketch-border)',
                  borderRadius: 'var(--wobbly-sm)',
                  transform: 'rotate(-1deg)',
                }}
              >
                <Sparkles className="w-4 h-4 inline mr-1" style={{ color: 'var(--sketch-accent)' }} />
                全学科 AI 教学平台
              </span>
            </motion.div>

            <motion.h1
              variants={heroTextVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{
                fontFamily: 'var(--font-hand-heading)',
                color: 'var(--sketch-text)',
              }}
            >
              {SLOGAN}
            </motion.h1>

            {/* 手绘线放在标题下面 */}
            <BrushStroke />

            <motion.p
              variants={heroTextVariants}
              className="text-lg md:text-xl max-w-xl"
              style={{
                fontFamily: 'var(--font-hand-body)',
                color: 'var(--sketch-pencil)',
              }}
            >
              {SUB_SLOGAN}
            </motion.p>

            <motion.div variants={heroTextVariants} className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/register')}
                className="sketch-btn sketch-btn-secondary text-lg"
                style={{ padding: '14px 32px' }}
              >
                免费开始学习
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleLoginClick}
                className="sketch-btn text-lg"
                style={{ padding: '14px 32px' }}
              >
                {isAuthenticated ? '进入学习' : '登录'}
              </button>
            </motion.div>

            <motion.div variants={heroTextVariants} className="flex flex-wrap gap-4 pt-4">
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="text-sm flex items-center gap-1"
                  style={{
                    fontFamily: 'var(--font-hand-body)',
                    color: 'var(--sketch-pencil)',
                  }}
                >
                  <span style={{ color: 'var(--sketch-accent)' }}>✓</span>
                  {badge}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div
              className="sketch-card p-6 md:p-8 transform rotate-1"
              style={{ backgroundColor: 'white' }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b-2 border-dashed" style={{ borderColor: 'var(--sketch-muted)' }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--sketch-accent)' }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--sketch-paper)' }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--sketch-secondary)' }} />
                  <span
                    className="ml-auto text-sm"
                    style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                  >
                    {PRODUCT_NAME} AI 助教
                  </span>
                </div>

                <div className="chat-bubble-ai" style={{ maxWidth: '85%' }}>
                  <p style={{ fontFamily: 'var(--font-chat)' }}>
                    你好！我是山姆教授。今天想学习什么内容？我会用最适合你的方法教会你。
                  </p>
                </div>

                <div className="chat-bubble-user ml-auto" style={{ maxWidth: '75%' }}>
                  <p style={{ fontFamily: 'var(--font-chat)' }}>
                    我想复习高中数学的圆锥曲线部分
                  </p>
                </div>

                <div className="chat-bubble-ai" style={{ maxWidth: '90%' }}>
                  <p style={{ fontFamily: 'var(--font-chat)' }}>
                    好的！让我为你整理圆锥曲线的核心知识点...相关数据已经保存，你也可以查看我为你准备的视频...
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <div
                    className="flex-1 h-12 rounded-lg flex items-center px-4"
                    style={{
                      border: '2px dashed var(--sketch-muted)',
                      fontFamily: 'var(--font-chat)',
                      color: 'var(--sketch-pencil)',
                    }}
                  >
                    输入消息...
                  </div>
                  <button
                    className="w-12 h-12 flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--sketch-secondary)',
                      borderRadius: 'var(--wobbly-sm)',
                      border: '2px solid var(--sketch-border)',
                    }}
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* 龙虾教授 - 黑板右上角 */}
            <motion.div
              className="absolute -top-16 -right-8 z-10"
              initial={{ opacity: 0, scale: 0.5, rotate: 15 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: [8, 12, 8, 4, 8],
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.8 },
                scale: { duration: 0.8, delay: 0.8 },
                rotate: {
                  duration: 3,
                  delay: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <LobsterProfessor
                width={200}
                height={170}
                autoPlay={true}
                animationSpeed={0.8}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
