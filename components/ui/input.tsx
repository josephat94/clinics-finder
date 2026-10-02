import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      error = false,
      label,
      helperText,
      errorText,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles =
      'glass-field flex w-full min-h-11 rounded-2xl border border-transparent px-3 py-2 text-base text-hub-fg transition-shadow duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-hub-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 focus-visible:ring-offset-hub-bg disabled:cursor-not-allowed disabled:opacity-50';

    const stateStyles = error
      ? 'ring-2 ring-hub-danger'
      : '';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-1.5 text-hub-fg"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={cn(baseStyles, stateStyles, className)}
          aria-invalid={error}
          aria-describedby={
            error && errorText
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        {error && errorText && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-hub-danger"
            role="alert"
          >
            {errorText}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-hub-muted"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
