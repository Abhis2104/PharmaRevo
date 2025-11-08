import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState("batch");
  const [myBatches, setMyBatches] = useState<any[]>([]);
  const [redistributions, setRedistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Batch Upload Form State
  const [batchNumber, setBatchNumber] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [reason, setReason] = useState("surplus");
  const [pickupAddress, setPickupAddress] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        const batchQuery = query(
          collection(db, "company_batches"),
          where("companyId", "==", auth.currentUser.uid)
        );
        const batchSnapshot = await getDocs(batchQuery);
        const batchData = batchSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMyBatches(batchData);

        const redistQuery = query(
          collection(db, "redistributions"),
          where("companyId", "==", auth.currentUser.uid)
        );
        const redistSnapshot = await getDocs(redistQuery);
        const redistData = redistSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRedistributions(redistData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    // Validate contact number
    if (!/^[0-9]{10}$/.test(contactNumber)) {
      alert("Please enter a valid 10-digit contact number");
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "company_batches"), {
        batchNumber: batchNumber.trim(),
        medicineName: medicineName.trim(),
        expiryDate,
        manufacturingDate,
        quantity: Number(quantity),
        reason,
        pickupAddress: pickupAddress.trim(),
        city: city.trim(),
        pinCode: pinCode.trim(),
        landmark: landmark.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
        companyId: auth.currentUser.uid,
        status: "Pending",
        createdAt: new Date().getTime(),
      });

      setBatchNumber("");
      setMedicineName("");
      setExpiryDate("");
      setManufacturingDate("");
      setQuantity("");
      setReason("surplus");
      setPickupAddress("");
      setCity("");
      setPinCode("");
      setLandmark("");
      setContactNumber("");
      setEmail("");

      alert("Batch uploaded successfully!");
      fetchData();
    } catch (error) {
      console.error("Error uploading batch:", error);
      alert("Error uploading batch");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "batch", label: "🏭 Add Batch Stock", icon: "🏭" },
    { id: "redistribution", label: "🔁 Track Redistribution", icon: "🔁" },
    { id: "disposal", label: "♻️ Disposal Request", icon: "♻️" },
    { id: "csr", label: "📈 CSR Analytics", icon: "📈" },
    { id: "invoices", label: "🧾 Invoices", icon: "🧾" }
  ];

  const renderBatchStock = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Add Batch Stock</h3>
        <p className="text-blue-100">Upload surplus or return batches for redistribution</p>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <form onSubmit={handleBatchUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter batch number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name</label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter medicine name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturing Date</label>
              <input
                type="date"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
              <p className="text-xs text-blue-600 mt-1 flex items-start">
                <span className="mr-1">💬</span>
                Check the expiry date printed near MFG or EXP on the strip or carton. If unclear, upload a clear photo and our verification team will confirm it.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="surplus">Surplus Stock</option>
                <option value="return">Batch Return</option>
                <option value="near-expiry">Near Expiry</option>
                <option value="damaged">Damaged Packaging</option>
              </select>
            </div>
          </div>

          {/* Address Fields */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-700 mb-3">📍 Pickup Address</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Address</label>
                <textarea
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  required
                  rows={2}
                  placeholder="Enter complete pickup address"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="Enter city"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pin Code</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    required
                    placeholder="Enter pin code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Enter nearby landmark"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="Enter 10-digit contact number"
                    maxLength={10}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter email address"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? "Uploading..." : "Upload Batch"}
          </button>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "batch":
        return renderBatchStock();
      case "redistribution":
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold mb-6">Track Redistribution</h3>
            <div className="space-y-4">
              {redistributions.map(item => (
                <div key={item.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.medicineName}</h4>
                      <p className="text-gray-600">Batch: {item.batchNumber}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-gray-600">Recipient: {item.recipientType}</p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Redistributed
                    </span>
                  </div>
                </div>
              ))}
              {redistributions.length === 0 && (
                <p className="text-gray-600 text-center py-8">No redistributions yet.</p>
              )}
            </div>
          </div>
        );
      case "disposal":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
              <h4 className="font-bold text-xl mb-2">Schedule Pickup for Expired Items</h4>
              <p className="text-yellow-100 mb-4">Request pickup for expired or damaged medicines for safe disposal.</p>
              <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-all duration-300 font-semibold">
                Create Disposal Request
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h4 className="font-bold text-lg mb-4">Items Needing Disposal</h4>
              <div className="space-y-4">
                {myBatches.filter(batch => batch.reason === "damaged" || new Date(batch.expiryDate) < new Date()).map(batch => (
                  <div key={batch.id} className="border-2 border-red-100 bg-red-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-red-800">{batch.medicineName}</h4>
                        <p className="text-red-600">Batch: {batch.batchNumber}</p>
                        <p className="text-red-600">Status: Needs Disposal</p>
                      </div>
                      <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                        Schedule Pickup
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "csr":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Total Donations</h4>
                <p className="text-3xl font-bold">{myBatches.length}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Medicines Redistributed</h4>
                <p className="text-3xl font-bold">{redistributions.length}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Environmental Impact</h4>
                <p className="text-3xl font-bold">{myBatches.reduce((sum, batch) => sum + batch.quantity, 0)} units</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Social Impact</h4>
                <p className="text-3xl font-bold">High</p>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h4 className="font-bold text-lg mb-4">CSR Impact Summary</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Prevented {myBatches.length} medicine batches from going to waste</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Helped provide medicines to {redistributions.length} beneficiaries</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Reduced environmental pollution through proper disposal</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Enhanced company's social responsibility profile</li>
              </ul>
            </div>
          </div>
        );
      case "invoices":
        return (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold mb-6">Invoices / Payments</h3>
              <div className="space-y-4">
                <div className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">Disposal Fee - Batch #001</h4>
                      <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹500</p>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Paid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
              <h4 className="font-bold text-lg mb-4">Payment Summary</h4>
              <div className="space-y-2">
                <p>Total Disposal Fees: ₹500</p>
                <p>Donation Tax Benefits: ₹2,000</p>
                <p className="text-xl font-bold">Net CSR Investment: -₹1,500 (Savings)</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">🏭</span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Company Dashboard
              </h1>
              <p className="text-gray-600">Manage pharmaceutical batches and CSR impact</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-4 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg"
                  : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-md"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default CompanyDashboard;