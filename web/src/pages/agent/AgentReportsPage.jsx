import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ClipboardList, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { cn } from '../../lib/utils';

const statuses = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const nextAction = {
  verified: { label: 'Assign', status: 'assigned' },
  assigned: { label: 'Start', status: 'in_progress' },
  in_progress: { label: 'Resolve', status: 'resolved' },
};

export default function AgentReportsPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [scope, setScope] = useState('mine');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const limit = 20;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (scope === 'mine') {
          const { data } = await api.get('/reports/assigned');
          setReports(data.reports);
          setTotal(data.total);
          return;
        }

        const params = { page, limit };
        if (statusFilter) params.status = statusFilter;
        const { data } = await api.get('/reports', { params });
        setReports(data.reports);
        setTotal(data.total);
      } catch (err) {
        toast.error('Could not load reports');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, statusFilter, scope]);

  const handleStatusChange = async (reportId, status) => {
    setBusy(reportId);
    try {
      const { data } = await api.patch(`/reports/${reportId}/status`, { status });

      if (scope === 'mine' && status === 'resolved') {
        setReports((previous) => previous.filter((report) => report.id !== reportId));
        setTotal((value) => Math.max(0, value - 1));
      } else {
        setReports((previous) =>
          previous.map((report) => (report.id === reportId ? { ...report, ...data.report } : report))
        );
      }

      toast.success(`Report moved to ${status.replace('_', ' ')}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update the status');
    } finally {
      setBusy('');
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Start, progress and close the jobs assigned to you."
      >
        <div className="inline-flex rounded-xl border border-ink/15 bg-white p-1">
          {[
            { value: 'mine', label: 'Assigned to me' },
            { value: 'all', label: 'All reports' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setScope(option.value);
                setPage(1);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[13px] font-medium transition',
                scope === option.value ? 'bg-primary-600 text-white' : 'text-ink-muted hover:text-ink'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {scope === 'all' && (
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="w-44"
            aria-label="Filter by status"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        )}
      </PageHeader>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={scope === 'mine' ? 'No jobs assigned to you' : 'No reports match this filter'}
            description={
              scope === 'mine'
                ? 'When an agency assigns a report to you, it will appear here.'
                : 'Try another status to see more reports.'
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Reporter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const action = nextAction[report.status];
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.reporter_name}</TableCell>
                    <TableCell className="capitalize text-ink-muted">{report.waste_type}</TableCell>
                    <TableCell className="capitalize text-ink-muted">{report.severity}</TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell className="text-ink-muted">
                      {new Date(report.created_at).toLocaleDateString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {action && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleStatusChange(report.id, action.status)}
                            disabled={busy === report.id}
                          >
                            {busy === report.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {action.label}
                          </Button>
                        )}
                        <Link
                          to={`/agent/reports/${report.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
                        >
                          Open
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {scope === 'all' && <Pagination page={page} totalPages={Math.ceil(total / limit)} onChange={setPage} />}
    </div>
  );
}
