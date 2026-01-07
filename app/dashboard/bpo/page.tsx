'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BPODashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/items?assignedToMe=true', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#000000]">My Assigned Items</h2>
        <Link
          href="/dashboard/bpo/scan"
          className="rounded-md bg-[#fca311] px-4 py-2 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#fca311]/90 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2"
        >
          Scan Item
        </Link>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#fca311] border-t-transparent mx-auto"></div>
          <p className="text-[#14213d] font-medium">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm border border-[#e5e5e5]">
          <p className="text-[#14213d] font-medium">No items assigned to you.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5] hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#000000]">{item.itemType}</h3>
                <p className="text-sm text-[#14213d] mt-1">ID: {item.identityCode}</p>
                <p className="text-sm text-[#14213d]">QR: {item.qrCode}</p>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.status === 'assigned'
                      ? 'bg-[#fca311]/20 text-[#fca311]'
                      : 'bg-[#e5e5e5] text-[#000000]'
                  }`}
                >
                  {item.status}
                </span>
                <Link
                  href={`/dashboard/bpo/scan?itemId=${item.id}`}
                  className="text-sm font-medium text-[#fca311] hover:text-[#14213d] transition-colors"
                >
                  Scan →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

