import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  pulse?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      animate = true,
      pulse = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'badge';
    const variantClasses = {
      primary: 'badge-primary',
      secondary: 'badge bg-secondary-100 text-secondary-800',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
      info: 'badge bg-primary-100 text-primary-800',
    };
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      pulse ? 'animate-pulse-soft' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if (animate) {
      return (
        <motion.span
          ref={ref}
          className={classes}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, type: 'spring', damping: 15 }}
          {...(props as any)}
        >
          {children}
        </motion.span>
      );
    }

    return (
      <span ref={ref} className={classes} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
