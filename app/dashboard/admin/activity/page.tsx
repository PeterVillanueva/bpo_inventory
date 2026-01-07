'use client';

import { useEffect, useState } from 'react';

export default function AdminActivityPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserActivity(selectedUser);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/users?role=BPO', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async (userId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/analytics/user-activity/${userId}?limit=30`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#000000]">User Activity</h2>

      <div>
        <label className="block text-sm font-medium text-[#14213d] mb-1">Select User</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="mt-1 block w-full max-w-md rounded-md border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
          <h3 className="mb-4 text-lg font-semibold text-[#000000]">Activity Timeline</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#fca311] border-t-transparent mx-auto"></div>
              <p className="text-[#14213d] font-medium">Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-[#14213d]">No activity found.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, idx) => (
                <div key={idx} className="border-l-4 border-[#fca311] pl-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#000000]">{activity.date}</h4>
                    <span className="text-sm font-medium text-[#14213d]">
                      {activity.totalActions} actions
                    </span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {activity.activities.map((act: any, actIdx: number) => (
                      <div key={actIdx} className="text-sm text-[#000000]">
                        <span className="font-semibold text-[#14213d]">{act.actionType}</span> -{' '}
                        {act.itemType} ({act.itemIdentityCode}) at {act.location}
                        <span className="text-[#14213d] ml-2">
                          - {new Date(act.timestamp).toLocaleString()}
                        </span>
                        {act.remarks && (
                          <p className="text-[#14213d] mt-1 ml-4">Remarks: {act.remarks}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

