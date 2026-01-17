import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-full font-medium transition-colors';

    const variants = {
      default:
        'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
      primary:
        'bg-black text-white dark:bg-white dark:text-black',
      secondary:
        'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100',
      success:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      danger:
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      info:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
