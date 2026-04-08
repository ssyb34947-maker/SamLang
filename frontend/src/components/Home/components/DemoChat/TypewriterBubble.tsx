import React from 'react';
import { motion } from 'framer-motion';

interface TypewriterBubbleProps {
  text: string;
  isTyping?: boolean;
  isAI?: boolean;
  maxWidth?: string;
}

export const TypewriterBubble: React.FC<TypewriterBubbleProps> = ({
  text,
  isTyping = false,
  isAI = true,
  maxWidth = '85%',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={isAI ? 'chat-bubble-ai' : 'chat-bubble-user ml-auto'}
      style={{ maxWidth }}
    >
      <p style={{ fontFamily: 'var(--font-chat)' }}>
        {text}
        {isTyping && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ marginLeft: '2px' }}
          >
            |
          </motion.span>
        )}
      </p>
    </motion.div>
  );
};
