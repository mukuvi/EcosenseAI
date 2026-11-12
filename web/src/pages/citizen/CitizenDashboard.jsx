import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, CheckCircle2, ClipboardList, Clock, Gift, Trophy } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

export default function CitizenDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports/mine?limit=5')
      .then(({ data }) => {
        setRecent(data.reports);
        setStats({
          total: data.total,
          pending: data.reports.filter((report) => report.status === 'pending').length,
          resolved: data.reports.filter((report) => report.status === 'resolved').length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div>
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">Citizen portal</p>
        <h1 className="mt-2 font-display text-[clamp(1.6rem,2.8vw,2.1rem)] font-semibold leading-tight">
          Hello, {firstName}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          Track what you reported and see the difference it makes on your street.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[116px]" />)
        ) : (
          <>
            <StatCard title="My reports" value={stats.total} icon={ClipboardList} hint="Submitted in total" />
            <StatCard title="Pending" value={stats.pending} icon={Clock} tone="amber" hint="Waiting for review" />
            <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} tone="emerald" hint="Cleaned up" />
            <StatCard title="My points" value={user?.points_balance || 0} icon={Trophy} tone="sky" hint="Redeemable now" />
          </>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Link to="/citizen/report/new" className="group">
          <div className="rounded-xl border border-line bg-white p-6 transition group-hover:border-ink/30">
            <span className="text-ink/50">
              <Camera className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">Report waste</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Add a photo and a location, and the right team gets it.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink/50">
              Start a report
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        <Link to="/citizen/rewards" className="group">
          <div className="h-full rounded-2xl border border-ink/10 bg-white p-6 transition group-hover:border-primary-200 group-hover:shadow-soft">
            <span className="text-ink/45">
              <Gift className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">Redeem rewards</h2>
            <p className="mt-1 text-sm text-ink-muted">
              You have {user?.points_balance || 0} points. Spend them on published rewards.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700">
              Browse rewards
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>

      <Card className="mt-5 overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent reports</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/citizen/reports">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={Camera}
              title="No reports yet"
              description="Report a site in your neighbourhood and follow it through to cleanup."
              action={
                <Button asChild>
                  <Link to="/citizen/report/new">Report waste</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-ink/[0.06]">
              {recent.map((report) => (
                <li key={report.id}>
                  <Link
                    to={`/citizen/reports/${report.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 transition hover:opacity-80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium capitalize">{report.waste_type} waste</p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">
                        {report.address || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={report.status} />
                      <span className="hidden text-xs text-ink-muted sm:block">
                        {new Date(report.created_at).toLocaleDateString(undefined, {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
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
