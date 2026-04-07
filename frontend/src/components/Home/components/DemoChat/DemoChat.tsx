import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TypewriterBubble } from './TypewriterBubble';
import { DemoLink } from '../DemoLink';
import { useSequentialTypewriter } from '../../hooks';
import { useContent } from '../../hooks';

export const DemoChat: React.FC = () => {
  const { BRAND, HERO } = useContent();

  const demoContent = HERO.DEMO;
  const title = demoContent.TITLE.replace('{BRAND}', BRAND.NAME);
  const aiMessages = demoContent.AI_MESSAGES;
  const userMessage = demoContent.USER_MESSAGE;
  const inputPlaceholder = demoContent.INPUT_PLACEHOLDER;
  const demoLinkText = demoContent.DEMO_LINK_TEXT;

  const { displayedMessages, currentTypingText, isTyping, currentMessageIndex } = useSequentialTypewriter({
    messages: aiMessages,
    speed: 20,        // 加快打字速度（从 45ms 改为 20ms）
    messageDelay: 300, // 减少消息间隔（从 600ms 改为 300ms）
    initialDelay: 360, // 减少初始延迟（从 800ms 改为 360ms）
    loop: true,
    loopDelay: 6000,   // 减少循环间隔（从 4000ms 改为 6000ms）
  });

  const showUserMessage = displayedMessages.length >= 1;
  const showSecondAIMessage = displayedMessages.length >= 2 || (displayedMessages.length === 1 && currentMessageIndex === 1);

  return (
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
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b-2 border-dashed" style={{ borderColor: 'var(--sketch-muted)' }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--sketch-accent)' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--sketch-paper)' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--sketch-secondary)' }} />
            <span
              className="ml-auto text-sm"
              style={{ fontFamily: 'var(--font-hand-body)', color: 'var(--sketch-pencil)' }}
            >
              {title}
            </span>
          </div>

          {/* First AI Message */}
          {displayedMessages.length > 0 ? (
            <TypewriterBubble text={displayedMessages[0]} isAI={true} />
          ) : (
            <TypewriterBubble text={currentTypingText} isTyping={isTyping} isAI={true} />
          )}

          {/* User Message */}
          {showUserMessage && (
            <TypewriterBubble text={userMessage} isAI={false} maxWidth="75%" />
          )}

          {/* Second AI Message */}
          {showSecondAIMessage && (
            <>
              {displayedMessages.length > 1 ? (
                <TypewriterBubble text={displayedMessages[1]} isAI={true} maxWidth="90%" />
              ) : (
                <TypewriterBubble text={currentTypingText} isTyping={isTyping} isAI={true} maxWidth="90%" />
              )}
              {/* Demo Link - shown when second message is fully displayed */}
              {displayedMessages.length > 1 && (
                <div className="mt-1 ml-2">
                  <DemoLink text={demoLinkText} />
                </div>
              )}
            </>
          )}

          {/* Input Area */}
          <div className="pt-4 flex items-center gap-3">
            <div
              className="flex-1 h-12 rounded-lg flex items-center px-4"
              style={{
                border: '2px dashed var(--sketch-muted)',
                fontFamily: 'var(--font-chat)',
                color: 'var(--sketch-pencil)',
              }}
            >
              {inputPlaceholder}
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
    </motion.div>
  );
};
