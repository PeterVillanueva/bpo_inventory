'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';

export default function BPORequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    action: '',
    reason: '',
    location: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/movement-requests', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/movement-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create request');
        setLoading(false);
        return;
      }

      setShowForm(false);
      setFormData({ itemId: '', action: '', reason: '', location: '' });
      fetchRequests();
    } catch (error) {
      alert('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#000000]">Movement Requests</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-[#fca311] px-4 py-2 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#fca311]/90 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2"
        >
          + New Request
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setFormData({ itemId: '', action: '', reason: '', location: '' });
        }}
        title="Create Request"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Item ID</label>
            <input
              type="text"
              value={formData.itemId}
              onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
              required
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Action</label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              required
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            >
              <option value="">Select action</option>
              <option value="REQUEST_REPAIR">Request Repair</option>
              <option value="REQUEST_DISPOSE">Request Dispose</option>
              <option value="REQUEST_BORROW">Request Borrow</option>
              <option value="REQUEST_TRANSFER_FLOOR_1">Transfer to Floor 1</option>
              <option value="REQUEST_TRANSFER_FLOOR_2">Transfer to Floor 2</option>
              <option value="REQUEST_TRANSFER_FLOOR_3">Transfer to Floor 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Reason *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              rows={3}
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Location</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            >
              <option value="">Select location</option>
              <option value="Floor 1">Floor 1</option>
              <option value="Floor 2">Floor 2</option>
              <option value="Floor 3">Floor 3</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ itemId: '', action: '', reason: '', location: '' });
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
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#fca311] border-t-transparent mx-auto"></div>
          <p className="text-[#14213d] font-medium">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm border border-[#e5e5e5]">
          <p className="text-[#14213d] font-medium">No requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#000000]">{req.item.itemType}</h3>
                  <p className="text-sm text-[#14213d] mt-1">ID: {req.item.identityCode}</p>
                  <p className="text-sm text-[#14213d]">Action: {req.action.replace('REQUEST_', '')}</p>
                  <p className="text-sm text-[#000000] mt-1">Reason: {req.reason}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    req.status === 'approved'
                      ? 'bg-[#14213d]/10 text-[#14213d]'
                      : req.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-[#fca311]/20 text-[#fca311]'
                  }`}
                >
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

