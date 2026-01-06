'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (token) {
      // Try to decode token to get role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'OWNER') {
          router.push('/dashboard/owner');
        } else if (payload.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else if (payload.role === 'BPO') {
          router.push('/dashboard/bpo');
        }
      } catch {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    </div>
  );
}
