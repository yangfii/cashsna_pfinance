
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
  colors = 'primary:#16a34a,secondary:#6b7280',
  size = 'md',
  delay = 0,
  speed = 1,
  className,
  onClick,
  onHover = true,
  loading = 'eager',
}) => {
  const iconRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

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
    script.defer = true;
    
    const handleLoad = () => {
      console.log('Lordicon script loaded successfully');
      setIsLoaded(true);
      setScriptError(false);
    };
    
    const handleError = (error: Event) => {
      console.warn('Lordicon script failed to load:', error);
      setScriptError(true);
      setIsLoaded(true); // Show fallback
    };
    
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    
    // Force animation trigger
    if (iconRef.current) {
      try {
        iconRef.current.playerInstance?.play();
      } catch (error) {
        console.warn('Failed to trigger icon animation:', error);
      }
    }
  };

  const handleMouseEnter = () => {
    if (iconRef.current && trigger === 'hover') {
      try {
        iconRef.current.playerInstance?.play();
      } catch (error) {
        console.warn('Failed to trigger hover animation:', error);
      }
    }
  };

  // Show fallback if script failed to load
  if (scriptError) {
    return (
      <div 
        className={cn(
          "inline-flex items-center justify-center bg-muted/50 rounded-md animate-pulse",
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

  if (!isLoaded) {
    return (
      <div 
        className={cn(
          "inline-flex items-center justify-center bg-muted/30 rounded-md animate-pulse",
          className
        )}
        style={{ width: iconSize, height: iconSize }}
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
        className={cn("inline-block cursor-pointer", className)}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        loading={loading}
      />
    );
  } catch (error) {
    console.warn('Failed to render lord-icon:', error);
    return (
      <div 
        className={cn(
          "inline-flex items-center justify-center bg-muted/50 rounded-md",
          "transition-colors hover:bg-muted cursor-pointer animate-pulse",
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
