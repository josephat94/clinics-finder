import React from 'react';
import { cn } from '@/lib/utils';

export interface ListItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  className?: string;
}

const ListItem = React.forwardRef<HTMLButtonElement, ListItemProps>(
  ({ children, icon, variant = 'default', className, ...props }, ref) => {
    const baseStyles =
      'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer w-full text-left';

    const variants = {
      default:
        'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800',
      danger:
        'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
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
