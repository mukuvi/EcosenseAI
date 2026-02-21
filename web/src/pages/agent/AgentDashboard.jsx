import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/StatCard';

export default function AgentDashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, resolved: 0, total: 0 });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/reports?limit=100');
        const all = data.reports;
        setRecentReports(all.slice(0, 5));
        setStats({
          total: data.total,
          assigned: all.filter((r) => r.status === 'assigned').length,
          inProgress: all.filter((r) => r.status === 'in_progress').length,
          resolved: all.filter((r) => r.status === 'resolved').length,
        });
      } catch (err) {
        console.error('Failed to fetch agent dashboard data', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Agent Dashboard</h2>
      <p className="text-gray-500 mb-6">Welcome, {user?.full_name}. Here's your field operations overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Reports" value={stats.total} icon="📋" />
        <StatCard title="Assigned" value={stats.assigned} icon="📌" color="bg-purple-500" />
        <StatCard title="In Progress" value={stats.inProgress} icon="🔧" color="bg-orange-500" />
        <StatCard title="Resolved" value={stats.resolved} icon="✅" color="bg-green-500" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/agent/reports"
          className="bg-primary-600 text-white rounded-xl p-6 hover:bg-primary-700 transition flex items-center gap-4"
        >
          <span className="text-3xl">📋</span>
          <div>
            <h3 className="font-semibold text-lg">View Reports</h3>
            <p className="text-primary-100 text-sm">Review and update waste report statuses</p>
          </div>
        </Link>
        <Link
          to="/agent/hotspots"
          className="bg-white border-2 border-primary-200 rounded-xl p-6 hover:border-primary-400 transition flex items-center gap-4"
        >
          <span className="text-3xl">🔥</span>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Hotspot Map</h3>
            <p className="text-gray-500 text-sm">View AI-predicted waste accumulation areas</p>
          </div>
        </Link>
      </div>

      {/* Recent assigned reports */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Recent Reports</h3>
          <Link to="/agent/reports" className="text-primary-600 text-sm hover:underline">View all</Link>
        </div>
        {recentReports.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No reports to display.</p>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <Link
                key={report.id}
                to={`/agent/reports/${report.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    report.status === 'assigned' ? 'bg-purple-500' :
                    report.status === 'in_progress' ? 'bg-orange-500' :
                    report.status === 'resolved' ? 'bg-green-500' :
                    'bg-gray-300'
                  }`} />
                  <div>
                    <p className="text-sm font-medium capitalize">{report.waste_type} — {report.severity}</p>
                    <p className="text-xs text-gray-400">{report.address || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{report.status?.replace('_', ' ')}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
