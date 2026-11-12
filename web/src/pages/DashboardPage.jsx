import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, Clock, ClipboardList, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import EmptyState from '../components/EmptyState';

const wasteColors = {
  plastic: '#33403A',
  organic: '#4F6157',
  electronic: '#6D7F74',
  hazardous: '#202925',
  construction: '#8B9A90',
  medical: '#A9B5AD',
  textile: '#C4EF5E',
  mixed: '#C9D2CB',
  other: '#E4E8E3',
};

const severityColors = {
  low: '#DDE3DC',
  medium: '#9AA79D',
  high: '#4F6157',
  critical: '#2A3530',
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, users: 0 });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reportsResponse, usersResponse] = await Promise.all([
          api.get('/reports?limit=100'),
          api.get('/users?limit=1'),
        ]);

        const all = reportsResponse.data.reports;
        setReports(all);
        setStats({
          total: reportsResponse.data.total,
          pending: all.filter((report) => report.status === 'pending').length,
          resolved: all.filter((report) => report.status === 'resolved').length,
          users: usersResponse.data.total,
        });
      } catch (err) {
        toast.error('Could not load the dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const wasteCounts = reports.reduce((accumulator, report) => {
    accumulator[report.waste_type] = (accumulator[report.waste_type] || 0) + 1;
    return accumulator;
  }, {});

  const pieData = Object.entries(wasteCounts).map(([name, value]) => ({ name, value }));

  const severityCounts = reports.reduce((accumulator, report) => {
    accumulator[report.severity] = (accumulator[report.severity] || 0) + 1;
    return accumulator;
  }, {});

  const barData = ['low', 'medium', 'high', 'critical']
    .filter((level) => severityCounts[level])
    .map((level) => ({ name: level, count: severityCounts[level] }));

  return (
    <div>
      <PageHeader
        title="Operations overview"
        description="Every report in your area, from the first photo to the verified cleanup."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[116px]" />)
          : [
              { title: 'Total reports', value: stats.total, icon: ClipboardList, tone: 'primary', hint: 'All time' },
              { title: 'Pending review', value: stats.pending, icon: Clock, tone: 'amber', hint: 'Waiting for triage' },
              { title: 'Resolved', value: stats.resolved, icon: CheckCircle2, tone: 'emerald', hint: 'Verified cleanups' },
              { title: 'People on the platform', value: stats.users, icon: Users, tone: 'sky', hint: 'All roles' },
            ].map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waste types</CardTitle>
            <p className="text-sm text-ink-muted">How reports are classified across the last 100 records.</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px]" />
            ) : pieData.length === 0 ? (
              <EmptyState title="No reports yet" description="Waste types appear once reports start arriving." />
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="h-[220px] w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={88}
                        paddingAngle={2}
                        stroke="none"
                        animationDuration={700}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={wasteColors[entry.name] || '#C7D3CB'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid rgba(16,26,22,0.1)',
                          fontSize: 12,
                          boxShadow: '0 12px 32px -18px rgba(16,26,22,0.25)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="w-full space-y-2.5 sm:w-1/2">
                  {pieData.map((entry) => (
                    <li key={entry.name} className="flex items-center gap-2.5 text-sm">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: wasteColors[entry.name] || '#C7D3CB' }}
                      />
                      <span className="flex-1 capitalize text-ink">{entry.name}</span>
                      <span className="font-medium text-ink-muted">{entry.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity breakdown</CardTitle>
            <p className="text-sm text-ink-muted">Where the pressure is in the current queue.</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px]" />
            ) : barData.length === 0 ? (
              <EmptyState title="Nothing to chart yet" description="Severity levels appear with the first report." />
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 6" stroke="rgba(16,26,22,0.08)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: '#5C6B63' }}
                      tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: '#5C6B63' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(46,139,87,0.06)' }}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid rgba(16,26,22,0.1)',
                        fontSize: 12,
                        boxShadow: '0 12px 32px -18px rgba(16,26,22,0.25)',
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={64} animationDuration={700}>
                      {barData.map((entry) => (
                        <Cell key={entry.name} fill={severityColors[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
