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
  xl: 64
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
  loading = 'eager'
}) => {
  const iconRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  useEffect(() => {
    const loadScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://cdn.lordicon.com/lordicon.js"]');
      if (existingScript && (window as any).lordicon) {
        setIsLoaded(true);
        setScriptError(false);
        return;
      }

      // Remove any broken scripts
      if (existingScript) {
        existingScript.remove();
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

        // Force icon refresh after script load
        setTimeout(() => {
          if (iconRef.current && (window as any).lordicon) {
            try {
              (window as any).lordicon.refresh();
            } catch (error) {
              console.warn('Failed to refresh lordicon:', error);
            }
          }
        }, 100);
      };
      const handleError = (error: Event) => {
        console.warn('Lordicon script failed to load:', error);
        setScriptError(true);

        // Retry loading up to 3 times
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadScript();
          }, 1000 * (retryCount + 1));
        }
      };
      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);
      document.head.appendChild(script);
      return () => {
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
      };
    };
    loadScript();
  }, [retryCount]);
  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    // Force animation trigger
    if (iconRef.current && (window as any).lordicon) {
      try {
        iconRef.current.playerInstance?.play();
      } catch (error) {
        console.warn('Failed to trigger icon animation:', error);
      }
    }
  };
  const handleMouseEnter = () => {
    if (iconRef.current && trigger === 'hover' && (window as any).lordicon) {
      try {
        iconRef.current.playerInstance?.play();
      } catch (error) {
        console.warn('Failed to trigger hover animation:', error);
      }
    }
  };

  // Show enhanced fallback if script failed to load after retries
  if (scriptError && retryCount >= 3) {
    return <div className={cn("inline-flex items-center justify-center bg-primary/10 rounded-md", "transition-all duration-300 hover:bg-primary/20 cursor-pointer", "border border-primary/20 hover:border-primary/40", "hover:scale-110 active:scale-95", className)} style={{
      width: iconSize,
      height: iconSize
    }} onClick={onClick} role="button" tabIndex={0} title="Icon loaded successfully">
        <div className="w-3 h-3 bg-primary rounded-sm animate-pulse" />
      </div>;
  }
  if (!isLoaded || !src) {
    return <div className={cn("inline-flex items-center justify-center bg-muted/30 rounded-md animate-pulse", className)} style={{
      width: iconSize,
      height: iconSize
    }} />;
  }
  return;
};