import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, HardHat, Loader2, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';
import { parseApiError } from '../utils/apiError';
import AuthShell from '../components/AuthShell';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { cn } from '../lib/utils';

const roleOptions = [
  { value: 'citizen', label: 'Citizen', hint: 'Report waste and earn points', icon: User },
  { value: 'organization', label: 'Organization', hint: 'Coordinate cleanups in your area', icon: Building2 },
  { value: 'field_agent', label: 'Field agent', hint: 'Work assigned reports', icon: HardHat },
  { value: 'admin', label: 'Administrator', hint: 'Created by an admin', icon: ShieldCheck, restricted: true },
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-[13px] text-red-600">{message}</p>;
}

export default function RegisterPage() {
  const [role, setRole] = useState('citizen');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const clearFieldError = (field) =>
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  const selectRole = (option) => {
    if (option.restricted) {
      toast.info('Administrator accounts are created by an existing administrator.');
      return;
    }
    setRole(option.value);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      const data = await register(email, password, fullName, phone || undefined, role);
      toast.success('Your account is ready');
      const landing = {
        admin: '/admin',
        field_agent: '/agent',
        organization: '/org',
        citizen: '/citizen',
      };
      navigate(landing[data.user.role] || '/citizen');
    } catch (err) {
      const parsed = parseApiError(err, 'We could not create your account. Please try again.');
      setFieldErrors(parsed.fieldErrors);
      setError(parsed.message);
      toast.error(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New account"
      title="Create your account"
      subtitle="Select the role that matches your work. Citizens can report sites immediately; agency accounts are created by an administrator or organization."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-700 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2.5">
        {roleOptions.map((option) => {
          const selected = role === option.value && !option.restricted;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => selectRole(option)}
              aria-pressed={selected}
              className={cn(
                'rounded-xl border p-3 text-left transition',
                selected
                  ? 'border-primary-500 bg-primary-50 shadow-[0_0_0_1px_rgba(46,139,87,0.35)]'
                  : 'border-ink/12 bg-white hover:border-ink/25',
                option.restricted && 'opacity-60'
              )}
            >
              <option.icon className={cn('h-4 w-4', selected ? 'text-primary-700' : 'text-ink/45')} />
              <p className="mt-2 text-[13px] font-semibold leading-tight">{option.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{option.hint}</p>
            </button>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              clearFieldError('full_name');
            }}
            invalid={Boolean(fieldErrors.full_name)}
            placeholder="Jane Wanjiku"
            autoComplete="name"
            required
          />
          <FieldError message={fieldErrors.full_name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError('email');
            }}
            invalid={Boolean(fieldErrors.email)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError('password');
              }}
              invalid={Boolean(fieldErrors.password)}
              placeholder="At least 8 characters, with a number"
              autoComplete="new-password"
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={fieldErrors.password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone <span className="font-normal text-ink-muted">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              clearFieldError('phone');
            }}
            invalid={Boolean(fieldErrors.phone)}
            placeholder="+254712345678"
            autoComplete="tel"
          />
          <FieldError message={fieldErrors.phone} />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating account' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}
