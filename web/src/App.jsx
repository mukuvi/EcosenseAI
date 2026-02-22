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

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyReportsPage from './pages/citizen/MyReportsPage';
import SubmitReportPage from './pages/citizen/SubmitReportPage';
import CitizenRewardsPage from './pages/citizen/CitizenRewardsPage';

// Agent pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentReportsPage from './pages/agent/AgentReportsPage';

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ children, roles }) {
  const user = useAuthStore((s) => s.user);
  if (!roles.includes(user?.role)) {
    // Redirect to the appropriate dashboard for their role
    if (user?.role === 'admin') return <Navigate to="/" replace />;
    if (user?.role === 'field_agent') return <Navigate to="/agent" replace />;
    return <Navigate to="/citizen" replace />;
  }
  return children;
}

function LoginRedirect() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === 'field_agent') return <Navigate to="/agent" replace />;
  if (user?.role === 'citizen') return <Navigate to="/citizen" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin routes */}
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

      {/* Citizen routes */}
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

      {/* Field agent routes */}
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

      {/* Catch-all: redirect based on role */}
      <Route path="*" element={
        <ProtectedRoute>
          <LoginRedirect />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
