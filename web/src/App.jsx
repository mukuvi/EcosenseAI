import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/Layout';
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

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ children, roles }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrating = useAuthStore((s) => s.hydrating);

  if (token && (!user || hydrating)) {
    return <div className="min-h-screen bg-surface text-ink flex items-center justify-center">Loading...</div>;
  }

  if (!roles.includes(user?.role)) {
    if (user?.role === 'admin') return <Navigate to="/" replace />;
    if (user?.role === 'field_agent') return <Navigate to="/agent" replace />;
    if (user?.role === 'organization') return <Navigate to="/org" replace />;
    return <Navigate to="/citizen" replace />;
  }
  return children;
}

function LoginRedirect() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrating = useAuthStore((s) => s.hydrating);

  if (token && (!user || hydrating)) {
    return <div className="min-h-screen bg-surface text-ink flex items-center justify-center">Loading...</div>;
  }

  if (user?.role === 'field_agent') return <Navigate to="/agent" replace />;
  if (user?.role === 'organization') return <Navigate to="/org" replace />;
  if (user?.role === 'citizen') return <Navigate to="/citizen" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
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

      <Route path="*" element={
        <ProtectedRoute>
          <LoginRedirect />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
