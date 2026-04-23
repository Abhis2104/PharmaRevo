import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

interface DonationListProps {
  refreshTrigger?: number;
  user: any;
}

const DonationList: React.FC<DonationListProps> = ({ refreshTrigger, user }) => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "donations"));
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const mine = all.filter(d =>
        d.donorId === user.uid ||
        d.donorId === user.email ||
        (d.donorEmail && d.donorEmail === user.email) ||
        (!d.donorId && !d.donorEmail && d.source === "individual")
      );
      mine.sort((a, b) => {
        const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
        const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setDonations(mine);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user, refreshTrigger]);

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">My Donations</h2>
        <button
          onClick={fetchDonations}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      {loading ? (
        <p className="text-gray-600">Loading donations...</p>
      ) : donations.length === 0 ? (
        <p className="text-gray-600">No donations yet.</p>
      ) : (
        <div className="space-y-3">
          {donations.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.medicineName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {item.medicineName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Expiry: {item.expiryDate}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  item.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : item.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : item.status === "Delivered"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationList;
