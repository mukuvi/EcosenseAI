export default function StatCard({ title, value, color = 'bg-primary-600' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <span className={`ml-auto w-2.5 h-2.5 rounded-full ${color}`} />
    </div>
  );
}
