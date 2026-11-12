import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Camera,
  ClipboardList,
  FileText,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Radar,
  Users,
  X,
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/reports', label: 'Reports', icon: ClipboardList },
  { to: '/admin/hotspots', label: 'Hotspots', icon: Radar },
  { to: '/admin/users', label: 'People', icon: Users },
  { to: '/admin/rewards', label: 'Rewards', icon: Gift },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const citizenNav = [
  { to: '/citizen', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/citizen/reports', label: 'My reports', icon: FileText },
  { to: '/citizen/report/new', label: 'Report waste', icon: Camera },
  { to: '/citizen/rewards', label: 'Rewards', icon: Gift },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const agentNav = [
  { to: '/agent', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agent/reports', label: 'Reports', icon: ClipboardList },
  { to: '/agent/hotspots', label: 'Hotspots', icon: Radar },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const organizationNav = [
  { to: '/org', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/org/reports', label: 'Reports', icon: ClipboardList },
  { to: '/org/hotspots', label: 'Hotspots', icon: Radar },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const roleLabels = {
  admin: 'Administrator',
  citizen: 'Citizen',
  field_agent: 'Field agent',
  organization: 'Organization',
};

const rootPaths = ['/admin', '/citizen', '/agent', '/org'];

function getNavItems(role) {
  if (role === 'admin') return adminNav;
  if (role === 'field_agent') return agentNav;
  if (role === 'organization') return organizationNav;
  return citizenNav;
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function NavList({ items, unread, onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={rootPaths.includes(item.to)}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
              isActive ? 'bg-ink/[0.06] text-ink' : 'text-ink-muted hover:bg-ink/[0.04] hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn('h-4 w-4 shrink-0', isActive ? 'text-ink' : 'text-ink/40')}
                strokeWidth={1.7}
              />
              <span className="truncate">{item.label}</span>
              {item.to === '/notifications' && unread > 0 && (
                <span
                  className={cn(
                    'tabular ml-auto rounded px-1.5 text-[10px] font-semibold',
                    isActive ? 'bg-ink text-white' : 'bg-ink/10 text-ink'
                  )}
                >
                  {unread}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Sidebar({ user, role, items, unread, onNavigate }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const signOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col border-r border-line bg-white">
      <div className="px-4 pb-5 pt-5">
        <Logo />
        <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">
          {roleLabels[role] || 'Workspace'}
        </p>
      </div>

      <NavList items={items} unread={unread} onNavigate={onNavigate} />

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-ink/[0.06] text-[11px] font-semibold text-ink">
            {initials(user?.full_name) || 'EC'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{user?.full_name}</p>
            <p className="truncate text-[11px] text-ink-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out"
            className="grid h-7 w-7 place-items-center rounded-md text-ink/40 transition hover:bg-ink/[0.06] hover:text-ink"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ items, unread, onMore }) {
  const primary = items.slice(0, 4);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-5">
        {primary.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={rootPaths.includes(item.to)}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-ink' : 'text-ink-muted'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-[18px] w-[18px]', isActive ? 'text-ink' : 'text-ink/40')} strokeWidth={1.7} />
                <span className="truncate px-1">{item.label.split(' ')[0]}</span>
                {item.to === '/notifications' && unread > 0 && (
                  <span className="absolute right-4 top-1.5 h-1.5 w-1.5 rounded-full bg-ink" />
                )}
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onMore}
          className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-ink-muted"
        >
          <MoreHorizontal className="h-[18px] w-[18px] text-ink/40" strokeWidth={1.7} />
          More
        </button>
      </div>
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'citizen';
  const navItems = useMemo(() => getNavItems(role), [role]);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const refresh = () => {
      api
        .get('/notifications')
        .then(({ data }) => setUnread(data.unread))
        .catch(() => {});
    };

    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener('notifications:changed', refresh);

    return () => {
      clearInterval(timer);
      window.removeEventListener('notifications:changed', refresh);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const activeItem = useMemo(() => {
    const sorted = [...navItems].sort((a, b) => b.to.length - a.to.length);
    return sorted.find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));
  }, [navItems, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] lg:block">
        <Sidebar user={user} role={role} items={navItems} unread={unread} />
      </aside>

      <div className="lg:pl-[236px]">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-md border border-line bg-white lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <p className="min-w-0 flex-1 truncate text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">{roleLabels[role]}</p>

            <NavLink
              to="/notifications"
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-md border border-line bg-white text-ink-muted transition hover:text-ink"
            >
              <Bell className="h-4 w-4" strokeWidth={1.7} />
              {unread > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ink" />}
            </NavLink>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md border border-line bg-white py-1 pl-1 pr-2 transition hover:border-ink/25">
                  <span className="grid h-7 w-7 place-items-center rounded bg-ink/[0.06] text-[11px] font-semibold">
                    {initials(user?.full_name) || 'EC'}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-[13px] font-medium sm:block">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px]">
                <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                <div className="px-3 pb-2">
                  <p className="truncate text-sm font-medium">{user?.full_name}</p>
                  <p className="truncate text-xs text-ink-muted">{user?.email}</p>
                  <p className="mt-1.5 text-[11px] uppercase tracking-wide text-ink-muted">{roleLabels[role]}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/notifications">Notifications</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/">Home page</NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-red-600 focus:bg-red-50">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav items={navItems} unread={unread} onMore={() => setMenuOpen(true)} />

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 left-0 w-[264px] shadow-lift"
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute right-2.5 top-4 grid h-8 w-8 place-items-center rounded-md text-ink-muted transition hover:bg-ink/5"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar
              user={user}
              role={role}
              items={navItems}
              unread={unread}
              onNavigate={() => setMenuOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
