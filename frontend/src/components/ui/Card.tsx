'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-2xl transition-all duration-200',
          paddingStyles[padding],
          variant === 'default' && 'bg-surface-800/60 border border-surface-700/50',
          variant === 'glass' && 'glass-card',
          variant === 'bordered' && 'bg-surface-800/40 border border-surface-600',
          hover && 'hover-lift cursor-pointer hover:border-primary-500/30',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
