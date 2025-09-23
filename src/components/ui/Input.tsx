import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      size = 'md',
      animate = true,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const baseClasses = 'input';
    const variantClasses = {
      default: '',
      filled: 'bg-secondary-50 border-secondary-200 focus:bg-white',
      outlined: 'border-2 border-secondary-300 focus:border-primary-500',
    };
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-sm',
      lg: 'px-4 py-4 text-base',
    };

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      error ? 'input-error' : '',
      leftIcon ? 'pl-10' : '',
      (rightIcon || isPassword) ? 'pr-10' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={classes}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        
        {rightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
            {rightIcon}
          </div>
        )}
      </div>
    );

    const content = (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
          </label>
        )}
        
        {animate ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {inputElement}
          </motion.div>
        ) : (
          inputElement
        )}
        
        {(error || helperText) && (
          <motion.div
            className="mt-2 flex items-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error && (
              <>
                <AlertCircle className="w-4 h-4 text-error-500 mr-1" />
                <span className="text-sm text-error-600">{error}</span>
              </>
            )}
            {!error && helperText && (
              <span className="text-sm text-secondary-500">{helperText}</span>
            )}
          </motion.div>
        )}
      </div>
    );

    return content;
  }
);

Input.displayName = 'Input';

export default Input;
