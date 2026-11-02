import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';

export default function ReportDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioState, setAudioState] = useState('idle');
  const [audioError, setAudioError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [history, setHistory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);
  const canManage = ['admin', 'field_agent', 'organization'].includes(user?.role);
  const canAssign = ['admin', 'organization'].includes(user?.role);

  const fetchHistory = () =>
    api.get(`/reports/${id}/history`)
      .then(({ data }) => setHistory(data.history))
      .catch(console.error);

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(({ data }) => setReport(data.report))
      .catch(console.error)
      .finally(() => setLoading(false));
    fetchHistory();
  }, [id]);

  useEffect(() => {
    if (!canAssign) return;
    api.get('/users/field-agents')
      .then(({ data }) => setAgents(data.agents))
      .catch(console.error);
  }, [canAssign]);

  const handleStatusChange = async (newStatus) => {
    setStatusError('');
    try {
      await api.patch(`/reports/${id}/status`, { status: newStatus });
      const detail = await api.get(`/reports/${id}`);
      setReport(detail.data.report);
      fetchHistory();
    } catch (err) {
      setStatusError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent) return;
    setAssignError('');
    setAssigning(true);
    try {
      const { data } = await api.patch(`/reports/${id}/assign`, { assigned_to: selectedAgent });
      setReport(data.report);
      setSelectedAgent('');
      fetchHistory();
    } catch (err) {
      setAssignError(err.response?.data?.error || 'Failed to assign report');
    } finally {
      setAssigning(false);
    }
  };

  const handleListen = async () => {
    setAudioError('');
    setAudioState('loading');
    try {
      const { data } = await api.get(`/reports/${id}/audio`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setAudioState('idle');
      };
      await audio.play();
      setAudioState('playing');
    } catch (err) {
      setAudioError(err.response?.status === 503 ? 'Voice playback is not configured' : 'Could not load audio');
      setAudioState('idle');
    }
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (!report) return <p className="text-red-500">Report not found</p>;

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Report Details</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Report ID</p>
            <p className="font-mono text-sm">{report.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleListen}
              disabled={audioState === 'loading'}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition disabled:opacity-30"
            >
              {audioState === 'loading' ? 'Loading audio...' : 'Listen to update'}
            </button>
            <StatusBadge status={report.status} />
          </div>
        </div>

        {audioError && <p className="text-sm text-red-500">{audioError}</p>}

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
            <p className="text-gray-500">Assigned To</p>
            <p>{report.assignment?.assigned_to_name || 'Unassigned'}</p>
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

        {report.description && (
          <div>
            <p className="text-gray-500 text-sm mb-1">Description</p>
            <p className="text-sm">{report.description}</p>
          </div>
        )}

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

        {canAssign && (
          <div>
            <p className="text-gray-500 text-sm mb-2">Assign to a field agent</p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select a field agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name} ({agent.email})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!selectedAgent || assigning}
                className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
            {report.assignment && (
              <p className="text-xs text-gray-500 mt-2">
                Currently assigned to {report.assignment.assigned_to_name}
              </p>
            )}
            {assignError && <p className="text-sm text-red-500 mt-2">{assignError}</p>}
          </div>
        )}

        {canManage && (
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
            {statusError && <p className="text-sm text-red-500 mt-2">{statusError}</p>}
          </div>
        )}

        <div>
          <p className="text-gray-500 text-sm mb-3">Status history</p>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">No status changes recorded yet.</p>
          ) : (
            <ol className="space-y-3">
              {history.map((entry) => (
                <li key={entry.id} className="flex gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {entry.from_status ? `${entry.from_status.replace('_', ' ')} to ` : ''}
                      {entry.to_status.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.changed_by_name || 'System'}, {new Date(entry.created_at).toLocaleString()}
                      {entry.note ? `, ${entry.note}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
