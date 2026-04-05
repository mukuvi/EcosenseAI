import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const adminNav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/hotspots', label: 'Hotspots' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/rewards', label: 'Rewards' },
];

const citizenNav = [
  { to: '/citizen', label: 'Dashboard' },
  { to: '/citizen/reports', label: 'My Reports' },
  { to: '/citizen/report/new', label: 'Report Waste' },
  { to: '/citizen/rewards', label: 'Rewards' },
];

const agentNav = [
  { to: '/agent', label: 'Dashboard' },
  { to: '/agent/reports', label: 'Reports' },
  { to: '/agent/hotspots', label: 'Hotspots' },
];

const organizationNav = [
  { to: '/org', label: 'Dashboard' },
  { to: '/org/reports', label: 'Reports' },
  { to: '/org/hotspots', label: 'Hotspots' },
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface text-ink">
      <aside className="w-64 bg-primary-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">EcoSense AI</h1>
          <p className="text-primary-200 text-sm mt-1">{roleLabels[role] || 'Dashboard'}</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/citizen' || item.to === '/agent' || item.to === '/org'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              <span>{item.label}</span>
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

      <main className="flex-1 overflow-y-auto p-8 bg-surface">
        <Outlet />
      </main>
    </div>
  );
}
