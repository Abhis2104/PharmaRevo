import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import AddDonationForm from "../components/AddDonationForm";
import DonationList from "../components/DonationList";
import ShortageAlerts from "../components/ShortageAlerts";

const PICKUP_STEPS = [
  { key: 'pending_pickup',   label: 'Approved',          icon: '✅' },
  { key: 'picked_up',        label: 'Picked Up',         icon: '📦' },
  { key: 'packed',           label: 'Packed',            icon: '🗃️' },
  { key: 'out_for_delivery', label: 'Out for Delivery',  icon: '🚚' },
  { key: 'delivered',        label: 'Delivered',         icon: '🎉' },
];

const PickupTracker: React.FC<{ status: string }> = ({ status }) => {
  const currentIdx = PICKUP_STEPS.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-1 flex-wrap mt-3">
      {PICKUP_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                done ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'
              } ${active ? 'ring-2 ring-green-300 scale-110' : ''}`}>
                {done ? step.icon : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <span className={`text-xs mt-0.5 text-center max-w-[64px] leading-tight ${
                done ? 'text-green-700 font-semibold' : 'text-gray-400'
              }`}>{step.label}</span>
            </div>
            {i < PICKUP_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[10px] mb-4 ${i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<"donations" | "alerts">("donations");
  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/signin');
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  const handleDonationAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchMyDonations(user);
  };

  const fetchMyDonations = async (u: any) => {
    if (!u) return;
    setDonationsLoading(true);
    try {
      const snap = await getDocs(collection(db, "donations"));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const mine = all.filter(d =>
        d.donorId === u.uid || d.donorId === u.email ||
        (d.donorEmail && d.donorEmail === u.email) ||
        (!d.donorId && !d.donorEmail && d.source === "individual")
      );
      mine.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMyDonations(mine);
    } catch (e) { console.error(e); }
    setDonationsLoading(false);
  };

  useEffect(() => { if (user) fetchMyDonations(user); }, [user, refreshTrigger]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl">🤝</span>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Donor Dashboard
                </h1>
                <p className="text-gray-600">Make a difference by donating medicines</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={async () => {
              try {
                await auth.signOut();
                localStorage.clear();
                navigate('/');
              } catch (error) {
                console.error('Logout error:', error);
                localStorage.clear();
                navigate('/');
              }
            }}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Donations</p>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📦</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600">8</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Lives Impacted</p>
                <p className="text-3xl font-bold text-purple-600">24</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">❤️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-3 mb-8">
          {(["donations", "alerts"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 capitalize ${
                activeTab === t
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-md"
              }`}>
              {t === "donations" ? "📋 My Donations" : "🚨 Shortage Alerts"}
            </button>
          ))}
        </div>

        {activeTab === "alerts" ? (
          <ShortageAlerts role="donor" />
        ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Add Donation Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📦</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add New Donation</h2>
                  <p className="text-blue-100 text-sm">Share your unused medicines</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <AddDonationForm onDonationAdded={handleDonationAdded} />
            </div>
          </div>

          {/* Donation List with Pickup Tracker */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">My Donations</h2>
                    <p className="text-purple-100 text-sm">Track pickup status</p>
                  </div>
                </div>
                <button onClick={() => fetchMyDonations(user)} className="bg-white/20 text-white px-3 py-1 rounded-lg text-sm hover:bg-white/30">🔄 Refresh</button>
              </div>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {donationsLoading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
              ) : myDonations.length === 0 ? (
                <div className="text-center py-8 text-gray-500"><div className="text-4xl mb-2">📦</div><p>No donations yet.</p></div>
              ) : myDonations.map(donation => {
                const status = donation.deliveryStatus || 'pending_pickup';
                const statusLabel: Record<string,string> = { pending_pickup:'Pending Pickup', picked_up:'Picked Up', packed:'Packed', out_for_delivery:'Out for Delivery', delivered:'Delivered' };
                return (
                  <div key={donation.id} className={`border-2 rounded-xl p-4 ${
                    donation.status === 'Approved' ? 'border-green-100' :
                    donation.status === 'Rejected' ? 'border-red-100 bg-red-50' : 'border-gray-100'
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-bold text-gray-800">{donation.medicineName}</h3>
                        <p className="text-xs text-gray-500">Expiry: {donation.expiryDate} | Qty: {donation.quantity}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          donation.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          donation.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{donation.status}</span>
                        {donation.status === 'Approved' && <span className="text-xs text-blue-600 font-medium">{statusLabel[status] || status}</span>}
                      </div>
                    </div>
                    {donation.status === 'Approved' && <PickupTracker status={status} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        )}

        {/* Impact Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">Your Impact</h3>
            <p className="text-blue-100 text-lg">Every donation makes a difference in someone's life</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🌍</div>
              <div className="text-2xl font-bold">Global Reach</div>
              <div className="text-blue-100 text-sm">Worldwide Impact</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">♻️</div>
              <div className="text-2xl font-bold">Eco-Friendly</div>
              <div className="text-blue-100 text-sm">Reduce Waste</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🤝</div>
              <div className="text-2xl font-bold">Community</div>
              <div className="text-blue-100 text-sm">Help Others</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💝</div>
              <div className="text-2xl font-bold">Gratitude</div>
              <div className="text-blue-100 text-sm">Lives Saved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;