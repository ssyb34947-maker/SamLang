import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface DemoLinkProps {
  text?: string;
  href?: string;
  className?: string;
}

export const DemoLink: React.FC<DemoLinkProps> = ({
  text = '查看视频演示',
  href = '#demo',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80 ${className}`}
      style={{
        fontFamily: 'var(--font-hand-body)',
        color: 'var(--sketch-secondary)',
      }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Play className="w-3.5 h-3.5" />
      <span className="underline underline-offset-2">{text}</span>
    </motion.a>
  );
};
