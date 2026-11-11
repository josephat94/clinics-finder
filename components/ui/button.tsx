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
      "inline-flex items-center gap-3 justify-center whitespace-nowrap rounded-xl font-semibold transition-[opacity,box-shadow,transform,background-color] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hub-primary focus-visible:ring-offset-2 focus-visible:ring-offset-hub-bg disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variants = {
      primary:
        "bg-hub-accent text-white hover:bg-hub-primary",
      secondary: "glass-card text-hub-fg hover:bg-hub-paper",
      outline:
        "border border-hub-fg bg-hub-card text-hub-fg hover:bg-hub-paper",
      ghost: "bg-transparent text-hub-fg hover:bg-hub-paper",
      danger:
        "bg-hub-danger text-white hover:opacity-90 focus-visible:ring-hub-danger",
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
