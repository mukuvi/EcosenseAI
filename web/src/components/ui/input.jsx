import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, type = 'text', invalid, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    aria-invalid={invalid || undefined}
    className={cn(
      'h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink transition placeholder:text-ink/35 focus-visible:border-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/10 disabled:cursor-not-allowed disabled:opacity-50',
      invalid && 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/10',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input };
