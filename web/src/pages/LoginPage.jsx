import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ROLE_OPTIONS = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'organization', label: 'Organization' },
  { value: 'field_agent', label: 'Field Agent' },
  { value: 'admin', label: 'Admin' },
];

const roleLanding = {
  admin: '/',
  field_agent: '/agent',
  organization: '/org',
  citizen: '/citizen',
};

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const role = data.user.role;

      if (selectedRole && role !== selectedRole) {
        logout();
        const selectedLabel = ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label || 'Selected role';
        const actualLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
        setError(`${selectedLabel} sign-in selected, but this account is ${actualLabel}.`);
        return;
      }

      navigate(roleLanding[role] || '/citizen');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">EcoSense AI</h1>
          <p className="text-gray-500 mt-2">Choose your portal and sign in</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedRole(opt.value)}
              className={
                `px-3 py-2 rounded-lg text-sm border transition ` +
                (selectedRole === opt.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-surface text-ink border-sage-200 hover:border-primary-300')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-sage-50 text-ink border border-sage-200 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
