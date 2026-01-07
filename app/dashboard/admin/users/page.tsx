'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import apiClient, { extractApiData } from '@/lib/api-client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'BPO',
    employeeId: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/users');
      const data = extractApiData(response);
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      alert(error.response?.data?.error || error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/api/auth/register', formData);
      setShowForm(false);
      setFormData({ email: '', password: '', name: '', role: 'BPO', employeeId: '' });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#000000]">Users</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-[#fca311] px-4 py-2 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#fca311]/90 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2"
        >
          + Add User
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setFormData({ email: '', password: '', name: '', role: 'BPO', employeeId: '' });
        }}
        title="Register New User"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            >
              <option value="BPO">BPO User</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Employee ID (Optional)</label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ email: '', password: '', name: '', role: 'BPO', employeeId: '' });
              }}
              className="rounded-md border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium text-[#14213d] transition-colors hover:bg-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#fca311] px-4 py-2 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#fca311]/90 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register User'}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#fca311] border-t-transparent mx-auto"></div>
          <p className="text-[#14213d] font-medium">Loading users...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#e5e5e5]">
            <thead className="bg-[#14213d]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Employee ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#14213d]">
                    No users found. Register your first user to get started.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#e5e5e5]/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#000000]">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#14213d]">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-[#fca311]/20 text-[#fca311]'
                            : user.role === 'OWNER'
                            ? 'bg-[#14213d]/10 text-[#14213d]'
                            : 'bg-[#e5e5e5] text-[#000000]'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#14213d]">
                      {user.employeeId || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

