import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface DonationListProps {
  refreshTrigger?: number;
}

const DonationList: React.FC<DonationListProps> = ({ refreshTrigger }) => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchDonations = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "donations"),
        where("donorId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const donationData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      donationData.sort((a: any, b: any) => {
        const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
        const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
      setDonations(donationData);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDonations();
    }
  }, [refreshTrigger, currentUser]);

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
