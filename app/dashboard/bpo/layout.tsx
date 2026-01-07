'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BPOLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'BPO') {
        if (payload.role === 'OWNER') router.push('/dashboard/owner');
        else if (payload.role === 'ADMIN') router.push('/dashboard/admin');
        return;
      }
      setUser(payload);
    } catch {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5e5e5]">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#fca311] border-t-transparent mx-auto"></div>
          <p className="text-[#14213d] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard/bpo', label: 'My Items', icon: '📦' },
    { href: '/dashboard/bpo/scan', label: 'Scan', icon: '📷' },
    { href: '/dashboard/bpo/requests', label: 'My Requests', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-[#e5e5e5]">
      <nav className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-[#000000]">BPO Inventory</h1>
              <div className="flex space-x-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#14213d] text-white'
                          : 'text-[#14213d] hover:bg-[#e5e5e5]'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-[#14213d]">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-[#14213d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

