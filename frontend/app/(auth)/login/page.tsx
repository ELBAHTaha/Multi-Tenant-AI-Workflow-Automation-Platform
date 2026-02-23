'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await authService.login({ email, password });
      setTokens(res.accessToken, res.refreshToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <main><div className="card" style={{ maxWidth: 420, margin: '40px auto' }}><h1>Login</h1>
      <form onSubmit={onSubmit} className="grid">
        <label>Email<input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required /></label>
        <label>Password<input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" minLength={8} required /></label>
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form></div></main>
  );
}
