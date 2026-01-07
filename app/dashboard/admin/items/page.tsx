'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import apiClient, { extractApiData } from '@/lib/api-client';

export default function AdminItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    qrCode: '',
    identityCode: '',
    itemType: '',
    status: 'available',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await apiClient.get('/api/items');
      const data = extractApiData(response);
      setItems(data.items || []);
    } catch (error: any) {
      console.error('Error fetching items:', error);
      alert(error.response?.data?.error || error.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/api/items', formData);
      setShowForm(false);
      setFormData({ qrCode: '', identityCode: '', itemType: '', status: 'available' });
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#000000]">Items</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-[#fca311] px-4 py-2 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#fca311]/90 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2"
        >
          + Add Item
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setFormData({ qrCode: '', identityCode: '', itemType: '', status: 'available' });
        }}
        title="Create New Item"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">QR Code</label>
            <input
              type="text"
              value={formData.qrCode}
              onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
              required
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Identity Code</label>
            <input
              type="text"
              value={formData.identityCode}
              onChange={(e) => setFormData({ ...formData, identityCode: e.target.value.toUpperCase() })}
              required
              placeholder="e.g., MON-001"
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#14213d] mb-1">Item Type</label>
            <select
              value={formData.itemType}
              onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
              required
              className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm text-[#000000] focus:border-[#fca311] focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-1"
            >
              <option value="">Select type</option>
              <option value="Headset">Headset</option>
              <option value="Monitor">Monitor</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Mouse">Mouse</option>
              <option value="System Unit">System Unit</option>
              <option value="AVR">AVR</option>
              <option value="UPS">UPS</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ qrCode: '', identityCode: '', itemType: '', status: 'available' });
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
              {loading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#fca311] border-t-transparent mx-auto"></div>
          <p className="text-[#14213d] font-medium">Loading items...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#e5e5e5]">
            <thead className="bg-[#14213d]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  QR Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Identity Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] bg-white">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#14213d]">
                    No items found. Create your first item to get started.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#e5e5e5]/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#000000]">
                      {item.qrCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#000000]">
                      {item.identityCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#14213d]">{item.itemType}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.status === 'assigned'
                            ? 'bg-[#fca311]/20 text-[#fca311]'
                            : item.status === 'available'
                            ? 'bg-[#14213d]/10 text-[#14213d]'
                            : 'bg-[#e5e5e5] text-[#000000]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#14213d]">
                      {item.assignedUserId?.name || '-'}
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

