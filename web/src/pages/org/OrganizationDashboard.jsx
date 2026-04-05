import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/StatCard';

export default function OrganizationDashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/reports?limit=100');
        const all = data.reports;
        setStats({
          total: data.total,
          pending: all.filter((r) => r.status === 'pending').length,
          inProgress: all.filter((r) => r.status === 'in_progress').length,
          resolved: all.filter((r) => r.status === 'resolved').length,
        });
      } catch (err) {
        console.error('Failed to fetch organization dashboard data', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Organization Dashboard</h2>
      <p className="text-gray-500 mb-6">Welcome, {user?.full_name}. Monitor reports and hotspots in your coverage area.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Reports" value={stats.total} />
        <StatCard title="Pending" value={stats.pending} color="bg-sage-400" />
        <StatCard title="In Progress" value={stats.inProgress} color="bg-primary-500" />
        <StatCard title="Resolved" value={stats.resolved} color="bg-moss-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/org/reports"
          className="bg-primary-600 text-white rounded-xl p-6 hover:bg-primary-700 transition flex items-center gap-4"
        >
          <div>
            <h3 className="font-semibold text-lg">View Reports</h3>
            <p className="text-primary-100 text-sm">Track, review, and coordinate clean-up activity</p>
          </div>
        </Link>
        <Link
          to="/org/hotspots"
          className="bg-white border-2 border-primary-200 rounded-xl p-6 hover:border-primary-400 transition flex items-center gap-4"
        >
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Hotspots</h3>
            <p className="text-gray-500 text-sm">See AI-predicted accumulation areas</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-1">Access</h3>
        <p className="text-sm text-gray-500">Use the navigation to review reports and hotspots.</p>
      </div>
    </div>
  );
}
