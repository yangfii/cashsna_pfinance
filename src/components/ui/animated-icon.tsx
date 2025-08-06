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

    // Load Lordicon script dynamically with better error handling
    const script = document.createElement('script');
    script.src = 'https://cdn.lordicon.com/lordicon.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    const handleLoad = () => {
      setIsLoaded(true);
    };
    
    const handleError = (error: Event) => {
      console.warn('Lordicon script failed to load, using fallback:', error);
      setIsLoaded(true); // Show fallback
    };
    
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    
    try {
      document.head.appendChild(script);
    } catch (error) {
      console.warn('Failed to add Lordicon script:', error);
      setIsLoaded(true); // Show fallback
    }

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    
    // Trigger animation on click
    if (iconRef.current && trigger === 'click') {
      try {
        iconRef.current.playerInstance?.play();
      } catch (error) {
        console.warn('Failed to trigger icon animation:', error);
      }
    }
  };

  // Always show fallback if loading is lazy and not loaded, or if script failed
  if (!isLoaded) {
    return (
      <div 
        className={cn(
          "inline-flex items-center justify-center bg-muted/50 rounded-md",
          "transition-colors hover:bg-muted cursor-pointer",
          className
        )}
        style={{ width: iconSize, height: iconSize }}
        onClick={onClick}
        role="button"
        tabIndex={0}
      />
    );
  }

  try {
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
  } catch (error) {
    console.warn('Failed to render lord-icon:', error);
    // Return fallback on any render error
    return (
      <div 
        className={cn(
          "inline-flex items-center justify-center bg-muted/50 rounded-md",
          "transition-colors hover:bg-muted cursor-pointer",
          className
        )}
        style={{ width: iconSize, height: iconSize }}
        onClick={onClick}
        role="button"
        tabIndex={0}
      />
    );
  }
};