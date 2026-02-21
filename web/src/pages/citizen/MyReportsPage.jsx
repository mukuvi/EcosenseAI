import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 20;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params = { page, limit };
        if (statusFilter) params.status = statusFilter;
        const { data } = await api.get('/reports/mine', { params });
        setReports(data.reports);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      }
    };
    fetchReports();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Reports</h2>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Link
            to="/citizen/report/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
          >
            + New Report
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Severity</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Points</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm capitalize">{report.waste_type}</td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">
                  {report.address || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}
                </td>
                <td className="px-6 py-4 text-sm capitalize">{report.severity}</td>
                <td className="px-6 py-4"><StatusBadge status={report.status} /></td>
                <td className="px-6 py-4 text-sm text-primary-600 font-medium">+{report.points_awarded}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Link to={`/citizen/reports/${report.id}`} className="text-primary-600 hover:underline text-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                  No reports found. <Link to="/citizen/report/new" className="text-primary-600 hover:underline">Submit your first report</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
