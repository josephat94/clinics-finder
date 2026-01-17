'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover } from './popover';
import { ListItem } from './list-item';
import { FaChevronDown } from 'react-icons/fa';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      error = false,
      label,
      helperText,
      errorText,
      placeholder = 'Selecciona una opción',
      disabled = false,
      className,
      id,
      name,
      required,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
    const [isOpen, setIsOpen] = useState(false);
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const isControlled = controlledValue !== undefined;
    const selectedValue = isControlled ? controlledValue : uncontrolledValue;

    const selectedOption = options?.find((opt) => opt.value === selectedValue);

    const handleSelect = (optionValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(optionValue);
      }
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const baseStyles =
      'flex w-full items-center justify-between rounded-lg border bg-white dark:bg-zinc-900 px-3 py-2 text-base text-black dark:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const stateStyles = error
      ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-500'
      : 'border-zinc-300 focus-visible:ring-black dark:border-zinc-700 dark:focus-visible:ring-white';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium mb-1.5 text-zinc-900 dark:text-zinc-100"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Popover
        content={
          <div>
          {options?.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              No hay opciones disponibles
            </div>
          ) : (
            options?.map((option) => (
              <ListItem
                key={option.value}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                className={cn(
                  selectedValue === option.value &&
                    'bg-zinc-100 dark:bg-zinc-800 font-medium'
                )}
                role="option"
                aria-selected={selectedValue === option.value}
              >
                {option.label}
              </ListItem>
            ))
          )}
        </div>
        }
        className='w-full'
        
          open={isOpen}
          onOpenChange={setIsOpen}
          placement="bottom-start"
          contentClassName="p-2 min-w-[200px] max-h-[400px] overflow-y-auto max-w-[300px]"
          trigger="click"
        >
          <button
            ref={ref}
            id={selectId}
            type="button"
            name={name}
            disabled={disabled}
            className={cn(
              baseStyles,
              stateStyles,
              isOpen && 'ring-2 ring-offset-2',
              className
            )}
            aria-invalid={error}
            aria-describedby={
              error && errorText
                ? `${selectId}-error`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            {...props}
          >
            <span className={cn('flex-1 text-left', !selectedOption && 'text-zinc-500 dark:text-zinc-400')}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <FaChevronDown
              className={cn(
                'w-4 h-4 flex-shrink-0 ml-2 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </button>
       
        </Popover>
        {error && errorText && (
          <p
            id={`${selectId}-error`}
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {errorText}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${selectId}-helper`}
            className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400"
          >
            {helperText}
          </p>
        )}
        {/* Hidden input para formularios */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={selectedValue}
            required={required}
          />
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
