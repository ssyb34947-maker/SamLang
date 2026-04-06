import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Mail } from 'lucide-react';
import { PRODUCT_NAME } from '../constants';
import { fadeIn } from '../constants';

const FOOTER_LINKS = [
  {
    title: '产品',
    links: ['功能介绍', '定价方案', '更新日志', '路线图'],
  },
  {
    title: '资源',
    links: ['帮助中心', 'API 文档', '社区论坛', '博客'],
  },
  {
    title: '公司',
    links: ['关于我们', '联系我们', '隐私政策', '服务条款'],
  },
];

const SOCIAL_LINKS = [
  { icon: Github, href: 'https://github.com/ssyb34947-maker/SamLang', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Mail, href: '#', label: 'Email' },
];

export const Footer: React.FC = () => {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="py-16 border-t-4"
      style={{
        backgroundColor: 'white',
        borderColor: 'var(--sketch-border)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <h3
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
            >
              {PRODUCT_NAME}
            </h3>
            <p
              className="text-base mb-6 max-w-sm"
              style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
            >
              山姆学院，让每一分钟的学习都有价值。
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-110"
                    style={{
                      backgroundColor: 'var(--sketch-bg)',
                      border: '2px solid var(--sketch-border)',
                      borderRadius: 'var(--wobbly-sm)',
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: 'var(--sketch-text)' }} />
                  </a>
                );
              })}
            </div>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h4
                className="text-lg font-bold mb-4"
                style={{ fontFamily: 'var(--font-hand-heading)', color: 'var(--sketch-text)' }}
              >
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-base transition-colors hover:text-[var(--sketch-accent)]"
                      style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-8 border-t-2 border-dashed flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'var(--sketch-muted)' }}
        >
          <p
            className="text-sm"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
          >
            © 2026 {PRODUCT_NAME}. All rights reserved.
          </p>
          <p
            className="text-sm"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
          >
            Made with ❤️ for every learner
          </p>
        </div>
      </div>
    </motion.footer>
  );
};
