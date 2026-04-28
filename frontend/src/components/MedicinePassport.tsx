import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { QRCodeSVG } from "qrcode.react";
import ConsentChainView from "./ConsentChainView";

const MedicinePassport = () => {
  const [passports, setPassports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchPassports();
  }, []);

  const fetchPassports = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "medicine_passports"));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPassports(data);
    } catch (error) {
      console.error("Error fetching passports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Created": return "bg-blue-100 text-blue-800";
      case "Verified": return "bg-yellow-100 text-yellow-800";
      case "Distributed": return "bg-purple-100 text-purple-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Disposed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Created": return "🆕";
      case "Verified": return "✅";
      case "Distributed": return "📦";
      case "Completed": return "🎉";
      case "Disposed": return "🗑️";
      default: return "❓";
    }
  };

  const getSorted = (data: any[]) => {
    const d = [...data];
    if (sortBy === "recent") return d.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (sortBy === "alphabetical") return d.sort((a, b) => (a.medicineName || "").localeCompare(b.medicineName || ""));
    if (sortBy === "expiry") return d.sort((a, b) => new Date(a.expiryDate || 0).getTime() - new Date(b.expiryDate || 0).getTime());
    if (sortBy === "status") return d.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    return d;
  };

  const filtered = getSorted(filterStatus === "all" ? passports : passports.filter(p => p.status === filterStatus));

  const passportUrl = (id: string) => `${window.location.origin}/passport/${id}`;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["Created", "Verified", "Distributed", "Completed", "Disposed"].map(status => (
          <div key={status} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow text-center">
            <div className="text-2xl mb-1">{getStatusIcon(status)}</div>
            <div className="text-xl font-bold text-gray-800">{passports.filter(p => p.status === status).length}</div>
            <div className="text-xs text-gray-500">{status}</div>
          </div>
        ))}
      </div>

      {/* Filter + Sort + Refresh */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg flex flex-wrap gap-2 items-center">
        {["all", "Created", "Verified", "Distributed", "Completed", "Disposed"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 capitalize ${
              filterStatus === s
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {s === "all" ? "All Passports" : `${getStatusIcon(s)} ${s}`}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="recent">📅 Most Recent</option>
            <option value="alphabetical">🔤 Alphabetical</option>
            <option value="expiry">📆 By Expiry</option>
            <option value="status">🔖 By Status</option>
          </select>
          <button onClick={fetchPassports} disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Passport List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-bold mb-6">🔏 Medicine Passports ({filtered.length})</h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔏</div>
            <p className="text-gray-600 text-lg">No passports found.</p>
            <p className="text-gray-500 text-sm mt-2">Passports are created automatically when admin approves a donation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(passport => (
              <div key={passport.id} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800">{passport.medicineName}</h4>
                    <p className="text-xs text-gray-500 font-mono">PP-ID: {passport.passportId}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(passport.status)}`}>
                    {getStatusIcon(passport.status)} {passport.status}
                  </span>
                </div>

                <div className="flex justify-center my-3 p-2 bg-gray-50 rounded-lg">
                  <QRCodeSVG value={passportUrl(passport.id)} size={100} />
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>📦 Qty: {passport.quantity}</p>
                  <p>📅 Expiry: {passport.expiryDate}</p>
                  <p>🏷️ Source: <span className="capitalize">{passport.source || "individual"}</span></p>
                  {passport.batchNumber && <p>🔢 Batch: {passport.batchNumber}</p>}
                  {passport.ngoName && <p>🏥 NGO: {passport.ngoName}</p>}
                  {passport.outcome && <p>📋 Outcome: {passport.outcome}</p>}
                </div>

                {/* Timeline */}
                <div className="border-t pt-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">JOURNEY</p>
                  <div className="flex items-center space-x-1 text-xs">
                    {["Created", "Verified", "Distributed", "Completed"].map((step, i) => {
                      const steps = ["Created", "Verified", "Distributed", "Completed", "Disposed"];
                      const currentIdx = steps.indexOf(passport.status);
                      const stepIdx = steps.indexOf(step);
                      const done = currentIdx >= stepIdx;
                      return (
                        <React.Fragment key={step}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                            {done ? "✓" : i + 1}
                          </div>
                          {i < 3 && <div className={`flex-1 h-0.5 ${done && currentIdx > stepIdx ? "bg-green-500" : "bg-gray-200"}`}></div>}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPassport(passport)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300"
                >
                  View Full Passport
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Passport Modal */}
      {selectedPassport && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">🔏 Digital Medicine Passport</h3>
                  <p className="text-blue-100 text-sm font-mono">{selectedPassport.passportId}</p>
                </div>
                <button onClick={() => setSelectedPassport(null)} className="text-white hover:text-gray-200 text-2xl">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                <QRCodeSVG value={passportUrl(selectedPassport.id)} size={160} />
              </div>
              <p className="text-center text-xs text-gray-500">Scan to verify this passport</p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">🔑 Use this ID in NGO Scanner:</p>
                <p className="text-sm font-mono font-bold text-blue-900 break-all select-all">{selectedPassport.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Medicine", selectedPassport.medicineName],
                  ["Quantity", selectedPassport.quantity],
                  ["Expiry Date", selectedPassport.expiryDate],
                  ["Source", selectedPassport.source || "Individual"],
                  ["Batch No.", selectedPassport.batchNumber || "N/A"],
                  ["Status", selectedPassport.status],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-semibold">{label}</p>
                    <p className="text-sm font-medium text-gray-800 capitalize">{value}</p>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="font-semibold text-gray-700 mb-3">📍 Passport Journey</p>
                <div className="space-y-2">
                  {selectedPassport.timeline?.map((event: any, i: number) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{event.action}</p>
                        <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                        {event.note && <p className="text-xs text-gray-600 italic">{event.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPassport.usageDetails && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="font-semibold text-green-800 mb-2">📋 Usage Details</p>
                  <p className="text-sm text-green-700">Quantity Used: {selectedPassport.usageDetails.quantityUsed}</p>
                  <p className="text-sm text-green-700">Purpose: {selectedPassport.usageDetails.purpose}</p>
                  <p className="text-sm text-green-700">Date: {selectedPassport.usageDetails.date}</p>
                  {selectedPassport.usageDetails.notes && (
                    <p className="text-sm text-green-700">Notes: {selectedPassport.usageDetails.notes}</p>
                  )}
                </div>
              )}

              <ConsentChainView
                consentChain={selectedPassport.consentChain}
                donationId={selectedPassport.donationId}
                donorId={selectedPassport.donorId}
                createdAt={selectedPassport.createdAt}
              />

              {(selectedPassport.status === "Completed" || selectedPassport.status === "Disposed") && (
                <div className="bg-gray-100 p-3 rounded-xl text-center">
                  <p className="text-sm font-semibold text-gray-600">🔒 This passport is permanently locked</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicinePassport;
