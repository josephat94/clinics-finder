'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('common');
  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      {onEdit && (
        <ListItem
          onClick={onEdit}
          icon={<FaEdit className="w-4 h-4" />}
        >
          {t('edit')}
        </ListItem>
      )}
      {onDelete && (
        <ListItem
          onClick={onDelete}
          icon={<FaTrash className="w-4 h-4" />}
          variant="danger"
        >
          {t('delete')}
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
      'text-hub-fg p-6 rounded-2xl border transition-[box-shadow,border-color] duration-200 relative w-full flex flex-col';

    const variants = {
      normal:
        'glass-card',
      first:
        'border-hub-caution border-2 shadow-sm ring-2 ring-hub-caution/30 bg-hub-caution-soft',
      second:
        'border-hub-muted border-2 shadow-sm ring-2 ring-hub-line/40 bg-hub-paper',
      third:
        'border-hub-warn border-2 shadow-sm ring-2 ring-hub-warn/30 bg-hub-warn-soft',
    };

    const t = useTranslations('common');
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
                aria-label={t('options')}
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
