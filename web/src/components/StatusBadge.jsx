const statusColors = {
  pending: 'bg-sage-50 text-ink border border-sage-200',
  verified: 'bg-primary-50 text-primary-800 border border-primary-200',
  assigned: 'bg-sage-100 text-ink border border-sage-200',
  in_progress: 'bg-primary-100 text-primary-900 border border-primary-200',
  resolved: 'bg-moss-50 text-ink border border-moss-200',
  rejected: 'bg-stone-100 text-ink border border-stone-200',
};

export default function StatusBadge({ status }) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}
