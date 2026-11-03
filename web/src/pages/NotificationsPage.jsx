import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const rolePrefix = {
  admin: '/admin/reports',
  field_agent: '/agent/reports',
  organization: '/org/reports',
  citizen: '/citizen/reports',
};

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnread(data.unread);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnread(0);
    window.dispatchEvent(new Event('notifications:changed'));
  };

  const openNotification = async (notification) => {
    if (!notification.read_at) {
      await api.patch(`/notifications/${notification.id}/read`);
      setNotifications((prev) => prev.map((n) => (
        n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
      )));
      setUnread((count) => Math.max(0, count - 1));
      window.dispatchEvent(new Event('notifications:changed'));
    }

    const reportId = notification.data?.reportId;
    if (reportId) {
      navigate(`${rolePrefix[user?.role] || '/citizen/reports'}/${reportId}`);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-gray-500 text-sm">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && <p className="text-gray-400">Loading...</p>}

      {!loading && notifications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
          No notifications yet. Report updates and assignments will appear here.
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => openNotification(notification)}
            className={`w-full text-left rounded-xl p-4 shadow-sm transition hover:shadow ${
              notification.read_at ? 'bg-white' : 'bg-primary-50 border border-primary-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
              </div>
              {!notification.read_at && <span className="w-2.5 h-2.5 rounded-full bg-primary-600 shrink-0 mt-1" />}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(notification.created_at).toLocaleString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
