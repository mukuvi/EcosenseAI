import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

const statusOptions = ['verified', 'assigned', 'in_progress', 'resolved', 'rejected'];

const backLinks = {
  admin: '/admin/reports',
  organization: '/org/reports',
  field_agent: '/agent/reports',
  citizen: '/citizen/reports',
};

export default function ReportDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioState, setAudioState] = useState('idle');
  const [history, setHistory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState('');

  const canManage = ['admin', 'field_agent', 'organization'].includes(user?.role);
  const canAssign = ['admin', 'organization'].includes(user?.role);
  const backTo = backLinks[user?.role] || '/citizen/reports';

  const loadHistory = () =>
    api
      .get(`/reports/${id}/history`)
      .then(({ data }) => setHistory(data.history))
      .catch(() => {});

  useEffect(() => {
    api
      .get(`/reports/${id}`)
      .then(({ data }) => setReport(data.report))
      .catch(() => toast.error('Could not load this report'))
      .finally(() => setLoading(false));
    loadHistory();
  }, [id]);

  useEffect(() => {
    if (!canAssign) return;
    api
      .get('/users/field-agents')
      .then(({ data }) => setAgents(data.agents))
      .catch(() => {});
  }, [canAssign]);

  const handleStatusChange = async (status) => {
    setUpdatingStatus(status);
    try {
      await api.patch(`/reports/${id}/status`, { status });
      const { data } = await api.get(`/reports/${id}`);
      setReport(data.report);
      loadHistory();
      toast.success(`Status moved to ${status.replace('_', ' ')}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update the status');
    } finally {
      setUpdatingStatus('');
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent) return;
    setAssigning(true);
    try {
      const { data } = await api.patch(`/reports/${id}/assign`, { assigned_to: selectedAgent });
      setReport(data.report);
      setSelectedAgent('');
      loadHistory();
      toast.success('Report assigned to the field agent');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Could not assign the report');
    } finally {
      setAssigning(false);
    }
  };

  const handleListen = async () => {
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
      setAudioState('idle');
      toast.error(err.response?.status === 503 ? 'Voice playback is not configured' : 'Could not load the audio summary');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-10 text-center">
        <p className="font-display text-lg font-semibold">Report not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={backTo}>Back to reports</Link>
        </Button>
      </div>
    );
  }

  const details = [
    { label: 'Waste type', value: report.waste_type, capitalize: true },
    { label: 'Severity', value: report.severity, capitalize: true },
    { label: 'Points awarded', value: report.points_awarded },
    { label: 'Assigned to', value: report.assignment?.assigned_to_name || 'Unassigned' },
    {
      label: 'Classification',
      value: report.ai_waste_type
        ? `${report.ai_waste_type}${report.ai_confidence ? ` at ${(report.ai_confidence * 100).toFixed(0)}%` : ''}`
        : 'Pending',
    },
    { label: 'Reported', value: new Date(report.created_at).toLocaleString() },
  ];

  return (
    <div>
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to reports
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold capitalize">
              {report.waste_type} waste report
            </h1>
            <StatusBadge status={report.status} />
          </div>
          <p className="mt-1 font-mono text-xs text-ink-muted">{report.id}</p>
        </div>
        <Button variant="outline" onClick={handleListen} disabled={audioState === 'loading'}>
          {audioState === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          {audioState === 'playing' ? 'Playing summary' : 'Listen to summary'}
        </Button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Report details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {details.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{item.label}</dt>
                    <dd className={cn('mt-1 text-sm text-ink', item.capitalize && 'capitalize')}>{item.value}</dd>
                  </div>
                ))}
              </dl>

              <Separator className="my-6" />

              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Location</p>
                  <p className="mt-1 text-sm">
                    {report.address || `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
                  </p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=17/${report.latitude}/${report.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-primary-700 hover:underline"
                  >
                    Open on the map
                  </a>
                </div>
              </div>

              {report.description && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Description</p>
                    <p className="mt-1.5 text-sm leading-relaxed">{report.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {report.image_urls?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {report.image_urls.map((url, index) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-xl border border-ink/10"
                    >
                      <img
                        src={url}
                        alt={`Waste report ${index + 1}`}
                        className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <p className="text-sm text-ink-muted">Move the report through the cleanup stages.</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={report.status === status ? 'secondary' : 'outline'}
                    className="w-full justify-between capitalize"
                    onClick={() => handleStatusChange(status)}
                    disabled={report.status === status || Boolean(updatingStatus)}
                  >
                    {status.replace('_', ' ')}
                    {updatingStatus === status && <Loader2 className="h-4 w-4 animate-spin" />}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {canAssign && (
            <Card>
              <CardHeader>
                <CardTitle>Field agent</CardTitle>
                <p className="text-sm text-ink-muted">
                  {report.assignment
                    ? `Currently with ${report.assignment.assigned_to_name}`
                    : 'No agent assigned yet'}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={selectedAgent}
                  onChange={(event) => setSelectedAgent(event.target.value)}
                  aria-label="Select a field agent"
                >
                  <option value="">Select a field agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name}
                    </option>
                  ))}
                </Select>
                <Button className="w-full" onClick={handleAssign} disabled={!selectedAgent || assigning}>
                  {assigning && <Loader2 className="h-4 w-4 animate-spin" />}
                  {assigning ? 'Assigning' : 'Assign report'}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-ink-muted">No status changes recorded yet.</p>
              ) : (
                <ol className="relative space-y-5 border-l border-ink/10 pl-5">
                  {history.map((entry) => (
                    <li key={entry.id} className="relative">
                      <span className="absolute -left-[25px] top-1 grid h-2.5 w-2.5 place-items-center rounded-full border-2 border-white bg-primary-500" />
                      <p className="text-sm font-medium capitalize">
                        {entry.from_status ? `${entry.from_status.replace('_', ' ')} to ` : ''}
                        {entry.to_status.replace('_', ' ')}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {entry.changed_by_name || 'System'} on {new Date(entry.created_at).toLocaleString()}
                      </p>
                      {entry.note && <p className="mt-1 text-xs text-ink-muted">{entry.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
