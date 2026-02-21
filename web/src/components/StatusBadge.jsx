const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}
