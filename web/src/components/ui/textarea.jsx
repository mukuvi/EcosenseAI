import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      'min-h-[104px] w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm text-ink transition placeholder:text-ink/35 focus-visible:border-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/10 disabled:cursor-not-allowed disabled:opacity-50',
      invalid && 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/10',
      className
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

export { Textarea };
