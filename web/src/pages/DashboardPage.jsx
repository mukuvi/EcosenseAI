import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';

const WASTE_COLORS = {
  plastic: '#2F5D50',
  organic: '#6B8E23',
  electronic: '#9CAF88',
  hazardous: '#264B41',
  construction: '#3f4b35',
  medical: '#556548',
  textile: '#6c7f5c',
  mixed: '#475569',
  other: '#64748b',
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, users: 0 });
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, usersRes] = await Promise.all([
          api.get('/reports?limit=100'),
          api.get('/users?limit=1'),
        ]);

        const all = reportsRes.data.reports;
        setReports(all);
        setStats({
          total: reportsRes.data.total,
          pending: all.filter((r) => r.status === 'pending').length,
          resolved: all.filter((r) => r.status === 'resolved').length,
          users: usersRes.data.total,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchData();
  }, []);

  const wasteTypeCounts = reports.reduce((acc, r) => {
    acc[r.waste_type] = (acc[r.waste_type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(wasteTypeCounts).map(([name, value]) => ({ name, value }));

  const severityCounts = reports.reduce((acc, r) => {
    acc[r.severity] = (acc[r.severity] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(severityCounts).map(([name, count]) => ({ name, count }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Reports" value={stats.total} />
        <StatCard title="Pending" value={stats.pending} color="bg-sage-400" />
        <StatCard title="Resolved" value={stats.resolved} color="bg-moss-600" />
        <StatCard title="Users" value={stats.users} color="bg-primary-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Waste Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={WASTE_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Reports by Severity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2F5D50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
