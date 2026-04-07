import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Mail } from 'lucide-react';
import { fadeIn } from '../constants';
import { useContent } from '../hooks';

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  GITHUB: Github,
  TWITTER: Twitter,
  EMAIL: Mail,
};

export const Footer: React.FC = () => {
  const { BRAND, FOOTER } = useContent();

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
              {BRAND.NAME}
            </h3>
            <p
              className="text-base mb-6 max-w-sm"
              style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
            >
              {FOOTER.TAGLINE}
            </p>
            <div className="flex gap-4">
              {Object.entries(FOOTER.SOCIAL).map(([key, social]) => {
                const Icon = SOCIAL_ICONS[key];
                if (!Icon) return null;
                return (
                  <a
                    key={key}
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

          {FOOTER.LINK_GROUPS.map((group) => (
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
            {FOOTER.COPYRIGHT.replace('{BRAND}', BRAND.NAME)}
          </p>
          <p
            className="text-sm"
            style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
          >
            {FOOTER.MADE_WITH}
          </p>
        </div>
      </div>
    </motion.footer>
  );
};
