'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export type PopoverPlacement = 
  | 'top' 
  | 'top-start' 
  | 'top-end'
  | 'bottom' 
  | 'bottom-start' 
  | 'bottom-end'
  | 'left' 
  | 'left-start' 
  | 'left-end'
  | 'right' 
  | 'right-start' 
  | 'right-end';

export interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  offset?: number;
  trigger?: 'click' | 'hover';
  className?: string;
  contentClassName?: string;
  zIndex?: number;
}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      children,
      content,
      open: controlledOpen,
      onOpenChange,
      placement = 'bottom',
      offset: offsetValue = 8,
      trigger = 'click',
      className,
      contentClassName,
      zIndex = 50,
    },
    ref
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    };

    // Calcular posición del popover
    const calculatePosition = useCallback(() => {
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      
      // Si el contenido aún no se ha renderizado, usar dimensiones estimadas
      const contentWidth = contentRef.current?.offsetWidth || 200;
      const contentHeight = contentRef.current?.offsetHeight || 100;

      let top = 0;
      let left = 0;

      const [primary, secondary] = placement.split('-') as [string, string | undefined];

      // Calcular posición principal usando getBoundingClientRect (coordenadas relativas al viewport)
      switch (primary) {
        case 'top':
          top = triggerRect.top - contentHeight - offsetValue;
          break;
        case 'bottom':
          top = triggerRect.bottom + offsetValue;
          break;
        case 'left':
          left = triggerRect.left - contentWidth - offsetValue;
          break;
        case 'right':
          left = triggerRect.right + offsetValue;
          break;
      }

      // Calcular posición secundaria (start, end)
      switch (primary) {
        case 'top':
        case 'bottom':
          if (secondary === 'start') {
            left = triggerRect.left;
          } else if (secondary === 'end') {
            left = triggerRect.right - contentWidth;
          } else {
            // center (default)
            left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
          }
          break;
        case 'left':
        case 'right':
          if (secondary === 'start') {
            top = triggerRect.top;
          } else if (secondary === 'end') {
            top = triggerRect.bottom - contentHeight;
          } else {
            // center (default)
            top = triggerRect.top + (triggerRect.height - contentHeight) / 2;
          }
          break;
      }

      // Ajustar para que no se salga de la pantalla
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 8;

      if (left < padding) {
        left = padding;
      } else if (left + contentWidth > viewportWidth - padding) {
        left = viewportWidth - contentWidth - padding;
      }

      if (top < padding) {
        top = padding;
      } else if (top + contentHeight > viewportHeight - padding) {
        top = viewportHeight - contentHeight - padding;
      }

      setPosition({ top, left });
    }, [placement, offsetValue]);

    useEffect(() => {
      if (open) {
        // Calcular posición inicial
        const timer = setTimeout(() => {
          calculatePosition();
        }, 0);

        const handleResize = () => calculatePosition();
        const handleScroll = () => calculatePosition();
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true);
        
        // Recalcular después de que el contenido se renderice completamente
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            calculatePosition();
          });
        });

        return () => {
          clearTimeout(timer);
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('scroll', handleScroll, true);
        };
      }
    }, [open, calculatePosition]);

    const handleClick = () => {
      if (trigger === 'click') {
        setOpen(!open);
      }
    };

    const handleMouseEnter = () => {
      if (trigger === 'hover') {
        setOpen(true);
      }
    };

    const handleMouseLeave = () => {
      if (trigger === 'hover') {
        setOpen(false);
      }
    };

    // Cerrar al hacer click fuera
    useEffect(() => {
      if (open && trigger === 'click') {
        const handleClickOutside = (event: MouseEvent) => {
          if (
            triggerRef.current &&
            contentRef.current &&
            !triggerRef.current.contains(event.target as Node) &&
            !contentRef.current.contains(event.target as Node)
          ) {
            setOpen(false);
          }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }, [open, trigger]);

    // Cerrar con Escape
    useEffect(() => {
      if (open) {
        const handleEscape = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            setOpen(false);
          }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
          document.removeEventListener('keydown', handleEscape);
        };
      }
    }, [open]);

    const animationVariants = {
      hidden: {
        opacity: 0,
        scale: 0.95,
        y: placement.startsWith('top') ? 5 : placement.startsWith('bottom') ? -5 : 0,
        x: placement.startsWith('left') ? 5 : placement.startsWith('right') ? -5 : 0,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: placement.startsWith('top') ? 5 : placement.startsWith('bottom') ? -5 : 0,
        x: placement.startsWith('left') ? 5 : placement.startsWith('right') ? -5 : 0,
      },
    };

    return (
      <>
        <div
          ref={triggerRef}
          className={cn('inline-block', className)}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </div>
        {typeof window !== 'undefined' &&
          createPortal(
            <AnimatePresence>
              {open && (
                <motion.div
                  ref={contentRef}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={animationVariants}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{
                    position: 'fixed',
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    zIndex: zIndex,
                  }}
                  className={cn(
                    'rounded-lg border border-zinc-200 dark:border-zinc-800',
                    'bg-white dark:bg-zinc-900',
                    'shadow-lg',
                    'p-4',
                    'min-w-[200px]',
                    contentClassName
                  )}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {content}
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
      </>
    );
  }
);

Popover.displayName = 'Popover';

// Componente helper para PopoverContent (opcional)
export interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-sm text-zinc-900 dark:text-zinc-100',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

PopoverContent.displayName = 'PopoverContent';

// Componente helper para PopoverTrigger (opcional)
export interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

const PopoverTrigger = React.forwardRef<HTMLDivElement, PopoverTriggerProps>(
  ({ children, className, asChild }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const childProps = children.props as { className?: string };
      return React.cloneElement(children, {
        ref,
        className: cn(className, childProps.className),
      } as any);
    }

    return (
      <div ref={ref} className={cn('inline-block', className)}>
        {children}
      </div>
    );
  }
);

PopoverTrigger.displayName = 'PopoverTrigger';

export { Popover, PopoverContent, PopoverTrigger };
