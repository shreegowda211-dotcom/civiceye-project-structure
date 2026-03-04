import React from 'react';

// basic button variants
export function Button({ children, variant = 'default', size = 'md', className = '', ...props }) {
  const variantStyles = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    civic: 'bg-emerald-500 text-white hover:bg-emerald-600',
    ghost: 'bg-transparent text-slate-900 hover:bg-slate-100',
  };
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
