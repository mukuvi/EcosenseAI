import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { Card } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

const statuses = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
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
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Waste reports"
        description={`${total} report${total === 1 ? '' : 's'} in the queue. Filter by status to focus the work.`}
      >
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
      </PageHeader>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No reports match this filter"
            description="Try another status, or wait for new reports to arrive."
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
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
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
                  <TableCell className="text-right">
                    <Link
                      to={report.id}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
                    >
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
