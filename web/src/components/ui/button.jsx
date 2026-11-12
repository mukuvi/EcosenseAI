import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default: 'bg-ink text-white hover:bg-primary-800',
        accent: 'bg-accent text-accent-ink hover:bg-[#B8E64F]',
        outline: 'border border-line bg-transparent text-ink hover:bg-ink/[0.04]',
        ghost: 'text-ink-muted hover:bg-ink/[0.05] hover:text-ink',
        light: 'bg-white text-ink hover:bg-primary-50',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-ink underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3.5 text-[13px]',
        default: 'h-10 px-5',
        lg: 'h-12 px-6 text-[15px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
