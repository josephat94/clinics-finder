import React from 'react';
import { cn } from '@/lib/utils';

export interface ListItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  className?: string;
}

const ListItem = React.forwardRef<HTMLButtonElement, ListItemProps>(
  ({ children, icon, variant = 'default', className, disabled, ...props }, ref) => {
    const baseStyles =
      'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer w-full text-left';

    const variants = {
      default:
        'text-hub-fg hover:bg-[#fef3c7]',
      danger:
        'text-hub-danger hover:bg-red-50',
    };

    const disabledStyles =
      'opacity-40 text-hub-muted cursor-not-allowed hover:bg-transparent';

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          disabled && disabledStyles,
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
      </button>
    );
  }
);

ListItem.displayName = 'ListItem';

export { ListItem };
