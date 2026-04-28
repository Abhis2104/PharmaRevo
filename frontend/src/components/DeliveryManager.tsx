import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// ─── Status Definitions ───────────────────────────────────────────────────────

const PICKUP_STEPS = [
  { key: 'pending_pickup',      label: 'Pending Pickup',      icon: '⏳' },
  { key: 'picked_up',           label: 'Picked Up',           icon: '📦' },
  { key: 'packed',              label: 'Packed',              icon: '🗃️' },
  { key: 'out_for_delivery',    label: 'Out for Delivery',    icon: '🚚' },
  { key: 'delivered',           label: 'Delivered',           icon: '✅' },
];

const DROP_STEPS = [
  { key: 'pending_dispatch',    label: 'Pending Dispatch',    icon: '⏳' },
  { key: 'packed',              label: 'Packed',              icon: '🗃️' },
  { key: 'shipped',             label: 'Shipped',             icon: '📮' },
  { key: 'out_for_delivery',    label: 'Out for Delivery',    icon: '🚚' },
  { key: 'delivered',           label: 'Delivered',           icon: '✅' },
];

const nextPickupStatus: Record<string, string> = {
  pending_pickup:   'picked_up',
  picked_up:        'packed',
  packed:           'out_for_delivery',
  out_for_delivery: 'delivered',
};

const nextDropStatus: Record<string, string> = {
  pending_dispatch: 'packed',
  packed:           'shipped',
  shipped:          'out_for_delivery',
  out_for_delivery: 'delivered',
};

// ─── Status Tracker UI ────────────────────────────────────────────────────────

