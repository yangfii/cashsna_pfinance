import React, { ReactNode } from 'react';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'flip';
  delay?: number;
  duration?: number;
  hover?: 'lift' | 'glow' | 'scale' | 'none';
}

const animationClasses = {
  'fade-up': 'translate-y-8 opacity-0',
  'fade-left': 'translate-x-8 opacity-0', 
  'fade-right': '-translate-x-8 opacity-0',
  'scale': 'scale-90 opacity-0',
  'flip': 'rotateY-180 opacity-0'
};

const visibleClasses = {
  'fade-up': 'translate-y-0 opacity-100',
  'fade-left': 'translate-x-0 opacity-100',
  'fade-right': 'translate-x-0 opacity-100',
  'scale': 'scale-100 opacity-100',
  'flip': 'rotateY-0 opacity-100'
};

const hoverClasses = {
  'lift': 'hover:-translate-y-2 hover:shadow-xl',
  'glow': 'hover:shadow-glow',
  'scale': 'hover:scale-105',
  'none': ''
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  hover = 'lift',
  ...props
}) => {
  const { ref, isVisible } = useScrollAnimation({ delay });

  return (
    <Card
      ref={ref as any}
      className={cn(
        'transition-all ease-out',
        `duration-${duration}`,
        !isVisible && animationClasses[animation],
        isVisible && visibleClasses[animation],
        hoverClasses[hover],
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};