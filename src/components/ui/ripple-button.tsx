import React, { useState, useRef } from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface RippleEffect {
  x: number;
  y: number;
  id: number;
}

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
}

export const RippleButton: React.FC<RippleButtonProps> = ({ 
  children, 
  className, 
  rippleColor = 'rgba(255, 255, 255, 0.5)',
  onClick,
  ...props 
}) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const newRipple: RippleEffect = {
        x,
        y,
        id: Date.now()
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden',
        'hover:scale-105 transition-all duration-300',
        'active:scale-95',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: rippleColor,
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear'
          }}
        />
      ))}
    </Button>
  );
};