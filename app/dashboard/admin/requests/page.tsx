'use client';

import { useEffect, useState } from 'react';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/movement-requests?status=pending', {
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

  const handleReview = async (requestId: string, status: 'approved' | 'rejected', location: string) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/movement-requests/${requestId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ status, location }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to review request');
        return;
      }

      fetchRequests();
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#000000]">Pending Requests</h2>

      {loading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#fca311] border-t-transparent mx-auto"></div>
          <p className="text-[#14213d] font-medium">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm border border-[#e5e5e5]">
          <p className="text-[#14213d] font-medium">No pending requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5] hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#000000]">{req.item.itemType}</h3>
                  <p className="text-sm text-[#14213d] mt-1">ID: {req.item.identityCode}</p>
                  <p className="text-sm text-[#14213d]">QR: {req.item.qrCode}</p>
                  <p className="mt-3 text-sm text-[#000000]">
                    <span className="font-semibold text-[#14213d]">Requested by:</span> {req.user.name} (
                    {req.user.email})
                  </p>
                  <p className="text-sm text-[#000000]">
                    <span className="font-semibold text-[#14213d]">Action:</span>{' '}
                    {req.action.replace('REQUEST_', '')}
                  </p>
                  <p className="mt-2 text-sm text-[#000000]">
                    <span className="font-semibold text-[#14213d]">Reason:</span> {req.reason}
                  </p>
                  <p className="text-xs text-[#14213d] mt-2">
                    Requested: {new Date(req.requestedAt).toLocaleString()}
                  </p>
                </div>
                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={() => handleReview(req.id, 'approved', 'Storage')}
                    className="rounded-md bg-[#14213d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(req.id, 'rejected', 'Storage')}
                    className="rounded-md border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-semibold text-[#14213d] transition-colors hover:bg-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

