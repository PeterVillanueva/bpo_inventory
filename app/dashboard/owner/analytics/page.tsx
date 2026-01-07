'use client';

import { useEffect, useState } from 'react';

export default function OwnerAnalyticsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-sm">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#fca311] border-t-transparent mx-auto"></div>
        <p className="text-[#14213d] font-medium">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#000000]">Detailed Analytics</h2>

      {dashboard && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
              <h3 className="text-sm font-medium text-[#14213d]">Repair Items</h3>
              <p className="mt-2 text-3xl font-bold text-[#fca311]">{dashboard.overview.repairItems}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
              <h3 className="text-sm font-medium text-[#14213d]">Disposed Items</h3>
              <p className="mt-2 text-3xl font-bold text-[#000000]">{dashboard.overview.disposedItems}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
              <h3 className="text-sm font-medium text-[#14213d]">Pending Requests</h3>
              <p className="mt-2 text-3xl font-bold text-[#fca311]">{dashboard.overview.pendingRequests}</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
            <h3 className="mb-4 text-lg font-semibold text-[#000000]">All Recent Activity</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {dashboard.recentActivity.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b border-[#e5e5e5] pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[#000000]">
                      {activity.userName} - {activity.actionType}
                    </p>
                    <p className="text-xs text-[#14213d] mt-1">
                      {activity.itemType} ({activity.itemQrCode}) - {activity.location}
                    </p>
                    {activity.remarks && (
                      <p className="text-xs text-[#14213d] mt-1">Remarks: {activity.remarks}</p>
                    )}
                  </div>
                  <span className="text-xs text-[#14213d] font-medium">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

