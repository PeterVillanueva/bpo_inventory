'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [qrCode, setQrCode] = useState('');
  const [identityCode, setIdentityCode] = useState('');
  const [action, setAction] = useState<'SCAN_IN' | 'SCAN_OUT'>('SCAN_IN');
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const itemId = searchParams.get('itemId');
    if (itemId) {
      // Pre-fill if coming from item list
    }
  }, [searchParams]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!qrCode && !identityCode) {
      setError('Please provide either QR code or identity code');
      setLoading(false);
      return;
    }

    if (!location) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/items/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({
          qrCode: qrCode || undefined,
          identityCode: identityCode || undefined,
          action,
          location,
          remarks: remarks || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Scan failed');
        setLoading(false);
        return;
      }

      setSuccess('Item scanned successfully!');
      setQrCode('');
      setIdentityCode('');
      setRemarks('');

      setTimeout(() => {
        router.push('/dashboard/bpo');
      }, 1500);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm border border-[#e5e5e5]">
        <h2 className="mb-6 text-xl font-semibold text-[#000000]">Scan Item</h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800 font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label htmlFor="qrCode" className="block text-sm font-medium text-[#14213d] mb-1">
              QR Code (or scan with camera)
            </label>
            <input
              id="qrCode"
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Scan QR code or enter manually"
              className="mt-1 block w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-[#14213d] font-medium">OR</span>
            </div>
          </div>

          <div>
            <label htmlFor="identityCode" className="block text-sm font-medium text-[#14213d] mb-1">
              Identity Code (Manual Fallback)
            </label>
            <input
              id="identityCode"
              type="text"
              value={identityCode}
              onChange={(e) => setIdentityCode(e.target.value.toUpperCase())}
              placeholder="e.g., MON-001"
              className="mt-1 block w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>

          <div>
            <label htmlFor="action" className="block text-sm font-medium text-[#14213d] mb-1">
              Action
            </label>
            <select
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value as 'SCAN_IN' | 'SCAN_OUT')}
              className="mt-1 block w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            >
              <option value="SCAN_IN">Scan In</option>
              <option value="SCAN_OUT">Scan Out</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-[#14213d] mb-1">
              Location *
            </label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            >
              <option value="">Select location</option>
              <option value="Floor 1">Floor 1</option>
              <option value="Floor 2">Floor 2</option>
              <option value="Floor 3">Floor 3</option>
            </select>
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-[#14213d] mb-1">
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any notes or remarks..."
              className="mt-1 block w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-[#fca311] px-4 py-2 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#fca311]/90 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scanning...' : 'Scan Item'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/bpo')}
              className="rounded-md border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium text-[#14213d] transition-colors hover:bg-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

