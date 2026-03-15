import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import PassportScanner from "../components/PassportScanner";

const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [availableMedicines, setAvailableMedicines] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myPassports, setMyPassports] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileData, setProfileData] = useState({
    organizationName: "",
    organizationType: "NGO",
    contactNumber: "",
    email: "",
    address: "",
    city: "",
    pinCode: "",
    registrationNumber: "",
    contactPerson: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const medicinesQuery = query(
        collection(db, "donations"),
        where("status", "==", "Approved")
      );
      const medicinesSnapshot = await getDocs(medicinesQuery);
      const medicinesData = medicinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableMedicines(medicinesData);

      if (auth.currentUser) {
        const requestsQuery = query(
          collection(db, "ngo_requests"),
          where("ngoId", "==", auth.currentUser.uid)
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        setMyRequests(requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const passportsQuery = query(
          collection(db, "medicine_passports"),
          where("ngoId", "==", auth.currentUser.uid)
        );
        const passportsSnapshot = await getDocs(passportsQuery);
        setMyPassports(passportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (medicine: any) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, requestedQuantity: item.requestedQuantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, requestedQuantity: 1 }]);
    }
    alert("Added to cart!");
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter(item => item.id !== medicineId));
  };

  const submitRequest = async () => {
    if (!auth.currentUser || cart.length === 0) return;

    // Check if profile is complete
    if (!profileData.organizationName || !profileData.contactNumber || !profileData.email || !profileData.address) {
      alert("Please complete your profile first before submitting requests!");
      setActiveTab("profile");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "ngo_requests"), {
        ngoId: auth.currentUser.uid,
        items: cart,
        status: "Pending",
        requestDate: new Date().getTime(),
        totalItems: cart.length,
        // Contact information
        organizationName: profileData.organizationName,
        organizationType: profileData.organizationType,
        contactNumber: profileData.contactNumber,
        email: profileData.email,
        deliveryAddress: profileData.address,
        deliveryCity: profileData.city,
        deliveryPinCode: profileData.pinCode,
        registrationNumber: profileData.registrationNumber,
        contactPerson: profileData.contactPerson
      });

      setCart([]);
      alert("Request submitted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!auth.currentUser) return;

    // Validate required fields
    if (!profileData.organizationName || !profileData.contactNumber || !profileData.email) {
      alert("Please fill all required fields!");
      return;
    }

    // Validate contact number
    if (!/^[0-9]{10}$/.test(profileData.contactNumber)) {
      alert("Please enter a valid 10-digit contact number");
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "ngo_profiles"), {
        userId: auth.currentUser.uid,
        ...profileData,
        updatedAt: new Date().getTime()
      });
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Organization Profile</h3>
        <p className="text-indigo-100">Complete your profile for medicine requests</p>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
            <input
              type="text"
              value={profileData.organizationName}
              onChange={(e) => setProfileData({...profileData, organizationName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter organization name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
            <select
              value={profileData.organizationType}
              onChange={(e) => setProfileData({...profileData, organizationType: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="NGO">NGO</option>
              <option value="Hospital">Hospital</option>
              <option value="Clinic">Clinic</option>
              <option value="Community Center">Community Center</option>
              <option value="Charitable Trust">Charitable Trust</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
            <input
              type="text"
              value={profileData.contactPerson}
              onChange={(e) => setProfileData({...profileData, contactPerson: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter contact person name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
            <input
              type="tel"
              value={profileData.contactNumber}
              onChange={(e) => setProfileData({...profileData, contactNumber: e.target.value.replace(/\D/g, '')})}
              maxLength={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter 10-digit contact number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
            <input
              type="text"
              value={profileData.registrationNumber}
              onChange={(e) => setProfileData({...profileData, registrationNumber: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter registration/license number"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address *</label>
          <textarea
            value={profileData.address}
            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            placeholder="Enter complete address for medicine delivery"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={profileData.city}
              onChange={(e) => setProfileData({...profileData, city: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter city"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
            <input
              type="text"
              value={profileData.pinCode}
              onChange={(e) => setProfileData({...profileData, pinCode: e.target.value.replace(/\D/g, '')})}
              maxLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter 6-digit pin code"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveProfile}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Note:</span> Complete profile information is required to submit medicine requests. This helps admin contact you for delivery coordination.
          </p>
        </div>
      </div>
    </div>
  );

  const filteredMedicines = availableMedicines.filter(medicine =>
    medicine.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: "profile", label: "👤 Profile", icon: "👤" },
    { id: "search", label: "🔎 Search Medicines", icon: "🔎" },
    { id: "cart", label: "🛒 Request Cart", icon: "🛒" },
    { id: "status", label: "✅ Request Status", icon: "✅" },
    { id: "passport", label: "🔏 Scan Passport", icon: "🔏" },
    { id: "mypassports", label: "🔒 My Passports", icon: "🔒" },
    { id: "reports", label: "🧾 Usage Reports", icon: "🧾" },
    { id: "support", label: "💬 Support", icon: "💬" }
  ];

  const renderSearchMedicines = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Search Medicines</h3>
        <p className="text-blue-100">Find available medicines for your organization</p>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search medicines by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map(medicine => (
            <div key={medicine.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 bg-white">
              {medicine.imageUrl && (
                <img
                  src={medicine.imageUrl}
                  alt={medicine.medicineName}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <h4 className="font-bold text-gray-800 mb-2">{medicine.medicineName}</h4>
              <p className="text-gray-600 text-sm mb-1">Expiry: {medicine.expiryDate}</p>
              <p className="text-gray-600 text-sm mb-1">Available: {medicine.quantity}</p>
              <p className="text-green-600 text-sm font-semibold mb-3">Status: {medicine.status}</p>
              <button
                onClick={() => addToCart(medicine)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
        
        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">
              {searchTerm ? "No medicines found matching your search." : "No medicines available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Request Cart</h3>
        <p className="text-green-100">Review and submit your medicine requests</p>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-600 text-lg">Your cart is empty.</p>
            <p className="text-gray-500">Add medicines from the search page to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.medicineName}</h4>
                    <p className="text-gray-600">Expiry: {item.expiryDate}</p>
                    <p className="text-gray-600">Requested: {item.requestedQuantity}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <span className="text-xl font-bold text-gray-800">Total Items: {cart.length}</span>
                <button
                  onClick={submitRequest}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfile();
      case "search":
        return renderSearchMedicines();
      case "cart":
        return renderCart();
      case "status":
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold mb-6">Request Status</h3>
            <div className="space-y-4">
              {myRequests.map(request => (
                <div key={request.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                      <h4 className="font-bold text-gray-800">Request #{request.id.slice(-6)}</h4>
                      <p className="text-gray-600">Date: {new Date(request.requestDate).toLocaleDateString()}</p>
                      <p className="text-gray-600">Items: {request.totalItems}</p>
                      <div className="mt-2">
                        <h5 className="font-semibold text-sm text-gray-700">Requested Medicines:</h5>
                        <ul className="text-sm text-gray-600 mt-1">
                          {request.medicines?.map((med: any, index: number) => (
                            <li key={index}>• {med.medicineName} (Qty: {med.requestedQuantity})</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      request.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      request.status === "Approved" ? "bg-green-100 text-green-800" :
                      request.status === "Delivered" ? "bg-blue-100 text-blue-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {myRequests.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600 text-lg">No requests submitted yet.</p>
                </div>
              )}
            </div>
          </div>
        );
      case "passport":
        return (
          <PassportScanner
            ngoName={profileData.organizationName || "NGO"}
            ngoId={auth.currentUser?.uid || ""}
          />
        );
      case "mypassports":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-1">🔒 My Passport History</h3>
              <p className="text-gray-300">All medicine passports confirmed and locked by your organization</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Distributed", status: "Distributed", color: "from-purple-500 to-indigo-500", icon: "📦" },
                { label: "Completed", status: "Completed", color: "from-green-500 to-emerald-500", icon: "🎉" },
                { label: "Disposed", status: "Disposed", color: "from-red-500 to-pink-500", icon: "🗑️" }
              ].map(s => (
                <div key={s.status} className={`bg-gradient-to-r ${s.color} rounded-2xl p-4 text-white text-center`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold">{myPassports.filter(p => p.status === s.status).length}</div>
                  <div className="text-sm opacity-90">{s.label}</div>
                </div>
              ))}
            </div>

            {myPassports.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-white/20 shadow-lg text-center">
                <div className="text-6xl mb-4">🔏</div>
                <p className="text-gray-600 text-lg">No passports yet.</p>
                <p className="text-gray-500 text-sm mt-1">Passports you confirm via the scanner will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPassports.map(passport => (
                  <div key={passport.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-800 text-lg">{passport.medicineName}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            passport.status === "Completed" ? "bg-green-100 text-green-800" :
                            passport.status === "Disposed" ? "bg-red-100 text-red-800" :
                            "bg-purple-100 text-purple-800"
                          }`}>
                            {passport.status === "Completed" ? "🎉" : passport.status === "Disposed" ? "🗑️" : "📦"} {passport.status}
                          </span>
                          {(passport.status === "Completed" || passport.status === "Disposed") && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">🔒 Locked</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          <p>📦 Qty: <span className="font-semibold">{passport.quantity}</span></p>
                          <p>📅 Expiry: <span className="font-semibold">{passport.expiryDate}</span></p>
                          <p>🏷️ Source: <span className="font-semibold capitalize">{passport.source || "individual"}</span></p>
                          <p>🔑 ID: <span className="font-mono text-xs">{passport.passportId}</span></p>
                        </div>
                        {passport.usageDetails && (
                          <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                            <p className="text-xs font-semibold text-green-700 mb-1">📋 Usage Record</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs text-green-700">
                              <p>Qty Used: <span className="font-semibold">{passport.usageDetails.quantityUsed}</span></p>
                              <p>Date: <span className="font-semibold">{passport.usageDetails.date}</span></p>
                              <p>Purpose: <span className="font-semibold">{passport.usageDetails.purpose}</span></p>
                              {passport.usageDetails.notes && <p className="col-span-full">Notes: {passport.usageDetails.notes}</p>}
                            </div>
                          </div>
                        )}
                        {/* Timeline */}
                        {passport.timeline?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-500 mb-2">JOURNEY</p>
                            <div className="flex flex-wrap gap-2">
                              {passport.timeline.map((event: any, i: number) => (
                                <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                  <span>{event.action}</span>
                                  {i < passport.timeline.length - 1 && <span className="text-gray-300">→</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {(passport.status === "Completed" || passport.status === "Disposed") && (
                        <div className="flex-shrink-0 text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🔒</div>
                          <p className="text-xs text-gray-500 mt-1">Sealed</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Total Requests</h4>
                <p className="text-3xl font-bold">{myRequests.length}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Approved</h4>
                <p className="text-3xl font-bold">{myRequests.filter(r => r.status === "Approved").length}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Delivered</h4>
                <p className="text-3xl font-bold">{myRequests.filter(r => r.status === "Delivered").length}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h4 className="font-bold text-lg mb-4">Submit Usage Report</h4>
              <textarea
                placeholder="Describe how the received medicines were used and their impact..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
              />
              <button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold">
                Submit Report
              </button>
            </div>
          </div>
        );
      case "support":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <h4 className="font-bold text-xl mb-2">Need Help?</h4>
              <p className="text-purple-100">We're here to support your mission</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h4 className="font-bold text-lg mb-4 text-blue-800">Quick Help</h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <span className="text-blue-500 mr-2">•</span> How to search for medicines
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-blue-500 mr-2">•</span> How to submit a request
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-blue-500 mr-2">•</span> Request approval process
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-blue-500 mr-2">•</span> Delivery tracking
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h4 className="font-bold text-lg mb-4 text-green-800">Contact Admin</h4>
                <textarea
                  placeholder="Type your message or question here..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                />
                <button className="mt-4 w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold">
                  Send Message
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">Emergency Contact</h4>
              <p className="text-yellow-100">For urgent medicine requests, call: +91-9876543210</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">🏥</span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                NGO/Hospital Dashboard
              </h1>
              <p className="text-gray-600">Request medicines for your community</p>
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
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
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

export default NGODashboard;