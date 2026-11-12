import { cn } from '../lib/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      {Icon && <Icon className="h-6 w-6 text-ink/25" strokeWidth={1.5} />}
      <p className="mt-4 text-[15px] font-medium">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
