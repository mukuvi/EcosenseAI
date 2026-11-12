const statusMap = {
  pending: { label: 'Pending', className: 'border-amber-200 bg-amber-50 text-amber-800' },
  verified: { label: 'Verified', className: 'border-line bg-primary-50 text-primary-700' },
  assigned: { label: 'Assigned', className: 'border-sky-200 bg-sky-50 text-sky-800' },
  in_progress: { label: 'In progress', className: 'border-primary-200 bg-primary-100 text-primary-800' },
  resolved: { label: 'Resolved', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  rejected: { label: 'Rejected', className: 'border-red-200 bg-red-50 text-red-700' },
};

export default function StatusBadge({ status }) {
  const entry = statusMap[status] || { label: status || 'Unknown', className: 'border-line text-ink-muted' };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${entry.className}`}
    >
      {entry.label}
    </span>
  );
}
