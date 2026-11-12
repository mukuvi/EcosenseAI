import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Camera, FileText } from 'lucide-react';
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

const statuses = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function MyReportsPage() {
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
        const { data } = await api.get('/reports/mine', { params });
        setReports(data.reports);
        setTotal(data.total);
      } catch (err) {
        toast.error('Could not load your reports');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, statusFilter]);

  return (
    <div>
      <PageHeader
        title="My reports"
        description="Everything you have reported, with the current stage of each cleanup."
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
        <Button asChild>
          <Link to="/citizen/report/new">
            <Camera className="h-4 w-4" />
            New report
          </Link>
        </Button>
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
            icon={FileText}
            title="No reports here yet"
            description="Submit your first report and it will appear in this list with its status."
            action={
              <Button asChild>
                <Link to="/citizen/report/new">Report waste</Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium capitalize">{report.waste_type}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-ink-muted">
                    {report.address || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}
                  </TableCell>
                  <TableCell className="capitalize text-ink-muted">{report.severity}</TableCell>
                  <TableCell>
                    <StatusBadge status={report.status} />
                  </TableCell>
                  <TableCell className="font-medium text-primary-700">+{report.points_awarded}</TableCell>
                  <TableCell className="text-ink-muted">
                    {new Date(report.created_at).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/citizen/reports/${report.id}`}
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

      <Pagination page={page} totalPages={Math.ceil(total / limit)} onChange={setPage} />
    </div>
  );
}
