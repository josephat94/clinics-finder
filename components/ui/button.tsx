import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center gap-3 justify-center rounded-2xl font-medium transition-[opacity,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 focus-visible:ring-offset-hub-bg disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variants = {
      primary:
        'bg-hub-accent text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] hover:opacity-90',
      secondary:
        'glass-card text-hub-fg',
      outline:
        'border-2 border-hub-primary bg-white/40 text-hub-fg hover:bg-[#fef3c7]',
      ghost:
        'bg-transparent text-hub-fg hover:bg-white/50',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
