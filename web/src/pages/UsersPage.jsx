import { useEffect, useState } from 'react';
import api from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createRole, setCreateRole] = useState('citizen');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const limit = 20;

  useEffect(() => {
    api.get('/users', { params: { page, limit } })
      .then(({ data }) => { setUsers(data.users); setTotal(data.total); })
      .catch(console.error);
  }, [page]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      const { data } = await api.post('/users', {
        email: createEmail,
        password: createPassword,
        full_name: createFullName,
        phone: createPhone || undefined,
        role: createRole,
      });

      setUsers((prev) => [data.user, ...prev].slice(0, limit));
      setTotal((t) => t + 1);

      setCreateEmail('');
      setCreatePassword('');
      setCreateFullName('');
      setCreatePhone('');
      setCreateRole('citizen');
    } catch (err) {
      setCreateError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: data.user.role } : u)));
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Create User</h3>

        {createError && (
          <div className="bg-sage-50 text-ink border border-sage-200 px-4 py-3 rounded-lg mb-4 text-sm">{createError}</div>
        )}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              value={createFullName}
              onChange={(e) => setCreateFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Organization Admin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              value={createPhone}
              onChange={(e) => setCreatePhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+254700000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="citizen">Citizen</option>
              <option value="organization">Organization</option>
              <option value="field_agent">Field Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={createLoading}
              className="w-full md:w-auto px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {createLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Points</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium">{user.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="organization">Organization</option>
                    <option value="field_agent">Field Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">{user.points_balance}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${user.is_active ? 'bg-moss-600' : 'bg-sage-300'}`}></span>
                  {user.is_active ? 'Active' : 'Inactive'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Math.ceil(total / limit) > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border disabled:opacity-50">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {Math.ceil(total / limit)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / limit)} className="px-4 py-2 rounded-lg border disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
