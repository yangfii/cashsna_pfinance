import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': any;
    }
  }
}

export interface AnimatedIconProps {
  src: string;
  trigger?: 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'morph' | 'sequence';
  colors?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  delay?: number;
  speed?: number;
  className?: string;
  onClick?: () => void;
  onHover?: boolean;
  loading?: 'eager' | 'lazy';
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  src,
  trigger = 'hover',
  colors = 'primary:hsl(var(--primary)),secondary:hsl(var(--muted-foreground))',
  size = 'md',
  delay = 0,
  speed = 1,
  className,
  onClick,
  onHover = true,
  loading = 'lazy',
}) => {
  const iconRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const iconSize = typeof size === 'number' ? size : sizeMap[size];

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://cdn.lordicon.com/lordicon.js"]');
    
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    // Load Lordicon script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.lordicon.com/lordicon.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Lordicon script');
      setIsLoaded(true); // Still show fallback
    };
    
    document.head.appendChild(script);

    return () => {
      // Script cleanup is handled by the browser
    };
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    
    // Trigger animation on click
    if (iconRef.current && trigger === 'click') {
      iconRef.current.playerInstance?.play();
    }
  };

  if (!isLoaded && loading === 'lazy') {
    // Show a fallback while loading
    return (
      <div 
        className={cn(
          "inline-flex items-center justify-center bg-muted/50 rounded-md animate-pulse",
          className
        )}
        style={{ width: iconSize, height: iconSize }}
      />
    );
  }

  return (
    <lord-icon
      ref={iconRef}
      src={src}
      trigger={trigger}
      colors={colors}
      delay={delay}
      speed={speed}
      style={{ width: iconSize, height: iconSize }}
      className={cn("inline-block", className)}
      onClick={handleClick}
      loading={loading}
    />
  );
};