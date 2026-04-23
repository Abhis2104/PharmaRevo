import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import DeliveryManager from "../components/DeliveryManager";
import MedicinePassport from "../components/MedicinePassport";
import HealthGapIntelligence from "../components/HealthGapIntelligence";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [donations, setDonations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pharmacyStock, setPharmacyStock] = useState<any[]>([]);
  const [companyBatches, setCompanyBatches] = useState<any[]>([]);
  const [approvedSales, setApprovedSales] = useState<any[]>([]);
  const [ngoRequests, setNgoRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPharmacyStock, setSelectedPharmacyStock] = useState<any>(null);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [selectedCompanyBatch, setSelectedCompanyBatch] = useState<any>(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [approvedDonationsTab, setApprovedDonationsTab] = useState("donor");

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/admin-login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch donations
      const donationsSnapshot = await getDocs(collection(db, "donations"));
      const donationsData = donationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDonations(donationsData);

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);

      // Fetch pharmacy stock
      const pharmacyStockSnapshot = await getDocs(collection(db, "pharmacy_stock"));
      const pharmacyStockData = pharmacyStockSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPharmacyStock(pharmacyStockData);

      // Fetch company batches
      const companyBatchesSnapshot = await getDocs(collection(db, "company_batches"));
      const companyBatchesData = companyBatchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompanyBatches(companyBatchesData);

      // Fetch approved sales
      const approvedSalesSnapshot = await getDocs(collection(db, "approved_sales"));
      const approvedSalesData = approvedSalesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApprovedSales(approvedSalesData);

      // Fetch NGO requests
      const ngoRequestsSnapshot = await getDocs(collection(db, "ngo_requests"));
      const ngoRequestsData = ngoRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNgoRequests(ngoRequestsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPassport = async (donation: any, donationId: string) => {
    const passportId = `PP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const donorConsentChain = donation.consentChain && donation.consentChain.length > 0
      ? donation.consentChain
      : [{
          stage: "Donor Consent",
          actor: donation.donorId || "donor",
          actorLabel: "Donor",
          timestamp: donation.createdAt || Date.now(),
          note: "Donor submitted this medicine for ethical redistribution."
        }];
    await addDoc(collection(db, "medicine_passports"), {
      passportId,
      donationId,
      medicineName: donation.medicineName,
      quantity: donation.quantity,
      expiryDate: donation.expiryDate,
      source: donation.source || "individual",
      batchNumber: donation.batchNumber || null,
      donorId: donation.donorId || null,
      status: "Verified",
      createdAt: Date.now(),
      consentChain: donorConsentChain,
      timeline: [
        { action: "Passport Created", timestamp: Date.now(), note: "Medicine donated and passport issued" },
        { action: "Verified by Admin", timestamp: Date.now(), note: "Medicine quality verified by PharmaRevo admin" }
      ]
    });
  };

  const updateDonationStatus = async (donationId: string, status: string) => {
    try {
      const donation = donations.find(d => d.id === donationId);
      await updateDoc(doc(db, "donations", donationId), { status });
      if (status === "Approved" && donation) {
        await createPassport(donation, donationId);
      }
      fetchData();
      alert(`Donation ${status.toLowerCase()} successfully!${status === "Approved" ? " Digital Passport created! 🔏" : ""}`);
    } catch (error) {
      console.error("Error updating donation:", error);
      alert("Error updating donation status");
    }
  };

  const updatePharmacyStockStatus = async (stockId: string, status: string, stockItem: any) => {
    try {
      await updateDoc(doc(db, "pharmacy_stock", stockId), { status });
      
      // If approved, move to appropriate collection
      if (status === "Approved") {
        if (stockItem.isDonation) {
          const newDonation = {
            medicineName: stockItem.medicineName,
            expiryDate: stockItem.expiryDate,
            quantity: stockItem.quantity,
            description: `Donated by pharmacy`,
            imageUrl: "",
            donorId: stockItem.pharmacyId,
            status: "Approved",
            createdAt: new Date().getTime(),
            source: "pharmacy"
          };
          const newDocRef = await addDoc(collection(db, "donations"), newDonation);
          await createPassport(newDonation, newDocRef.id);
        } else {
          // Move to approved sales collection
          await addDoc(collection(db, "approved_sales"), {
            ...stockItem,
            approvedAt: new Date().getTime()
          });
        }
      }
      
      fetchData();
      alert(`Pharmacy stock ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error updating pharmacy stock:", error);
      alert("Error updating pharmacy stock status");
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        fetchData();
        alert("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  const tabs = [
    { id: "overview", label: "📊 Overview", icon: "📊" },
    { id: "users", label: "👥 User Management", icon: "👥" },
    { id: "verification", label: "💊 Medicine Verification", icon: "💊" },
    { id: "pharmacy", label: "🏪 Pharmacy Verification", icon: "🏪" },
    { id: "company", label: "🏢 Company Verification", icon: "🏢" },
    { id: "approved-donations", label: "✅ Approved Donations", icon: "✅" },
    { id: "logistics", label: "🚚 Logistics Management", icon: "🚚" },
    { id: "passports", label: "🔏 Passports", icon: "🔏" },
    { id: "ngo-requests", label: "🏥 NGO Requests", icon: "🏥" },
    { id: "sales", label: "💰 Approved Sales", icon: "💰" },
    { id: "inventory", label: "📦 Inventory Control", icon: "📦" },
    { id: "analytics", label: "📈 Analytics", icon: "📈" },
    { id: "chgi", label: "🧠 Health Gap", icon: "🧠" }
  ];

  const openDetailModal = (donation: any) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedDonation(null);
    setShowDetailModal(false);
  };

  const openPharmacyModal = (stock: any) => {
    setSelectedPharmacyStock(stock);
    setShowPharmacyModal(true);
  };

  const closePharmacyModal = () => {
    setSelectedPharmacyStock(null);
    setShowPharmacyModal(false);
  };

  const openCompanyModal = (batch: any) => {
    setSelectedCompanyBatch(batch);
    setShowCompanyModal(true);
  };

  const closeCompanyModal = () => {
    setSelectedCompanyBatch(null);
    setShowCompanyModal(false);
  };

  const renderDetailModal = () => {
    if (!showDetailModal || !selectedDonation) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Donation Details</h3>
              <button onClick={closeDetailModal} className="text-white hover:text-gray-200">
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Name</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDonation.medicineName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDonation.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDonation.expiryDate}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedDonation.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  selectedDonation.status === "Approved" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {selectedDonation.status}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedDonation.description || 'No description provided'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Address</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDonation.pickupAddress?.address || selectedDonation.pickupAddress || selectedDonation.address || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDonation.pickupAddress?.city || selectedDonation.pickupCity || selectedDonation.city || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pin Code</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDonation.pickupAddress?.pinCode || selectedDonation.pickupPinCode || selectedDonation.pinCode || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Landmark</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDonation.pickupAddress?.landmark || selectedDonation.pickupLandmark || selectedDonation.landmark || 'Not provided'}</p>
              </div>
            </div>
            
            {selectedDonation.imageUrl && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Image</label>
                <img src={selectedDonation.imageUrl} alt="Medicine" className="w-full max-w-md h-48 object-cover rounded-lg" />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDonation.contactNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Submitted Date</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {selectedDonation.createdAt ? new Date(selectedDonation.createdAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Source</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded capitalize">{selectedDonation.source || 'Individual'}</p>
              </div>
            </div>
            
            {selectedDonation.status === "Pending" && (
              <div className="flex space-x-4 pt-4 border-t">
                <button
                  onClick={() => {
                    updateDonationStatus(selectedDonation.id, "Approved");
                    closeDetailModal();
                  }}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => {
                    updateDonationStatus(selectedDonation.id, "Rejected");
                    closeDetailModal();
                  }}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPharmacyModal = () => {
    if (!showPharmacyModal || !selectedPharmacyStock) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Pharmacy Stock Details</h3>
              <button onClick={closePharmacyModal} className="text-white hover:text-gray-200">
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Name</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedPharmacyStock.medicineName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedPharmacyStock.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedPharmacyStock.expiryDate}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedPharmacyStock.isDonation ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                }`}>
                  {selectedPharmacyStock.isDonation ? "Donation" : "Sale"}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Original Price</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">₹{selectedPharmacyStock.originalPrice || 'Not provided'}</p>
              </div>
              {!selectedPharmacyStock.isDonation && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Price</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">₹{selectedPharmacyStock.discountPrice || 'Not provided'}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Address</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedPharmacyStock.pickupAddress || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedPharmacyStock.pickupCity || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pin Code</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedPharmacyStock.pickupPinCode || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Landmark</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedPharmacyStock.pickupLandmark || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedPharmacyStock.contactNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedPharmacyStock.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Submitted Date</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {selectedPharmacyStock.createdAt ? new Date(selectedPharmacyStock.createdAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedPharmacyStock.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  selectedPharmacyStock.status === "Approved" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {selectedPharmacyStock.status}
                </span>
              </div>
            </div>
            
            {selectedPharmacyStock.status === "Pending" && (
              <div className="flex space-x-4 pt-4 border-t">
                <button
                  onClick={() => {
                    updatePharmacyStockStatus(selectedPharmacyStock.id, "Approved", selectedPharmacyStock);
                    closePharmacyModal();
                  }}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => {
                    updatePharmacyStockStatus(selectedPharmacyStock.id, "Rejected", selectedPharmacyStock);
                    closePharmacyModal();
                  }}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCompanyModal = () => {
    if (!showCompanyModal || !selectedCompanyBatch) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Company Batch Details</h3>
              <button onClick={closeCompanyModal} className="text-white hover:text-gray-200">
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Name</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.medicineName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Number</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.batchNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.expiryDate}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Manufacturing Date</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.manufacturingDate || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Donation</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.reason || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Address</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.pickupAddress || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.pickupCity || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pin Code</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.pickupPinCode || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Landmark</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.pickupLandmark || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.contactNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedCompanyBatch.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Submitted Date</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {selectedCompanyBatch.createdAt ? new Date(selectedCompanyBatch.createdAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedCompanyBatch.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  selectedCompanyBatch.status === "Approved" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {selectedCompanyBatch.status}
                </span>
              </div>
            </div>
            
            {selectedCompanyBatch.status === "Pending" && (
              <div className="flex space-x-4 pt-4 border-t">
                <button
                  onClick={() => {
                    updateCompanyBatchStatus(selectedCompanyBatch.id, "Approved", selectedCompanyBatch);
                    closeCompanyModal();
                  }}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => {
                    updateCompanyBatchStatus(selectedCompanyBatch.id, "Rejected", selectedCompanyBatch);
                    closeCompanyModal();
                  }}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Total Donations</h3>
              <p className="text-3xl font-bold">{donations.length}</p>
            </div>
            <div className="text-4xl opacity-80">📦</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Approved</h3>
              <p className="text-3xl font-bold">{donations.filter(d => d.status === "Approved").length}</p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Pending</h3>
              <p className="text-3xl font-bold">{donations.filter(d => d.status === "Pending").length}</p>
            </div>
            <div className="text-4xl opacity-80">⏳</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Pharmacy Stock</h3>
              <p className="text-3xl font-bold">{pharmacyStock.filter(s => s.status === "Pending").length}</p>
            </div>
            <div className="text-4xl opacity-80">🏪</div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {donations.slice(0, 5).map(donation => (
            <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold">{donation.medicineName}</p>
                <p className="text-sm text-gray-600">Quantity: {donation.quantity}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                donation.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                donation.status === "Approved" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {donation.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-bold mb-6">User Management</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-4 font-semibold">Email</th>
              <th className="text-left p-4 font-semibold">Role</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">{user.role}</span>
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Active</span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const getSortedData = (data: any[], sortType: string) => {
    const sorted = [...data];
    switch (sortType) {
      case "recent":
        return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      case "alphabetical":
        return sorted.sort((a, b) => (a.medicineName || "").localeCompare(b.medicineName || ""));
      case "date":
        return sorted.sort((a, b) => new Date(a.expiryDate || 0).getTime() - new Date(b.expiryDate || 0).getTime());
      default:
        return sorted;
    }
  };

  const renderMedicineVerification = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Medicine Verification</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="recent">📅 Most Recent</option>
          <option value="alphabetical">🔤 Alphabetical</option>
          <option value="date">📆 By Expiry Date</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-4 font-semibold">Medicine Name</th>
              <th className="text-left p-4 font-semibold">Expiry Date</th>
              <th className="text-left p-4 font-semibold">Address</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedData(donations, sortBy).map(donation => (
              <tr key={donation.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium">{donation.medicineName}</td>
                <td className="p-4">{donation.expiryDate}</td>
                <td className="p-4">{donation.pickupAddress?.address || donation.pickupAddress || donation.address || 'Not provided'}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    donation.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    donation.status === "Approved" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {donation.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openDetailModal(donation)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      👁️ View Details
                    </button>
                    {donation.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateDonationStatus(donation.id, "Approved")}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => updateDonationStatus(donation.id, "Rejected")}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPharmacyVerification = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Pharmacy Stock Verification</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="recent">📅 Most Recent</option>
          <option value="alphabetical">🔤 Alphabetical</option>
          <option value="date">📆 By Expiry Date</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-4 font-semibold">Medicine Name</th>
              <th className="text-left p-4 font-semibold">Quantity</th>
              <th className="text-left p-4 font-semibold">Type</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedData(pharmacyStock, sortBy).map(stock => (
              <tr key={stock.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium">{stock.medicineName}</td>
                <td className="p-4">{stock.quantity}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    stock.isDonation ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}>
                    {stock.isDonation ? "Donation" : "Sale"}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    stock.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    stock.status === "Approved" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {stock.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openPharmacyModal(stock)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      👁️ View Details
                    </button>
                    {stock.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updatePharmacyStockStatus(stock.id, "Approved", stock)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => updatePharmacyStockStatus(stock.id, "Rejected", stock)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompanyVerification = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Company Batch Verification</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="recent">📅 Most Recent</option>
          <option value="alphabetical">🔤 Alphabetical</option>
          <option value="date">📆 By Expiry Date</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-4 font-semibold">Medicine Name</th>
              <th className="text-left p-4 font-semibold">Batch Number</th>
              <th className="text-left p-4 font-semibold">Quantity</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedData(companyBatches, sortBy).map(batch => (
              <tr key={batch.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium">{batch.medicineName}</td>
                <td className="p-4">{batch.batchNumber}</td>
                <td className="p-4">{batch.quantity}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    batch.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    batch.status === "Approved" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {batch.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openCompanyModal(batch)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      👁️ View Details
                    </button>
                    {batch.status === "Pending" && (
                      <>
                        <button 
                          onClick={() => updateCompanyBatchStatus(batch.id, "Approved", batch)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          ✅ Approve
                        </button>
                        <button 
                          onClick={() => updateCompanyBatchStatus(batch.id, "Rejected", batch)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderApprovedSales = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-bold mb-6">💰 Approved Sales Inventory</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedSales.map(sale => (
          <div key={sale.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 bg-white">
            <h4 className="font-bold text-gray-800 mb-2">{sale.medicineName}</h4>
            <p className="text-gray-600 text-sm mb-1">Expiry: {sale.expiryDate}</p>
            <p className="text-gray-600 text-sm mb-1">Quantity: {sale.quantity}</p>
            <p className="text-gray-600 text-sm mb-1">Original: ₹{sale.originalPrice}</p>
            <p className="text-green-600 text-sm font-semibold mb-3">Sale Price: ₹{sale.discountPrice}</p>
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Available
              </span>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm">
                Manage
              </button>
            </div>
          </div>
        ))}
        {approvedSales.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-gray-600 text-lg">No approved sales yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const updateNgoRequestStatus = async (requestId: string, status: string) => {
    try {
      await updateDoc(doc(db, "ngo_requests", requestId), { status });
      fetchData();
      alert(`NGO request ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error updating NGO request:", error);
      alert("Error updating NGO request status");
    }
  };

  const updateCompanyBatchStatus = async (batchId: string, status: string, batchItem: any) => {
    try {
      await updateDoc(doc(db, "company_batches", batchId), { status });
      
      if (status === "Approved") {
        const newBatchDonation = {
          medicineName: batchItem.medicineName,
          expiryDate: batchItem.expiryDate,
          quantity: batchItem.quantity,
          description: `Company batch donation - ${batchItem.reason}`,
          imageUrl: "",
          pickupAddress: { address: batchItem.pickupAddress, city: batchItem.city, pinCode: batchItem.pinCode, landmark: batchItem.landmark },
          contactNumber: batchItem.contactNumber,
          donorId: batchItem.companyId,
          status: "Approved",
          deliveryStatus: "pending_pickup",
          assignedVolunteerId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          source: "company",
          batchNumber: batchItem.batchNumber,
          manufacturingDate: batchItem.manufacturingDate
        };
        const newDocRef = await addDoc(collection(db, "donations"), newBatchDonation);
        await createPassport(newBatchDonation, newDocRef.id);
      }
      
      fetchData();
      alert(`Company batch ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error updating company batch:", error);
      alert("Error updating company batch status");
    }
  };

  const renderNgoRequests = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">🏥 NGO/Hospital Medicine Requests</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="recent">📅 Most Recent</option>
          <option value="alphabetical">🔤 By Organization</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-4 font-semibold">Organization</th>
              <th className="text-left p-4 font-semibold">Contact</th>
              <th className="text-left p-4 font-semibold">Items Requested</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedData(ngoRequests.map(req => ({...req, medicineName: req.organizationName})), sortBy).map(request => (
              <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{request.organizationName || 'Not provided'}</p>
                    <p className="text-sm text-gray-600">{request.organizationType || 'NGO/Hospital'}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm">{request.contactNumber || 'Not provided'}</p>
                    <p className="text-sm text-gray-600">{request.email || 'Not provided'}</p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm">{request.items?.length || 0} items</p>
                  <p className="text-xs text-gray-600">Total Qty: {request.items?.reduce((sum: number, item: any) => sum + (item.requestedQuantity || 0), 0) || 0}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    request.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    request.status === "Approved" ? "bg-green-100 text-green-800" :
                    request.status === "Rejected" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {request.status || 'Pending'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert(`Request Details:\n\nOrganization: ${request.organizationName}\nContact: ${request.contactNumber}\nEmail: ${request.email}\nAddress: ${request.deliveryAddress}\nCity: ${request.deliveryCity}\nPin: ${request.deliveryPinCode}\n\nItems: ${request.items?.map((item: any) => `${item.medicineName} (${item.requestedQuantity})`).join(', ')}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      👁️ View Details
                    </button>
                    {request.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateNgoRequestStatus(request.id, "Approved")}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => updateNgoRequestStatus(request.id, "Rejected")}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ngoRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏥</div>
            <p className="text-gray-600 text-lg">No NGO requests yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderInventoryControl = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <h4 className="font-bold text-lg mb-2">📦 Available Stock</h4>
          <p className="text-3xl font-bold">{donations.filter(d => d.status === "Approved").length}</p>
          <p className="text-sm opacity-80">Ready for distribution</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <h4 className="font-bold text-lg mb-2">⏳ Pending Verification</h4>
          <p className="text-3xl font-bold">{donations.filter(d => d.status === "Pending").length + pharmacyStock.filter(s => s.status === "Pending").length}</p>
          <p className="text-sm opacity-80">Awaiting approval</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 text-white">
          <h4 className="font-bold text-lg mb-2">❌ Rejected/Disposed</h4>
          <p className="text-3xl font-bold">{donations.filter(d => d.status === "Rejected").length}</p>
          <p className="text-sm opacity-80">Not suitable for use</p>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-bold mb-4">📊 Inventory Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">By Source</h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Individual Donors:</span>
                <span className="font-semibold">{donations.filter(d => !d.source || d.source === "individual").length}</span>
              </li>
              <li className="flex justify-between">
                <span>Pharmacies:</span>
                <span className="font-semibold">{donations.filter(d => d.source === "pharmacy").length}</span>
              </li>
              <li className="flex justify-between">
                <span>Companies:</span>
                <span className="font-semibold">{donations.filter(d => d.source === "company").length}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">By Status</h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Approved:</span>
                <span className="font-semibold text-green-600">{donations.filter(d => d.status === "Approved").length}</span>
              </li>
              <li className="flex justify-between">
                <span>Pending:</span>
                <span className="font-semibold text-yellow-600">{donations.filter(d => d.status === "Pending").length}</span>
              </li>
              <li className="flex justify-between">
                <span>Rejected:</span>
                <span className="font-semibold text-red-600">{donations.filter(d => d.status === "Rejected").length}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApprovedDonations = () => {
    const approvedDonations = donations.filter(d => d.status === "Approved");
    const donorDonations = approvedDonations.filter(d => !d.source || d.source === "individual");
    const pharmacyDonations = approvedDonations.filter(d => d.source === "pharmacy");
    const companyDonations = approvedDonations.filter(d => d.source === "company");
    
    const getCurrentData = () => {
      switch (approvedDonationsTab) {
        case "donor": return donorDonations;
        case "pharmacy": return pharmacyDonations;
        case "company": return companyDonations;
        default: return donorDonations;
      }
    };
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Donor Donations</h3>
                <p className="text-3xl font-bold">{donorDonations.length}</p>
              </div>
              <div className="text-4xl opacity-80">🤝</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pharmacy Donations</h3>
                <p className="text-3xl font-bold">{pharmacyDonations.length}</p>
              </div>
              <div className="text-4xl opacity-80">🏪</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Company Donations</h3>
                <p className="text-3xl font-bold">{companyDonations.length}</p>
              </div>
              <div className="text-4xl opacity-80">🏢</div>
            </div>
          </div>
        </div>
        
        {/* Sub-tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-lg">
          <div className="flex space-x-2">
            <button
              onClick={() => setApprovedDonationsTab("donor")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                approvedDonationsTab === "donor"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              🤝 Donor ({donorDonations.length})
            </button>
            <button
              onClick={() => setApprovedDonationsTab("pharmacy")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                approvedDonationsTab === "pharmacy"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              🏪 Pharmacy ({pharmacyDonations.length})
            </button>
            <button
              onClick={() => setApprovedDonationsTab("company")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                approvedDonationsTab === "company"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              🏢 Company ({companyDonations.length})
            </button>
          </div>
        </div>
        
        {/* Donations Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-bold mb-6">
            {approvedDonationsTab === "donor" && "🤝 Approved Donor Donations"}
            {approvedDonationsTab === "pharmacy" && "🏪 Approved Pharmacy Donations"}
            {approvedDonationsTab === "company" && "🏢 Approved Company Donations"}
          </h3>
          
          {getCurrentData().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {approvedDonationsTab === "donor" && "🤝"}
                {approvedDonationsTab === "pharmacy" && "🏪"}
                {approvedDonationsTab === "company" && "🏢"}
              </div>
              <p className="text-gray-600 text-lg">No approved donations from {approvedDonationsTab}s yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentData().map(donation => (
                <div key={donation.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 bg-white">
                  {donation.imageUrl && (
                    <img
                      src={donation.imageUrl}
                      alt={donation.medicineName}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-bold text-gray-800 mb-2">{donation.medicineName}</h4>
                  <p className="text-gray-600 text-sm mb-1">Expiry: {donation.expiryDate}</p>
                  <p className="text-gray-600 text-sm mb-1">Quantity: {donation.quantity}</p>
                  <p className="text-gray-600 text-sm mb-3">City: {donation.pickupAddress?.city || donation.pickupCity || donation.city}</p>
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      ✅ Available
                    </span>
                    <button 
                      onClick={() => openDetailModal(donation)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <h4 className="font-bold text-lg mb-4">📈 Donation Statistics</h4>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>Total Donations:</span>
              <span className="font-bold text-blue-600">{donations.length}</span>
            </li>
            <li className="flex justify-between">
              <span>Pharmacy Stock:</span>
              <span className="font-bold text-purple-600">{pharmacyStock.length}</span>
            </li>
            <li className="flex justify-between">
              <span>Company Batches:</span>
              <span className="font-bold text-green-600">{companyBatches.length}</span>
            </li>
            <li className="flex justify-between">
              <span>Approved Sales:</span>
              <span className="font-bold text-orange-600">{approvedSales.length}</span>
            </li>
            <li className="flex justify-between border-t pt-2">
              <span>Approval Rate:</span>
              <span className="font-bold text-green-600">
                {donations.length > 0 ? 
                  Math.round((donations.filter(d => d.status === "Approved").length / donations.length) * 100) : 0}%
              </span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <h4 className="font-bold text-lg mb-4">👥 User Statistics</h4>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-bold text-blue-600">{users.length}</span>
            </li>
            <li className="flex justify-between">
              <span>Donors:</span>
              <span className="font-bold text-green-600">{users.filter(u => u.role === "donor").length}</span>
            </li>
            <li className="flex justify-between">
              <span>Pharmacies:</span>
              <span className="font-bold text-purple-600">{users.filter(u => u.role === "pharmacy").length}</span>
            </li>
            <li className="flex justify-between">
              <span>Companies:</span>
              <span className="font-bold text-orange-600">{users.filter(u => u.role === "company").length}</span>
            </li>
            <li className="flex justify-between">
              <span>NGOs/Hospitals:</span>
              <span className="font-bold text-pink-600">{users.filter(u => u.role === "ngo").length}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <h4 className="font-bold text-lg mb-4">🎯 Platform Impact</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <div className="text-3xl mb-2">🌍</div>
            <div className="text-2xl font-bold text-blue-600">{donations.filter(d => d.status === "Approved").length}</div>
            <div className="text-sm text-gray-600">Lives Impacted</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="text-3xl mb-2">♻️</div>
            <div className="text-2xl font-bold text-green-600">{donations.length + pharmacyStock.length}</div>
            <div className="text-sm text-gray-600">Medicines Recycled</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="text-3xl mb-2">🤝</div>
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            <div className="text-sm text-gray-600">Community Members</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
            <div className="text-3xl mb-2">💝</div>
            <div className="text-2xl font-bold text-orange-600">₹{approvedSales.reduce((sum, sale) => sum + (sale.originalPrice || 0), 0)}</div>
            <div className="text-sm text-gray-600">Value Redistributed</div>
          </div>
        </div>
      </div>
    </div>
  );

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
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl">👑</span>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage and verify platform activities</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-lg mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "users" && renderUserManagement()}
            {activeTab === "verification" && renderMedicineVerification()}
            {activeTab === "pharmacy" && renderPharmacyVerification()}
            {activeTab === "company" && renderCompanyVerification()}
            {activeTab === "approved-donations" && renderApprovedDonations()}
            {activeTab === "logistics" && <DeliveryManager />}
            {activeTab === "passports" && <MedicinePassport />}
            {activeTab === "ngo-requests" && renderNgoRequests()}
            {activeTab === "sales" && renderApprovedSales()}
            {activeTab === "inventory" && renderInventoryControl()}
            {activeTab === "analytics" && renderAnalytics()}
            {activeTab === "chgi" && <HealthGapIntelligence />}
          </div>
        )}
      </div>

      {/* Detail Modals */}
      {renderDetailModal()}
      {renderPharmacyModal()}
      {renderCompanyModal()}
    </div>
  );
};

export default AdminDashboard;