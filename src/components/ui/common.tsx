import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon, Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer';

  const variants = {
    primary: 'bg-[#002147] text-white hover:bg-[#003366] focus:ring-[#002147] font-semibold shadow-xs',
    secondary: 'bg-[#F4F7F9] text-[#2D3748] hover:bg-slate-200 border border-gray-200 focus:ring-slate-400',
    outline: 'border border-gray-300 text-[#2D3748] bg-white hover:bg-gray-50 focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-[#2D3748] hover:bg-gray-100 hover:text-[#002147] focus:ring-slate-300',
    gold: 'bg-[#D4AF37] text-[#002147] font-bold hover:bg-[#C49F27] focus:ring-[#D4AF37] shadow-xs hover:shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs font-bold gap-2',
    lg: 'px-6 py-3 text-sm font-bold gap-2.5',
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
      {!isLoading && LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />}
      {children}
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'institutional';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'bordered',
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    bordered: 'bg-white border border-gray-200 shadow-sm',
    institutional: 'bg-white border border-gray-200 shadow-sm border-t-4 border-t-[#002147]',
  };

  return (
    <div className={cn('rounded-lg p-5 sm:p-6 text-[#2D3748]', variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'gold';
  className?: string;
}> = ({ children, variant = 'neutral', className }) => {
  const variants = {
    neutral: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gold: 'bg-amber-100 text-[#002147] border border-amber-300 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { label: string; positive?: boolean };
  className?: string;
}> = ({ title, value, subtitle, icon: Icon, trend, className }) => {
  return (
    <div className={cn('bg-white p-5 rounded-lg border border-gray-200 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</span>
        <div className="p-2 bg-[#F4F7F9] text-[#002147] rounded-md">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#002147] tracking-tight">{value}</span>
          {trend && (
            <span
              className={cn(
                'text-xs font-bold',
                trend.positive ? 'text-green-500' : 'text-gray-400'
              )}
            >
              {trend.label}
            </span>
          )}
        </div>
        {subtitle && <p className="text-[11px] text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 my-4">
      <div className="p-3 bg-white text-slate-400 rounded-full shadow-xs border border-slate-200 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading university records...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <Loader2 className="w-8 h-8 text-[#0F2137] animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl border border-gray-200 w-full overflow-hidden my-8',
          maxWidth
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#002147] text-white">
          <h3 className="font-bold text-sm sm:text-base tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-lg font-bold leading-none p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

