import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-ink text-white',
        soft: 'border-line bg-primary-50 text-primary-700',
        outline: 'border-line text-ink-muted',
        neutral: 'border-line bg-transparent text-ink-muted',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        info: 'border-sky-200 bg-sky-50 text-sky-800',
        danger: 'border-red-200 bg-red-50 text-red-700',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        accent: 'border-transparent bg-accent text-accent-ink',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
