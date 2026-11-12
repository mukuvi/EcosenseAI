import { useEffect, useState } from 'react';
import { Ban, CheckCircle2, Loader2, Plus, ShieldCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { parseApiError } from '../utils/apiError';

const roles = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'organization', label: 'Organization' },
  { value: 'field_agent', label: 'Field agent' },
  { value: 'admin', label: 'Administrator' },
];

const emptyForm = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'citizen',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [busyUser, setBusyUser] = useState('');
  const limit = 20;

  const loadUsers = () =>
    api
      .get('/users', { params: { page, limit } })
      .then(({ data }) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(() => toast.error('Could not load users'))
      .finally(() => setLoading(false));

  useEffect(() => {
    setLoading(true);
    loadUsers();
  }, [page]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setCreating(true);

    try {
      const { data } = await api.post('/users', {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone: form.phone || undefined,
        role: form.role,
      });

      setUsers((previous) => [data.user, ...previous].slice(0, limit));
      setTotal((value) => value + 1);
      setForm(emptyForm);
      setOpen(false);
      toast.success(`${data.user.full_name} can now sign in`);
    } catch (err) {
      const parsed = parseApiError(err, 'Could not create this user');
      setFieldErrors(parsed.fieldErrors);
      toast.error(parsed.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setBusyUser(userId);
    try {
      const { data } = await api.patch(`/users/${userId}/role`, { role });
      setUsers((previous) => previous.map((user) => (user.id === userId ? { ...user, role: data.user.role } : user)));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update the role');
    } finally {
      setBusyUser('');
    }
  };

  const handleToggleActive = async (userId, nextActive) => {
    setBusyUser(userId);
    try {
      const { data } = await api.patch(`/users/${userId}/active`, { is_active: nextActive });
      setUsers((previous) =>
        previous.map((user) => (user.id === userId ? { ...user, is_active: data.user.is_active } : user))
      );
      toast.success(nextActive ? 'Account restored' : 'Account suspended');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update this account');
    } finally {
      setBusyUser('');
    }
  };

  const handleDeactivate = async (userId) => {
    setBusyUser(userId);
    try {
      const { data } = await api.delete(`/users/${userId}`);
      setUsers((previous) =>
        previous.map((user) => (user.id === userId ? { ...user, is_active: data.user.is_active } : user))
      );
      toast.success('Account deactivated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not deactivate this account');
    } finally {
      setBusyUser('');
    }
  };

  return (
    <div>
      <PageHeader
        title="People"
        description="Manage the citizens, field agents and organizations using EcoSense AI."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              New user
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create a user</DialogTitle>
            <DialogDescription>
              The person can sign in immediately with this email and password.
            </DialogDescription>

            <form onSubmit={handleCreate} className="mt-5 space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="new_name">Full name</Label>
                <Input
                  id="new_name"
                  value={form.full_name}
                  onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                  invalid={Boolean(fieldErrors.full_name)}
                  placeholder="Mukuvi Ngandu"
                  required
                />
                {fieldErrors.full_name && <p className="text-[13px] text-red-600">{fieldErrors.full_name}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new_email">Email</Label>
                  <Input
                    id="new_email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    invalid={Boolean(fieldErrors.email)}
                    placeholder="amina@example.com"
                    required
                  />
                  {fieldErrors.email && <p className="text-[13px] text-red-600">{fieldErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_phone">Phone</Label>
                  <Input
                    id="new_phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    invalid={Boolean(fieldErrors.phone)}
                    placeholder="+254712345678"
                  />
                  {fieldErrors.phone && <p className="text-[13px] text-red-600">{fieldErrors.phone}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new_password">Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    invalid={Boolean(fieldErrors.password)}
                    placeholder="At least 8 characters"
                    required
                  />
                  {fieldErrors.password && <p className="text-[13px] text-red-600">{fieldErrors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_role">Role</Label>
                  <Select
                    id="new_role"
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? 'Creating' : 'Create user'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No users yet"
            description="Create the first account and it will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Person</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-xs font-semibold text-primary-700">
                        {user.full_name
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{user.full_name}</p>
                        <p className="truncate text-xs text-ink-muted">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      disabled={busyUser === user.id}
                      className="h-9 w-36 text-[13px]"
                      aria-label={`Role for ${user.full_name}`}
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell className="font-medium">{user.points_balance}</TableCell>
                  <TableCell className="text-ink-muted">
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral">
                        <Ban className="h-3 w-3" />
                        Suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(user.id, !user.is_active)}
                        disabled={busyUser === user.id}
                      >
                        {user.is_active ? 'Suspend' : 'Restore'}
                      </Button>
                      {user.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(user.id)}
                          disabled={busyUser === user.id}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Pagination page={page} totalPages={Math.ceil(total / limit)} onChange={setPage} />
    </div>
  );
}
