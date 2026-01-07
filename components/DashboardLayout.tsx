'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'OWNER' | 'ADMIN' | 'BPO';
  title: string;
}

export default function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from token in localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== role) {
        // Redirect to appropriate dashboard
        if (payload.role === 'OWNER') router.push('/dashboard/owner');
        else if (payload.role === 'ADMIN') router.push('/dashboard/admin');
        else if (payload.role === 'BPO') router.push('/dashboard/bpo');
        return;
      }
      setUser(payload);
    } catch {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [role, router]);

  const handleLogout = () => {
    // Clear localStorage token
    localStorage.removeItem('token');
    // Clear cookie (if any)
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Loading...</h1>
        </div>
      </div>
    );
  }

  const navItems =
    role === 'ADMIN'
      ? [
          { href: '/dashboard/admin', label: 'Dashboard' },
          { href: '/dashboard/admin/items', label: 'Items' },
          { href: '/dashboard/admin/users', label: 'Users' },
          { href: '/dashboard/admin/requests', label: 'Requests' },
          { href: '/dashboard/admin/activity', label: 'Activity' },
        ]
      : role === 'OWNER'
      ? [
          { href: '/dashboard/owner', label: 'Dashboard' },
          { href: '/dashboard/owner/analytics', label: 'Analytics' },
        ]
      : [
          { href: '/dashboard/bpo', label: 'My Items' },
          { href: '/dashboard/bpo/scan', label: 'Scan' },
          { href: '/dashboard/bpo/requests', label: 'My Requests' },
        ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <div className="ml-10 flex space-x-4">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
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

