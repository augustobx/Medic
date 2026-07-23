'use client';

import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-700 text-surface-300 border-surface-600',
  primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
  success: 'bg-success-500/20 text-success-400 border-success-500/30',
  warning: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
  danger: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
  accent: 'bg-accent-500/20 text-accent-400 border-accent-500/30',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-400',
  primary: 'bg-primary-400',
  success: 'bg-success-400',
  warning: 'bg-warning-400',
  danger: 'bg-danger-400',
  accent: 'bg-accent-400',
};

export default function Badge({ variant = 'default', children, className, dot }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className,
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotStyles[variant])} />}
      {children}
    </span>
  );
}
