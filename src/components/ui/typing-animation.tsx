import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  startDelay?: number;
}

export function TypingAnimation({ 
  text, 
  className, 
  typingSpeed = 100,
  startDelay = 500 
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const startTyping = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, typingSpeed);

      return () => clearInterval(typeInterval);
    }, startDelay);

    return () => clearTimeout(startTyping);
  }, [text, typingSpeed, startDelay]);

  return (
    <span className={cn("relative", className)}>
      {displayText}
      <span 
        className={cn(
          "inline-block w-0.5 h-5 bg-current ml-1",
          "animate-pulse",
          !isTyping && displayText.length === text.length && "animate-[blink_1s_infinite]"
        )}
      />
    </span>
  );
}