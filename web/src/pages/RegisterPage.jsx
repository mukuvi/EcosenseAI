import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ROLE_OPTIONS = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'organization', label: 'Organization' },
  { value: 'field_agent', label: 'Field Agent' },
  { value: 'admin', label: 'Admin' },
];

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedRole === 'admin') {
      setError('Admin accounts are created by an administrator. Choose a different portal or sign in if you already have access.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(email, password, fullName, phone || undefined, selectedRole);
      const role = data.user.role;
      if (role === 'admin') navigate('/');
      else if (role === 'field_agent') navigate('/agent');
      else if (role === 'organization') navigate('/org');
      else navigate('/citizen');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">EcoSense AI</h1>
          <p className="text-gray-500 mt-2">Choose your portal and create an account</p>
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

        {selectedRole === 'admin' && (
          <div className="bg-sage-50 text-ink border border-sage-200 px-4 py-3 rounded-lg mb-4 text-sm">
            Admin accounts are created by an administrator.
            <span className="block mt-1">If you already have an account, sign in instead.</span>
          </div>
        )}

        {error && (
          <div className="bg-sage-50 text-ink border border-sage-200 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>
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
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+254700000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
