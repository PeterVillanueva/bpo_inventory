'use client';

import { useEffect, useState } from 'react';

export default function OwnerDashboard() {
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
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-sm">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#fca311] border-t-transparent mx-auto"></div>
        <p className="text-[#14213d] font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#000000]">Analytics Overview</h2>

      {dashboard && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
              <h3 className="text-sm font-medium text-[#14213d]">Total Items</h3>
              <p className="mt-2 text-3xl font-bold text-[#000000]">{dashboard.overview.totalItems}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
              <h3 className="text-sm font-medium text-[#14213d]">Assigned</h3>
              <p className="mt-2 text-3xl font-bold text-[#fca311]">{dashboard.overview.assignedItems}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
              <h3 className="text-sm font-medium text-[#14213d]">Available</h3>
              <p className="mt-2 text-3xl font-bold text-[#14213d]">{dashboard.overview.availableItems}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
              <h3 className="text-sm font-medium text-[#14213d]">Total Users</h3>
              <p className="mt-2 text-3xl font-bold text-[#000000]">{dashboard.overview.totalUsers}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
              <h3 className="mb-4 text-lg font-semibold text-[#000000]">Today's Activity</h3>
              <div className="space-y-2">
                {dashboard.todayActivity.slice(0, 10).map((activity: any) => (
                  <div
                    key={activity.userId}
                    className="flex items-center justify-between border-b border-[#e5e5e5] pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#000000]">{activity.userName}</p>
                      <p className="text-xs text-[#14213d] mt-1">{activity.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#000000]">{activity.totalActions} actions</p>
                      <p className="text-xs text-[#14213d]">
                        {new Date(activity.lastActivityAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
              <h3 className="mb-4 text-lg font-semibold text-[#000000]">Today's Usage</h3>
              <div className="space-y-2">
                {dashboard.todayUsage.slice(0, 10).map((usage: any) => (
                  <div
                    key={usage.userId}
                    className="flex items-center justify-between border-b border-[#e5e5e5] pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#000000]">{usage.userName}</p>
                      <p className="text-xs text-[#14213d] mt-1">{usage.itemsUsed} items used</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#000000]">
                        {Math.floor(usage.totalDurationMinutes / 60)}h{' '}
                        {usage.totalDurationMinutes % 60}m
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
            <h3 className="mb-4 text-lg font-semibold text-[#000000]">Recent Activity</h3>
            <div className="space-y-2">
              {dashboard.recentActivity.slice(0, 20).map((activity: any) => (
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

