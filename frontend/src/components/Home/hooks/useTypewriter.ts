import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export const useTypewriter = ({
  text,
  speed = 50,
  delay = 0,
  onComplete,
}: UseTypewriterOptions) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const startTyping = useCallback(() => {
    setDisplayText('');
    setIsTyping(true);
    setIsComplete(false);
  }, []);

  const reset = useCallback(() => {
    setDisplayText('');
    setIsTyping(false);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    const timeoutId = setTimeout(() => {
      const intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsTyping(false);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [text, speed, delay, isTyping, onComplete]);

  return {
    displayText,
    isTyping,
    isComplete,
    startTyping,
    reset,
  };
};

interface UseSequentialTypewriterOptions {
  messages: string[];
  speed?: number;
  messageDelay?: number;
  initialDelay?: number;
  loop?: boolean;
  loopDelay?: number;
}

export const useSequentialTypewriter = ({
  messages,
  speed = 40,
  messageDelay = 800,
  initialDelay = 500,
  loop = true,
  loopDelay = 3000,
}: UseSequentialTypewriterOptions) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'typing' | 'waiting' | 'completed'>('idle');

  useEffect(() => {
    if (messages.length === 0) return;

    const startSequence = () => {
      setCurrentMessageIndex(0);
      setDisplayedMessages([]);
      setCurrentTypingText('');
      setPhase('typing');
      setIsTyping(true);
    };

    const initialTimeout = setTimeout(startSequence, initialDelay);

    return () => clearTimeout(initialTimeout);
  }, [messages, initialDelay]);

  useEffect(() => {
    if (phase !== 'typing' || currentMessageIndex >= messages.length) return;

    const currentMessage = messages[currentMessageIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setCurrentTypingText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setDisplayedMessages(prev => [...prev, currentMessage]);
        setCurrentTypingText('');
        setIsTyping(false);

        if (currentMessageIndex < messages.length - 1) {
          setPhase('waiting');
          setTimeout(() => {
            setCurrentMessageIndex(prev => prev + 1);
            setPhase('typing');
            setIsTyping(true);
          }, messageDelay);
        } else {
          setPhase('completed');
          if (loop) {
            setTimeout(() => {
              setCurrentMessageIndex(0);
              setDisplayedMessages([]);
              setPhase('typing');
              setIsTyping(true);
            }, loopDelay);
          }
        }
      }
    }, speed);

    return () => clearInterval(typeInterval);
  }, [phase, currentMessageIndex, messages, speed, messageDelay, loop, loopDelay]);

  return {
    displayedMessages,
    currentTypingText,
    isTyping,
    currentMessageIndex,
    phase,
  };
};
