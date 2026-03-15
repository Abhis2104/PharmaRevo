import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { QRCodeSVG } from "qrcode.react";

const PassportView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchPassport = async () => {
      try {
        const docSnap = await getDoc(doc(db, "medicine_passports", id));
        if (docSnap.exists()) {
          setPassport({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Passport not found.");
        }
      } catch {
        setError("Error loading passport.");
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, [id]);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      Created: "bg-blue-100 text-blue-800 border-blue-300",
      Verified: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Distributed: "bg-purple-100 text-purple-800 border-purple-300",
      Completed: "bg-green-100 text-green-800 border-green-300",
      Disposed: "bg-red-100 text-red-800 border-red-300"
    };
    return map[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status: string) => {
    const map: Record<string, string> = {
      Created: "🆕", Verified: "✅", Distributed: "📦", Completed: "🎉", Disposed: "🗑️"
    };
    return map[status] || "❓";
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md w-full">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Passport Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold">
          Go Home
        </button>
      </div>
    </div>
  );

  const isLocked = passport.status === "Completed" || passport.status === "Disposed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6 text-center">
          <div className="text-4xl mb-2">🔏</div>
          <h1 className="text-2xl font-bold">Digital Medicine Passport</h1>
          <p className="text-blue-100 text-sm mt-1">PharmaRevo Traceability System</p>
        </div>

        {/* Status Banner */}
        <div className={`border-2 rounded-xl p-4 mb-6 text-center ${getStatusColor(passport.status)}`}>
          <span className="text-2xl">{getStatusIcon(passport.status)}</span>
          <p className="font-bold text-lg mt-1">{passport.status}</p>
          {isLocked && <p className="text-sm mt-1">🔒 This passport is permanently locked</p>}
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 text-center">
          <QRCodeSVG value={window.location.href} size={180} className="mx-auto" />
          <p className="text-xs text-gray-500 mt-3 font-mono break-all">{passport.passportId}</p>
        </div>

        {/* Medicine Details */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4">💊 Medicine Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Medicine Name", passport.medicineName],
              ["Quantity", passport.quantity],
              ["Expiry Date", passport.expiryDate],
              ["Source", passport.source || "Individual"],
              ["Batch Number", passport.batchNumber || "N/A"],
              ["Verified By", "PharmaRevo Admin"],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold uppercase">{label}</p>
                <p className="text-sm font-medium text-gray-800 capitalize mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4">📍 Medicine Journey</h3>

          {/* Visual Steps */}
          <div className="flex items-center mb-6">
            {["Created", "Verified", "Distributed", "Completed"].map((step, i) => {
              const steps = ["Created", "Verified", "Distributed", "Completed", "Disposed"];
              const currentIdx = steps.indexOf(passport.status);
              const stepIdx = steps.indexOf(step);
              const done = currentIdx >= stepIdx;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <p className="text-xs mt-1 text-center text-gray-500 w-16">{step}</p>
                  </div>
                  {i < 3 && <div className={`flex-1 h-1 mx-1 rounded ${done && currentIdx > stepIdx ? "bg-green-500" : "bg-gray-200"}`}></div>}
                </React.Fragment>
              );
            })}
          </div>

          {/* Timeline Events */}
          {passport.timeline?.length > 0 && (
            <div className="space-y-3">
              {passport.timeline.map((event: any, i: number) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">{event.action}</p>
                    <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                    {event.note && <p className="text-xs text-gray-500 italic mt-0.5">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NGO / Distribution Info */}
        {passport.ngoName && (
          <div className="bg-purple-50 rounded-2xl p-6 shadow-lg mb-6 border border-purple-200">
            <h3 className="font-bold text-purple-800 text-lg mb-3">🏥 Received By</h3>
            <p className="text-purple-700 font-semibold">{passport.ngoName}</p>
            {passport.distributedAt && (
              <p className="text-purple-600 text-sm mt-1">
                {new Date(passport.distributedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Usage Details */}
        {passport.usageDetails && (
          <div className="bg-green-50 rounded-2xl p-6 shadow-lg mb-6 border border-green-200">
            <h3 className="font-bold text-green-800 text-lg mb-3">📋 Usage Report</h3>
            <div className="space-y-2 text-sm text-green-700">
              <p>Quantity Used: <span className="font-semibold">{passport.usageDetails.quantityUsed}</span></p>
              <p>Purpose: <span className="font-semibold">{passport.usageDetails.purpose}</span></p>
              <p>Date: <span className="font-semibold">{passport.usageDetails.date}</span></p>
              {passport.usageDetails.notes && <p>Notes: <span className="font-semibold">{passport.usageDetails.notes}</span></p>}
              <p>Recorded by: <span className="font-semibold">{passport.usageDetails.recordedBy}</span></p>
            </div>
          </div>
        )}

        {/* Lock Notice */}
        {isLocked && (
          <div className="bg-gray-100 rounded-2xl p-4 text-center border border-gray-300 mb-6">
            <p className="text-gray-600 font-semibold">🔒 This passport record is permanently sealed</p>
            <p className="text-gray-500 text-sm mt-1">No further modifications are possible</p>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 pb-6">
          Powered by PharmaRevo · Medicine Traceability System
        </div>
      </div>
    </div>
  );
};

export default PassportView;
