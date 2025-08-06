import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'slide-up';
  delay?: number;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

const animationClasses = {
  'fade-up': 'opacity-0 translate-y-8',
  'fade-left': 'opacity-0 translate-x-8',
  'fade-right': 'opacity-0 -translate-x-8',
  'scale': 'opacity-0 scale-90',
  'slide-up': 'opacity-0 translate-y-12'
};

const visibleClasses = {
  'fade-up': 'opacity-100 translate-y-0',
  'fade-left': 'opacity-100 translate-x-0',
  'fade-right': 'opacity-100 translate-x-0',
  'scale': 'opacity-100 scale-100',
  'slide-up': 'opacity-100 translate-y-0'
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className,
  threshold = 0.1,
  triggerOnce = true
}) => {
  const { ref, isVisible } = useScrollAnimation({ 
    threshold, 
    delay, 
    triggerOnce 
  });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        !isVisible && animationClasses[animation],
        isVisible && visibleClasses[animation],
        className
      )}
    >
      {children}
    </div>
  );
};

interface StaggeredRevealProps {
  children: ReactNode[];
  staggerDelay?: number;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale';
  className?: string;
}

export const StaggeredReveal: React.FC<StaggeredRevealProps> = ({
  children,
  staggerDelay = 100,
  animation = 'fade-up',
  className
}) => {
  const { containerRef, visibleItems } = useStaggeredAnimation(children.length, staggerDelay);

  return (
    <div ref={containerRef} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-700 ease-out',
            !visibleItems.has(index) && animationClasses[animation],
            visibleItems.has(index) && visibleClasses[animation]
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
};