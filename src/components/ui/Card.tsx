import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      variant = 'default',
      padding = 'md',
      animate = true,
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'card';
    const variantClasses = {
      default: '',
      hover: 'card-hover',
      glass: 'glass',
      gradient: 'gradient-primary text-white',
    };
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    const classes = [
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      hover ? 'hover:shadow-medium hover:-translate-y-1 transition-all duration-300' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={classes}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
