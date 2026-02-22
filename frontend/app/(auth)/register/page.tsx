'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [name, setName] = useState('Admin User');
  const [email, setEmail] = useState('admin@example.com');
  const [organizationName, setOrganizationName] = useState('Default Organization');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await authService.register({ name, email, password, organizationName });
      setTokens(res.accessToken, res.refreshToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <main><div className="card" style={{ maxWidth: 420, margin: '40px auto' }}><h1>Register</h1>
      <form onSubmit={onSubmit} className="grid">
        <label>Name<input value={name} onChange={(e)=>setName(e.target.value)} minLength={2} required /></label>
        <label>Email<input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required /></label>
        <label>Organization<input value={organizationName} onChange={(e)=>setOrganizationName(e.target.value)} required /></label>
        <label>Password<input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" minLength={8} required /></label>
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form></div></main>
  );
}
