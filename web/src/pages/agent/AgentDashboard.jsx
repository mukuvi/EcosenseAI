import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardList, Clock, Map } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

export default function AgentDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({ total: 0, assigned: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports?limit=100')
      .then(({ data }) => {
        const all = data.reports;
        setRecent(all.slice(0, 5));
        setStats({
          total: data.total,
          assigned: all.filter((report) => report.status === 'assigned').length,
          inProgress: all.filter((report) => report.status === 'in_progress').length,
          resolved: all.filter((report) => report.status === 'resolved').length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">Field operations</p>
        <h1 className="mt-2 font-display text-[clamp(1.6rem,2.8vw,2.1rem)] font-semibold leading-tight">
          {user?.full_name}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          Your assigned reports, and the ones waiting for a crew.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[116px]" />)
        ) : (
          <>
            <StatCard title="Total reports" value={stats.total} icon={ClipboardList} hint="In your area" />
            <StatCard title="Assigned" value={stats.assigned} icon={Clock} tone="amber" hint="Ready to start" />
            <StatCard title="In progress" value={stats.inProgress} icon={Map} tone="sky" hint="Crews on site" />
            <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} tone="emerald" hint="Closed this cycle" />
          </>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Link to="/agent/reports" className="group">
          <div className="rounded-xl border border-line bg-white p-6 transition group-hover:border-ink/30">
            <span className="text-ink/50">
              <ClipboardList className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">Work the queue</h2>
            <p className="mt-1 text-sm text-ink-muted">Start a job, update the status and close it out.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink/50">
              Open reports
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        <Link to="/agent/hotspots" className="group">
          <div className="h-full rounded-2xl border border-ink/10 bg-white p-6 transition group-hover:border-primary-200 group-hover:shadow-soft">
            <span className="text-ink/45">
              <Map className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">Hotspot map</h2>
            <p className="mt-1 text-sm text-ink-muted">See where reports cluster before the next round.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700">
              View map
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>

      <Card className="mt-5 overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent reports</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/agent/reports">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : recent.length === 0 ? (
            <EmptyState title="No reports yet" description="New assignments will show up here." />
          ) : (
            <ul className="divide-y divide-ink/[0.06]">
              {recent.map((report) => (
                <li key={report.id}>
                  <Link
                    to={`/agent/reports/${report.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 transition hover:opacity-80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium capitalize">
                        {report.waste_type} waste, {report.severity} severity
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">
                        {report.address || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
