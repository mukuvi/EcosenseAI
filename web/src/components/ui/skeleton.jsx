import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-xl bg-ink/[0.07]', className)} {...props} />;
}
