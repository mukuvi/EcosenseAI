import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/reports', label: 'Reports', icon: '📋' },
  { to: '/hotspots', label: 'Hotspots', icon: '🔥' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/rewards', label: 'Rewards', icon: '🎁' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">🌍 EcoSense AI</h1>
          <p className="text-primary-200 text-sm mt-1">Admin Dashboard</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-700">
          <p className="text-sm text-primary-200 truncate">{user?.full_name}</p>
          <p className="text-xs text-primary-300 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 text-sm text-primary-300 hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
