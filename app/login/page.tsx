'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { extractApiData, setAuthToken } from '@/lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const data = extractApiData(response);

      // Store token in localStorage for API requests
      if (data.token) {
        setAuthToken(data.token);
      }

      // Redirect based on role
      if (data.user.role === 'OWNER') {
        router.push('/dashboard/owner');
      } else if (data.user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (data.user.role === 'BPO') {
        router.push('/dashboard/bpo');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e5e5e5] px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg border border-[#e5e5e5]">
        <div>
          <h2 className="text-center text-3xl font-bold text-[#000000]">
            BPO Inventory System
          </h2>
          <p className="mt-2 text-center text-sm text-[#14213d]">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#14213d] mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#14213d] mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#fca311] px-4 py-2 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#fca311]/90 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

