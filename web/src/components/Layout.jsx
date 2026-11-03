import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const adminNav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/hotspots', label: 'Hotspots' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/rewards', label: 'Rewards' },
  { to: '/notifications', label: 'Notifications' },
];

const citizenNav = [
  { to: '/citizen', label: 'Dashboard' },
  { to: '/citizen/reports', label: 'My Reports' },
  { to: '/citizen/report/new', label: 'Report Waste' },
  { to: '/citizen/rewards', label: 'Rewards' },
  { to: '/notifications', label: 'Notifications' },
];

const agentNav = [
  { to: '/agent', label: 'Dashboard' },
  { to: '/agent/reports', label: 'Reports' },
  { to: '/agent/hotspots', label: 'Hotspots' },
  { to: '/notifications', label: 'Notifications' },
];

const organizationNav = [
  { to: '/org', label: 'Dashboard' },
  { to: '/org/reports', label: 'Reports' },
  { to: '/org/hotspots', label: 'Hotspots' },
  { to: '/notifications', label: 'Notifications' },
];

const roleLabels = {
  admin: 'Admin Dashboard',
  citizen: 'Citizen Portal',
  field_agent: 'Field Agent Portal',
  organization: 'Organization Portal',
};

function getNavItems(role) {
  if (role === 'admin') return adminNav;
  if (role === 'field_agent') return agentNav;
  if (role === 'organization') return organizationNav;
  return citizenNav;
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role || 'citizen';
  const navItems = getNavItems(role);
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const refreshUnread = () => {
      api.get('/notifications')
        .then(({ data }) => setUnread(data.unread))
        .catch(() => {});
    };

    refreshUnread();
    const timer = setInterval(refreshUnread, 30000);
    window.addEventListener('notifications:changed', refreshUnread);

    return () => {
      clearInterval(timer);
      window.removeEventListener('notifications:changed', refreshUnread);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface text-ink">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-800 text-white flex flex-col transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">EcoSense AI</h1>
            <p className="text-primary-200 text-sm mt-1">{roleLabels[role] || 'Dashboard'}</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-2xl leading-none text-primary-200"
            aria-label="Close menu"
          >
            x
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/citizen' || item.to === '/agent' || item.to === '/org'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              <span>{item.label}</span>
              {item.to === '/notifications' && unread > 0 && (
                <span className="ml-auto text-xs bg-primary-500 text-white rounded-full px-2 py-0.5">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-700">
          <p className="text-sm text-primary-200 truncate">{user?.full_name}</p>
          <p className="text-xs text-primary-300 truncate">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary-600 rounded-full capitalize">
            {role?.replace('_', ' ')}
          </span>
          <button
            onClick={handleLogout}
            className="mt-3 block text-sm text-primary-300 hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between gap-3 bg-primary-800 text-white px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-sm border border-primary-600 rounded-lg px-3 py-1.5"
            aria-label="Open menu"
          >
            Menu
          </button>
          <p className="text-sm font-semibold truncate">{roleLabels[role] || 'Dashboard'}</p>
          <span className="text-xs text-primary-200">{unread > 0 ? `${unread} new` : ''}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
