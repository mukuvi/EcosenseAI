import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(({ data }) => setReport(data.report))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await api.patch(`/reports/${id}/status`, { status: newStatus });
      setReport(data.report);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (!report) return <p className="text-red-500">Report not found</p>;

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Report Details</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Report ID</p>
            <p className="font-mono text-sm">{report.id}</p>
          </div>
          <StatusBadge status={report.status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Location</p>
            <p>{report.address || `${report.latitude}, ${report.longitude}`}</p>
          </div>
          <div>
            <p className="text-gray-500">Waste Type</p>
            <p className="capitalize">{report.waste_type}</p>
          </div>
          <div>
            <p className="text-gray-500">Severity</p>
            <p className="capitalize">{report.severity}</p>
          </div>
          <div>
            <p className="text-gray-500">Points Awarded</p>
            <p>{report.points_awarded}</p>
          </div>
          <div>
            <p className="text-gray-500">AI Classification</p>
            <p>{report.ai_waste_type || 'Pending'} {report.ai_confidence ? `(${(report.ai_confidence * 100).toFixed(1)}%)` : ''}</p>
          </div>
          <div>
            <p className="text-gray-500">Reported At</p>
            <p>{new Date(report.created_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Description */}
        {report.description && (
          <div>
            <p className="text-gray-500 text-sm mb-1">Description</p>
            <p className="text-sm">{report.description}</p>
          </div>
        )}

        {/* Images */}
        {report.image_urls?.length > 0 && (
          <div>
            <p className="text-gray-500 text-sm mb-2">Images</p>
            <div className="flex gap-3 flex-wrap">
              {report.image_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Waste report ${i + 1}`}
                  className="w-40 h-40 object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>
        )}

        {/* Status actions */}
        <div>
          <p className="text-gray-500 text-sm mb-2">Update Status</p>
          <div className="flex gap-2 flex-wrap">
            {['verified', 'assigned', 'in_progress', 'resolved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={report.status === s}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition disabled:opacity-30 capitalize"
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
