import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils.ts';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-500/40',
        destructive: 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500',
        outline: 'border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white',
        secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white',
        ghost: 'hover:bg-slate-800/80 text-slate-300 hover:text-white',
        link: 'text-blue-400 underline-offset-4 hover:underline',
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

// Liquid Button Variants
const liquidbuttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 backdrop-blur-xl overflow-hidden cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-blue-500/20 via-cyan-500/10 to-transparent border border-cyan-400/40 text-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.15)] hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(0,217,255,0.35)] hover:text-white',
        violet:
          'bg-gradient-to-b from-purple-500/20 via-indigo-500/10 to-transparent border border-purple-400/40 text-purple-300 shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:border-purple-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:text-white',
        emerald:
          'bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-400/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:text-white',
        danger:
          'bg-gradient-to-b from-rose-500/20 via-pink-500/10 to-transparent border border-rose-400/40 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-300 hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] hover:text-white',
        neutral:
          'bg-slate-900/60 border border-slate-700/80 text-slate-200 shadow-lg hover:border-slate-500 hover:bg-slate-800/80 hover:text-white',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-xl text-xs',
        sm: 'h-8 px-3 rounded-lg text-[11px]',
        lg: 'h-11 px-6 rounded-2xl text-sm font-semibold',
        icon: 'h-9 w-9 p-0 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  glowEffect?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, glowEffect = true, children, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        ref={ref as any}
        className={cn(liquidbuttonVariants({ variant, size, className }))}
        {...(props as any)}
      >
        {/* Inner Liquid Glass Light Reflection */}
        <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-75" />
        <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-transparent pointer-events-none" />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);
LiquidButton.displayName = 'LiquidButton';

// Metal Tactical Button
const MetalButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        ref={ref as any}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 px-4 py-2 text-xs font-bold text-slate-100 border border-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.5)] hover:from-slate-600 hover:via-slate-700 hover:to-slate-900 transition-all cursor-pointer select-none',
          size === 'sm' && 'h-8 px-3 text-[11px]',
          size === 'lg' && 'h-11 px-6 text-sm',
          className
        )}
        {...(props as any)}
      >
        <span className="absolute inset-x-0 top-0 h-[1px] bg-white/30" />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
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