const StatusTracker: React.FC<{ steps: typeof PICKUP_STEPS; current: string }> = ({ steps, current }) => {
  const currentIdx = steps.findIndex(s => s.key === current);
  return (
    <div className="flex items-center gap-1 flex-wrap mt-2">
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className={`flex flex-col items-center`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                done ? 'bg-green-500 border-green-500 text-white' :
                'bg-gray-100 border-gray-300 text-gray-400'
              } ${active ? 'ring-2 ring-green-300 scale-110' : ''}`}>
                {done ? step.icon : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <span className={`text-xs mt-0.5 text-center max-w-[60px] leading-tight ${done ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[12px] mb-4 ${i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DeliveryManager: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [ngoRequests, setNgoRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pickup' | 'drop'>('pickup');
  const [pickupFilter, setPickupFilter] = useState<'all' | 'individual' | 'pharmacy' | 'company'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    // Live listener for approved donations
    const unsubDonations = onSnapshot(
      query(collection(db, 'donations'), where('status', '==', 'Approved')),
      snap => setDonations(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    fetchNgoRequests();
    return () => unsubDonations();
  }, []);

  const fetchNgoRequests = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'ngo_requests'), where('status', '==', 'Approved')));
      setNgoRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const advancePickup = async (donationId: string, currentStatus: string) => {
    const next = nextPickupStatus[currentStatus];
    if (!next) return;
    setUpdating(donationId);
    try {
      await updateDoc(doc(db, 'donations', donationId), {
        deliveryStatus: next,
        updatedAt: Date.now(),
        ...(next === 'delivered' ? { deliveredAt: Date.now() } : {}),
      });
    } catch (e) { alert('Error updating status'); }
    setUpdating(null);
  };

  const advanceDrop = async (requestId: string, currentStatus: string) => {
    const next = nextDropStatus[currentStatus];
    if (!next) return;
    setUpdating(requestId);
    try {
      await updateDoc(doc(db, 'ngo_requests', requestId), {
        deliveryStatus: next,
        updatedAt: Date.now(),
        ...(next === 'delivered' ? { deliveredAt: Date.now() } : {}),
      });
      // Refresh
      fetchNgoRequests();
    } catch (e) { alert('Error updating status'); }
    setUpdating(null);
  };

  // ── Pickup Tab ──────────────────────────────────────────────────────────────

  const filteredDonations = donations.filter(d => {
    if (pickupFilter === 'all') return true;
    if (pickupFilter === 'individual') return !d.source || d.source === 'individual';
    return d.source === pickupFilter;
  });

  const renderPickup = () => (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All', count: donations.length },
          { key: 'individual', label: '🤝 Donor', count: donations.filter(d => !d.source || d.source === 'individual').length },
          { key: 'pharmacy', label: '🏪 Pharmacy', count: donations.filter(d => d.source === 'pharmacy').length },
          { key: 'company', label: '🏢 Company', count: donations.filter(d => d.source === 'company').length },
        ].map(f => (
          <button key={f.key} onClick={() => setPickupFilter(f.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pickupFilter === f.key ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {filteredDonations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-3">📦</div>
          <p>No approved donations pending pickup.</p>
        </div>
      ) : (
        filteredDonations.map(donation => {
          const status = donation.deliveryStatus || 'pending_pickup';
          const isDone = status === 'delivered';
          const next = nextPickupStatus[status];
          return (
            <div key={donation.id} className={`border-2 rounded-2xl p-5 transition-all ${isDone ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white hover:shadow-md'}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-800 text-lg">{donation.medicineName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      donation.source === 'pharmacy' ? 'bg-purple-100 text-purple-700' :
                      donation.source === 'company' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {donation.source === 'pharmacy' ? '🏪 Pharmacy' : donation.source === 'company' ? '🏢 Company' : '🤝 Donor'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    📍 {donation.pickupAddress?.address || donation.address || 'N/A'}, {donation.pickupAddress?.city || donation.city || ''} — {donation.pickupAddress?.pinCode || donation.pinCode || ''}
                  </p>
                  <p className="text-sm text-gray-500">📦 Qty: {donation.quantity} | 📅 Expiry: {donation.expiryDate}</p>
                  <StatusTracker steps={PICKUP_STEPS} current={status} />
                </div>
                <div className="flex flex-col gap-2 min-w-[160px]">
                  {!isDone && next && (
                    <button
                      onClick={() => advancePickup(donation.id, status)}
                      disabled={updating === donation.id}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {updating === donation.id ? 'Updating...' : `→ Mark as ${PICKUP_STEPS.find(s => s.key === next)?.label}`}
                    </button>
                  )}
                  {isDone && <span className="text-green-600 font-semibold text-sm text-center">✅ Pickup Complete</span>}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  // ── Drop Tab ────────────────────────────────────────────────────────────────

  const renderDrop = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{ngoRequests.length} approved NGO requests</p>
        <button onClick={fetchNgoRequests} className="text-sm text-blue-600 hover:underline">🔄 Refresh</button>
      </div>

      {ngoRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-3">🚚</div>
          <p>No approved NGO requests for delivery.</p>
          <p className="text-xs mt-1">Approve NGO requests from the NGO Requests tab first.</p>
        </div>
      ) : (
        ngoRequests.map(request => {
          const status = request.deliveryStatus || 'pending_dispatch';
          const isDone = status === 'delivered';
          const next = nextDropStatus[status];
          return (
            <div key={request.id} className={`border-2 rounded-2xl p-5 transition-all ${isDone ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white hover:shadow-md'}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-800 text-lg">{request.organizationName}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-pink-100 text-pink-700">
                      🏥 {request.organizationType || 'NGO'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    📍 {request.deliveryAddress || 'N/A'}, {request.deliveryCity || ''} — {request.deliveryPinCode || ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    📋 {request.items?.length || 0} medicines | 📞 {request.contactNumber || 'N/A'}
                  </p>
                  {request.items?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Items: {request.items.map((i: any) => i.medicineName).join(', ')}
                    </p>
                  )}
                  <StatusTracker steps={DROP_STEPS} current={status} />
                </div>
                <div className="flex flex-col gap-2 min-w-[160px]">
                  {!isDone && next && (
                    <button
                      onClick={() => advanceDrop(request.id, status)}
                      disabled={updating === request.id}
                      className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {updating === request.id ? 'Updating...' : `→ Mark as ${DROP_STEPS.find(s => s.key === next)?.label}`}
                    </button>
                  )}
                  {isDone && <span className="text-green-600 font-semibold text-sm text-center">✅ Delivered</span>}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">🚚 Logistics Management</h2>
        <p className="text-blue-100 text-sm">Track and advance pickup & delivery status for all medicines</p>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">{donations.length} Pickups</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">{ngoRequests.length} Drops</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button onClick={() => setActiveTab('pickup')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'pickup' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'}`}>
          📦 Pickup Operations ({donations.length})
        </button>
        <button onClick={() => setActiveTab('drop')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'drop' ? 'bg-pink-600 text-white shadow-lg' : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'}`}>
          🚚 Drop Operations ({ngoRequests.length})
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        {activeTab === 'pickup' ? renderPickup() : renderDrop()}
      </div>
    </div>
  );
};

export default DeliveryManager;
