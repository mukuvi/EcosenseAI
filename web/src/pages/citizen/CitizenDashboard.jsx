import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/StatCard';

export default function CitizenDashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ totalReports: 0, pendingReports: 0, resolvedReports: 0 });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/reports/mine?limit=5');
        const all = data.reports;
        setRecentReports(all);
        setStats({
          totalReports: data.total,
          pendingReports: all.filter((r) => r.status === 'pending').length,
          resolvedReports: all.filter((r) => r.status === 'resolved').length,
        });
      } catch (err) {
        console.error('Failed to fetch citizen dashboard data', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h2>
      <p className="text-gray-500 mb-6">Here's an overview of your contributions to a cleaner environment.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="My Reports" value={stats.totalReports} icon="📋" />
        <StatCard title="Pending" value={stats.pendingReports} icon="⏳" color="bg-yellow-500" />
        <StatCard title="Resolved" value={stats.resolvedReports} icon="✅" color="bg-green-500" />
        <StatCard title="My Points" value={user?.points_balance || 0} icon="⭐" color="bg-blue-500" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/citizen/report/new"
          className="bg-primary-600 text-white rounded-xl p-6 hover:bg-primary-700 transition flex items-center gap-4"
        >
          <span className="text-3xl">📸</span>
          <div>
            <h3 className="font-semibold text-lg">Report Waste</h3>
            <p className="text-primary-100 text-sm">Submit a new waste report and earn points</p>
          </div>
        </Link>
        <Link
          to="/citizen/rewards"
          className="bg-white border-2 border-primary-200 rounded-xl p-6 hover:border-primary-400 transition flex items-center gap-4"
        >
          <span className="text-3xl">🎁</span>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Redeem Rewards</h3>
            <p className="text-gray-500 text-sm">Use your {user?.points_balance || 0} points to claim rewards</p>
          </div>
        </Link>
      </div>

      {/* Recent reports */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Recent Reports</h3>
          <Link to="/citizen/reports" className="text-primary-600 text-sm hover:underline">View all</Link>
        </div>
        {recentReports.length === 0 ? (
          <p className="text-gray-400 text-center py-8">You haven't submitted any reports yet. Start by reporting waste in your area!</p>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <Link
                key={report.id}
                to={`/citizen/reports/${report.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {report.waste_type === 'plastic' ? '♻️' : report.waste_type === 'electronic' ? '🔌' : report.waste_type === 'hazardous' ? '☣️' : '🗑️'}
                  </span>
                  <div>
                    <p className="text-sm font-medium capitalize">{report.waste_type} waste</p>
                    <p className="text-xs text-gray-400">{report.address || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {report.status?.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
