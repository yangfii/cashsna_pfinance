import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'muted';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const variantMap = {
  default: 'border-border',
  primary: 'border-primary',
  muted: 'border-muted-foreground',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
}) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-solid border-t-transparent',
        sizeMap[size],
        variantMap[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;