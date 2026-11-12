import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import UsersPage from './pages/UsersPage';
import RewardsPage from './pages/RewardsPage';
import HotspotsPage from './pages/HotspotsPage';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyReportsPage from './pages/citizen/MyReportsPage';
import SubmitReportPage from './pages/citizen/SubmitReportPage';
import CitizenRewardsPage from './pages/citizen/CitizenRewardsPage';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentReportsPage from './pages/agent/AgentReportsPage';
import OrganizationDashboard from './pages/org/OrganizationDashboard';
import NotificationsPage from './pages/NotificationsPage';

const roleLanding = {
  admin: '/admin',
  field_agent: '/agent',
  organization: '/org',
  citizen: '/citizen',
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ children, roles }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrating = useAuthStore((state) => state.hydrating);

  if (token && (!user || hydrating)) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface">
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
          Loading your workspace
        </div>
      </div>
    );
  }

  if (!roles.includes(user?.role)) {
    return <Navigate to={roleLanding[user?.role] || '/citizen'} replace />;
  }

  return children;
}

function LoginRedirect() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrating = useAuthStore((state) => state.hydrating);

  if (token && (!user || hydrating)) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface">
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
          Loading your workspace
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={roleLanding[user?.role] || '/citizen'} replace />;
}

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <LoginRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<NotificationsPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['admin']}>
                <Layout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:id" element={<ReportDetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="hotspots" element={<HotspotsPage />} />
        </Route>

        <Route
          path="/citizen"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['citizen']}>
                <Layout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<CitizenDashboard />} />
          <Route path="reports" element={<MyReportsPage />} />
          <Route path="reports/:id" element={<ReportDetailPage />} />
          <Route path="report/new" element={<SubmitReportPage />} />
          <Route path="rewards" element={<CitizenRewardsPage />} />
        </Route>

        <Route
          path="/agent"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['field_agent']}>
                <Layout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AgentDashboard />} />
          <Route path="reports" element={<AgentReportsPage />} />
          <Route path="reports/:id" element={<ReportDetailPage />} />
          <Route path="hotspots" element={<HotspotsPage />} />
        </Route>

        <Route
          path="/org"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['organization']}>
                <Layout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<OrganizationDashboard />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:id" element={<ReportDetailPage />} />
          <Route path="hotspots" element={<HotspotsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
