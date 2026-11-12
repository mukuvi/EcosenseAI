import { cn } from '../lib/utils';

export default function StatCard({ title, value, hint, icon: Icon, className }) {
  return (
    <div className={cn('rounded-xl border border-line bg-white p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-ink-muted">{title}</p>
          <p className="tabular mt-2 text-[28px] font-semibold leading-none tracking-tight">{value}</p>
          {hint && <p className="mt-2 text-xs text-ink-muted">{hint}</p>}
        </div>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-ink/30" strokeWidth={1.6} />}
      </div>
    </div>
  );
}
