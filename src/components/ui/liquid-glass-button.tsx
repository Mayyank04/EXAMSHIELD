import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils.ts';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]',
        destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:scale-[0.98]',
        outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 active:scale-[0.98]',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98]',
        ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
        link: 'text-indigo-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-[11px]',
        lg: 'h-11 rounded-2xl px-6 text-sm',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// Liquid Button Variants for Special Primary Actions
const liquidbuttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 overflow-hidden cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md hover:shadow-indigo-500/25 hover:brightness-105 active:scale-[0.98]',
        violet:
          'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-purple-500/25 hover:brightness-105 active:scale-[0.98]',
        emerald:
          'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:shadow-emerald-500/25 hover:brightness-105 active:scale-[0.98]',
        danger:
          'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md hover:shadow-rose-500/25 hover:brightness-105 active:scale-[0.98]',
        neutral:
          'bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.98]',
        outline:
          'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm active:scale-[0.98]',
      },
      size: {
        default: 'h-9 px-4 py-2 text-xs rounded-xl',
        sm: 'h-8 px-3 py-1 text-[11px] rounded-lg',
        lg: 'h-11 px-6 py-2.5 text-sm rounded-2xl',
        icon: 'h-9 w-9 p-0 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(liquidbuttonVariants({ variant, size }), className)}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
LiquidButton.displayName = 'LiquidButton';

// Clean Crisp Enterprise Button (MetalButton fallback)
interface MetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const MetalButton = React.forwardRef<HTMLButtonElement, MetalButtonProps>(
  ({ className, size = 'default', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 shadow-sm rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]',
          size === 'sm' && 'h-8 px-3 text-[11px] rounded-lg',
          size === 'default' && 'h-9 px-4 text-xs rounded-xl',
          size === 'lg' && 'h-11 px-6 text-sm rounded-2xl',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
MetalButton.displayName = 'MetalButton';

export {
  Button,
  buttonVariants,
  liquidbuttonVariants,
  LiquidButton,
  MetalButton,
};
