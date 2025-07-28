import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  text: string;
  className?: string;
  duration?: number;
  startDelay?: number;
}

export function TypingAnimation({ 
  text, 
  className, 
  duration = 2000,
  startDelay = 500 
}: TypingAnimationProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [startDelay]);

  return (
    <span className={cn("relative inline-block overflow-hidden", className)}>
      <span 
        className={cn(
          "inline-block transition-all ease-out opacity-0",
          isRevealed && "opacity-100 animate-[maskReveal_var(--duration)_ease-out_forwards]"
        )}
        style={{ 
          '--duration': `${duration}ms`,
          maskImage: isRevealed ? 'linear-gradient(90deg, black 0%, black 100%)' : 'linear-gradient(90deg, transparent 0%, transparent 100%)',
          WebkitMaskImage: isRevealed ? 'linear-gradient(90deg, black 0%, black 100%)' : 'linear-gradient(90deg, transparent 0%, transparent 100%)',
          maskSize: '200% 100%',
          WebkitMaskSize: '200% 100%',
          maskPosition: isRevealed ? '100% 0' : '0% 0',
          WebkitMaskPosition: isRevealed ? '100% 0' : '0% 0',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          animation: isRevealed ? `maskReveal ${duration}ms ease-out forwards` : 'none'
        } as React.CSSProperties}
      >
        {text}
      </span>
    </span>
  );
}