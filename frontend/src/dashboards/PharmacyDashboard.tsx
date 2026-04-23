import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import ShortageAlerts from "../components/ShortageAlerts";

const PharmacyDashboard = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [myStock, setMyStock] = useState<any[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Upload Stock Form State
  const [medicineName, setMedicineName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [isDonation, setIsDonation] = useState(false);
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
        const myStockQuery = query(
          collection(db, "pharmacy_stock"),
          where("pharmacyId", "==", auth.currentUser.uid)
        );
        const myStockSnapshot = await getDocs(myStockQuery);
        const myStockData = myStockSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMyStock(myStockData);
      }

      const availableQuery = query(
        collection(db, "donations"),
        where("status", "==", "Approved")
      );
      const availableSnapshot = await getDocs(availableQuery);
      const availableData = availableSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableMedicines(availableData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadStock = async (e: React.FormEvent) => {
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
      await addDoc(collection(db, "pharmacy_stock"), {
        medicineName: medicineName.trim(),
        expiryDate,
        quantity: Number(quantity),
        originalPrice: Number(originalPrice),
        discountPrice: isDonation ? 0 : Number(discountPrice),
        isDonation,
        pickupAddress: pickupAddress.trim(),
        city: city.trim(),
        pinCode: pinCode.trim(),
        landmark: landmark.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
        pharmacyId: auth.currentUser.uid,
        status: "Pending",
        createdAt: new Date().getTime(),
      });

      setMedicineName("");
      setExpiryDate("");
      setQuantity("");
      setOriginalPrice("");
      setDiscountPrice("");
      setIsDonation(false);
      setPickupAddress("");
      setCity("");
      setPinCode("");
      setLandmark("");
      setContactNumber("");
      setEmail("");

      alert("Stock uploaded successfully!");
      fetchData();
    } catch (error) {
      console.error("Error uploading stock:", error);
      alert("Error uploading stock");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "upload", label: "📋 Upload Stock", icon: "📋" },
    { id: "status", label: "🔍 Verification Status", icon: "🔍" },
    { id: "medicines", label: "💰 Available Medicines", icon: "💰" },
    { id: "reports", label: "📊 Reports", icon: "📊" },
    { id: "alerts", label: "🚨 Shortage Alerts", icon: "🚨" }
  ];

  const renderUploadStock = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Upload Your Stock</h3>
        <p className="text-blue-100">Add medicines to help others and earn revenue</p>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <form onSubmit={handleUploadStock} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                required
                min="0"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter original price"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDonation}
                  onChange={(e) => setIsDonation(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 font-semibold text-gray-700">Donate for Free</span>
              </label>
            </div>
            {!isDonation && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Price (₹)</label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  required={!isDonation}
                  min="0"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter discount price"
                />
              </div>
            )}
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
            {loading ? "Uploading..." : "Upload Stock"}
          </button>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return renderUploadStock();
      case "status":
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Verification Status</h3>
            <div className="space-y-4">
              {myStock.map(item => (
                <div key={item.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.medicineName}</h4>
                      <p className="text-gray-600">Expiry: {item.expiryDate} | Qty: {item.quantity}</p>
                      <p className="text-gray-600">{item.isDonation ? "Donation" : `₹${item.discountPrice}`}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      item.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      item.status === "Approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
              {myStock.length === 0 && (
                <p className="text-gray-600 text-center py-8">No stock uploaded yet.</p>
              )}
            </div>
          </div>
        );
      case "medicines":
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Available Medicines for Purchase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableMedicines.map(medicine => (
                <div key={medicine.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                  {medicine.imageUrl && (
                    <img
                      src={medicine.imageUrl}
                      alt={medicine.medicineName}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-bold text-gray-800 mb-2">{medicine.medicineName}</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Expiry: {medicine.expiryDate} | Qty: {medicine.quantity}
                  </p>
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                    Request Medicine
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Total Uploaded</h4>
                <p className="text-3xl font-bold">{myStock.length}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Approved</h4>
                <p className="text-3xl font-bold">{myStock.filter(s => s.status === "Approved").length}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Pending</h4>
                <p className="text-3xl font-bold">{myStock.filter(s => s.status === "Pending").length}</p>
              </div>
            </div>
          </div>
        );
      case "alerts":
        return <ShortageAlerts role="pharmacy" />;
      default:
        return null;
    }
  };

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
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">🏪</span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pharmacy Dashboard
              </h1>
              <p className="text-gray-600">Manage your medicine inventory</p>
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
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
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

export default PharmacyDashboard;