'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow-primary hover:from-primary-400 hover:to-primary-500 active:from-primary-600 active:to-primary-700',
  secondary:
    'bg-surface-700 text-surface-200 border border-surface-600 hover:bg-surface-600 hover:border-surface-500 active:bg-surface-800',
  ghost:
    'bg-transparent text-surface-300 hover:bg-surface-800 hover:text-surface-100 active:bg-surface-700',
  danger:
    'bg-danger-500/20 text-danger-400 border border-danger-500/30 hover:bg-danger-500/30 hover:text-danger-300 active:bg-danger-500/40',
  success:
    'bg-success-500/20 text-success-400 border border-success-500/30 hover:bg-success-500/30 hover:text-success-300 active:bg-success-500/40',
  warning:
    'bg-warning-500/20 text-warning-400 border border-warning-500/30 hover:bg-warning-500/30 hover:text-warning-300 active:bg-warning-500/40',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
          'hover:-translate-y-0.5 active:translate-y-0',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
