import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'rectangular', 
    width,
    height,
    animation = 'pulse',
    style,
    ...props 
  }, ref) => {
    const baseStyles =
      'bg-zinc-200 dark:bg-zinc-800 rounded';

    const variants = {
      rectangular: 'rounded',
      circular: 'rounded-full',
      text: 'rounded',
    };

    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-pulse',
      none: '',
    };

    const customStyle: React.CSSProperties = {
      ...style,
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          animations[animation],
          className
        )}
        style={customStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
