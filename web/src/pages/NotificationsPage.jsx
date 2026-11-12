import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const rolePrefix = {
  admin: '/admin/reports',
  field_agent: '/agent/reports',
  organization: '/org/reports',
  citizen: '/citizen/reports',
};

export default function NotificationsPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/notifications')
      .then(({ data }) => {
        setNotifications(data.notifications);
        setUnread(data.unread);
      })
      .catch(() => toast.error('Could not load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
      );
      setUnread(0);
      window.dispatchEvent(new Event('notifications:changed'));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Could not mark notifications as read');
    }
  };

  const openNotification = async (notification) => {
    if (!notification.read_at) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
          )
        );
        setUnread((count) => Math.max(0, count - 1));
        window.dispatchEvent(new Event('notifications:changed'));
      } catch (err) {
        toast.error('Could not update this notification');
      }
    }

    const reportId = notification.data?.reportId;
    if (reportId) {
      navigate(`${rolePrefix[user?.role] || '/citizen/reports'}/${reportId}`);
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread update${unread === 1 ? '' : 's'} on your reports.` : 'You are up to date.'}
      >
        {unread > 0 && (
          <Button variant="outline" onClick={markAll}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </PageHeader>

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="Nothing here yet"
            description="Status changes, assignments and verified cleanups will show up in this list."
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => openNotification(notification)}
              className={cn(
                'w-full rounded-2xl border p-4 text-left transition',
                notification.read_at
                  ? 'border-ink/10 bg-white hover:border-ink/20'
                  : 'border-primary-200 bg-primary-50/60 hover:border-primary-300'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{notification.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{notification.body}</p>
                </div>
                {!notification.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
              </div>
              <p className="mt-2.5 text-xs text-ink-muted">
                {new Date(notification.created_at).toLocaleString(undefined, {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
