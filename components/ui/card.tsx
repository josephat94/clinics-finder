'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover } from './popover';
import { Button } from './button';
import { ListItem } from './list-item';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'normal' | 'first' | 'second' | 'third';
  travelTime?: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    status: string;
  };
  badges?: React.ReactNode;
  floatingBadge?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  showOptions?: boolean;
}


const MenuOptions = ({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) => {
  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      {onEdit && (
        <ListItem
          onClick={onEdit}
          icon={<FaEdit className="w-4 h-4" />}
        >
          Editar
        </ListItem>
      )}
      {onDelete && (
        <ListItem
          onClick={onDelete}
          icon={<FaTrash className="w-4 h-4" />}
          variant="danger"
        >
          Eliminar
        </ListItem>
      )}
    </div>
  );
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    travelTime, 
    badges, 
    floatingBadge, 
    children, 
    onEdit,
    onDelete,
    showOptions = false,
    ...props 
  }, ref) => {
    // Determinar la variante basada en la prop variant
    // Si se especifica una variante, usarla; si hay travelTime pero no variante, usar 'normal'
    const effectiveVariant = variant || 'normal';

    const baseStyles =
      'bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border transition-colors relative w-full';

    const variants = {
      normal:
        'border-zinc-200 dark:border-zinc-800',
      first:
        'border-yellow-500 dark:border-yellow-400 border-2 shadow-lg ring-2 ring-yellow-500/30 dark:ring-yellow-400/30 bg-yellow-50/10 dark:bg-yellow-950/10',
      second:
        'border-slate-500 dark:border-slate-300 border-2 shadow-lg ring-2 ring-slate-400/20 dark:ring-slate-300/30 bg-slate-50/10 dark:bg-slate-950/10',
      third:
        'border-amber-600 dark:border-amber-500 border-2 shadow-lg ring-2 ring-amber-600/30 dark:ring-amber-500/30 bg-amber-50/10 dark:bg-amber-950/10',
    };

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleEdit = () => {
      setIsPopoverOpen(false);
      if (onEdit) {
        onEdit();
      }
    };

    const handleDelete = () => {
      setIsPopoverOpen(false);
      if (onDelete) {
        onDelete();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[effectiveVariant], className)}
        {...props}
      >
        {floatingBadge && (
          <div className="absolute -top-4 -right-4 z-10">
            {floatingBadge}
          </div>
        )}
        {showOptions && (onEdit || onDelete) && (
          <div className="absolute top-4 right-4 z-10">
            <Popover
              open={isPopoverOpen}
              
              onOpenChange={setIsPopoverOpen}
              content={
                <MenuOptions onEdit={onEdit} onDelete={onDelete} />
              }
              placement="bottom-end"
              contentClassName="p-2"
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Opciones"
              >
                <FaEllipsisV className="w-4 h-4" />
              </Button>
            </Popover>
          </div>
        )}
        {badges && (
          <div className="flex flex-wrap gap-2 mb-4">
            {badges}
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
