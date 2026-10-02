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
  popoverZIndex?: number;
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
      popoverZIndex,
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
      'glass-field flex w-full min-h-11 items-center justify-between rounded-2xl border border-transparent px-3 py-2 text-base text-hub-fg transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 focus-visible:ring-offset-hub-bg disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer';

    const stateStyles = error
      ? 'ring-2 ring-hub-danger'
      : '';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium mb-1.5 text-hub-fg"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Popover
        content={
          <div>
          {options?.length === 0 ? (
            <div className="px-3 py-2 text-sm text-hub-muted">
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
                    !option.disabled &&
                    'bg-[#fef3c7] font-medium',
                  option.disabled && 'line-through'
                )}
                role="option"
                aria-selected={selectedValue === option.value}
                aria-disabled={option.disabled}
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
          zIndex={popoverZIndex}
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
            <span className={cn('flex-1 text-left', !selectedOption && 'text-hub-muted')}>
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
            className="mt-1.5 text-sm text-hub-danger"
            role="alert"
          >
            {errorText}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${selectId}-helper`}
            className="mt-1.5 text-sm text-hub-muted"
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
