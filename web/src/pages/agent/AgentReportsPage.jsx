import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function AgentReportsPage() {
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
        const { data } = await api.get('/reports', { params });
        setReports(data.reports);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      }
    };
    fetchReports();
  }, [page, statusFilter]);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const { data } = await api.patch(`/reports/${reportId}/status`, { status: newStatus });
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, ...data.report } : r)));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Waste Reports</h2>
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
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="px-6 py-3">Reporter</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Severity</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm">{report.reporter_name}</td>
                <td className="px-6 py-4 text-sm capitalize">{report.waste_type}</td>
                <td className="px-6 py-4 text-sm capitalize">{report.severity}</td>
                <td className="px-6 py-4"><StatusBadge status={report.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/agent/reports/${report.id}`} className="text-primary-600 hover:underline text-sm">
                      View
                    </Link>
                    {report.status === 'verified' && (
                      <button
                        onClick={() => handleStatusChange(report.id, 'assigned')}
                        className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                      >
                        Assign
                      </button>
                    )}
                    {report.status === 'assigned' && (
                      <button
                        onClick={() => handleStatusChange(report.id, 'in_progress')}
                        className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
                      >
                        Start
                      </button>
                    )}
                    {report.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(report.id, 'resolved')}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">No reports found</td>
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
