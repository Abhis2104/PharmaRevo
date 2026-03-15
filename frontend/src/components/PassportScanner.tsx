import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface PassportScannerProps {
  ngoName?: string;
  ngoId?: string;
}

const PassportScanner: React.FC<PassportScannerProps> = ({ ngoName = "NGO", ngoId = "" }) => {
  const [mode, setMode] = useState<"scan" | "manual">("manual");
  const [passportId, setPassportId] = useState("");
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"lookup" | "confirm" | "usage" | "done">("lookup");
  const [usageForm, setUsageForm] = useState({
    quantityUsed: "",
    purpose: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    outcome: "Completed" as "Completed" | "Disposed"
  });
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivId = "qr-scanner-div";

  useEffect(() => {
    if (mode === "scan") {
      setTimeout(() => {
        scannerRef.current = new Html5QrcodeScanner(
          scannerDivId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scannerRef.current.render(
          (decodedText: string) => {
            // Extract passport doc ID from URL
            const parts = decodedText.split("/passport/");
            const id = parts.length > 1 ? parts[1] : decodedText;
            setPassportId(id);
            stopScanner();
            setMode("manual");
            lookupPassport(id);
          },
          () => {}
        );
      }, 300);
    }
    return () => stopScanner();
  }, [mode]);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
  };

  const lookupPassport = async (id?: string) => {
    const lookupId = id || passportId.trim();
    if (!lookupId) return;
    setLoading(true);
    setError("");
    setPassport(null);
    try {
      const docRef = doc(db, "medicine_passports", lookupId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setError("Passport not found. Please check the ID.");
      } else {
        const data = { id: docSnap.id, ...docSnap.data() };
        setPassport(data);
        setStep("confirm");
      }
    } catch {
      setError("Error looking up passport. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmReceipt = async () => {
    if (!passport) return;
    if (passport.status === "Completed" || passport.status === "Disposed") {
      setError("This passport is already closed and cannot be modified.");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "medicine_passports", passport.id), {
        status: "Distributed",
        ngoId,
        ngoName,
        distributedAt: Date.now(),
        timeline: arrayUnion({
          action: "Received by NGO/Hospital",
          timestamp: Date.now(),
          note: `Confirmed receipt by ${ngoName}`
        })
      });
      setPassport({ ...passport, status: "Distributed" });
      setStep("usage");
    } catch {
      setError("Error confirming receipt.");
    } finally {
      setLoading(false);
    }
  };

  const submitUsage = async () => {
    if (!passport || !usageForm.quantityUsed || !usageForm.purpose) {
      setError("Please fill quantity used and purpose.");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "medicine_passports", passport.id), {
        status: usageForm.outcome,
        usageDetails: {
          quantityUsed: usageForm.quantityUsed,
          purpose: usageForm.purpose,
          date: usageForm.date,
          notes: usageForm.notes,
          recordedBy: ngoName,
          recordedAt: Date.now()
        },
        closedAt: Date.now(),
        timeline: arrayUnion({
          action: `Passport ${usageForm.outcome}`,
          timestamp: Date.now(),
          note: `${usageForm.purpose} — Qty: ${usageForm.quantityUsed} — by ${ngoName}`
        })
      });
      setStep("done");
    } catch {
      setError("Error submitting usage.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPassportId("");
    setPassport(null);
    setError("");
    setStep("lookup");
    setUsageForm({ quantityUsed: "", purpose: "", date: new Date().toISOString().split("T")[0], notes: "", outcome: "Completed" });
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      Created: "bg-blue-100 text-blue-800",
      Verified: "bg-yellow-100 text-yellow-800",
      Distributed: "bg-purple-100 text-purple-800",
      Completed: "bg-green-100 text-green-800",
      Disposed: "bg-red-100 text-red-800"
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-1">🔏 Medicine Passport Scanner</h3>
        <p className="text-indigo-100">Scan or enter passport ID to confirm receipt and record usage</p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between">
          {[
            { key: "lookup", label: "1. Find Passport", icon: "🔍" },
            { key: "confirm", label: "2. Confirm Receipt", icon: "📦" },
            { key: "usage", label: "3. Record Usage", icon: "📋" },
            { key: "done", label: "4. Locked", icon: "🔒" }
          ].map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={`flex flex-col items-center ${step === s.key ? "opacity-100" : "opacity-40"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  step === s.key ? "bg-indigo-600 text-white" :
                  ["confirm", "usage", "done"].indexOf(step) > ["confirm", "usage", "done"].indexOf(s.key) ? "bg-green-500 text-white" :
                  "bg-gray-200 text-gray-500"
                }`}>
                  {s.icon}
                </div>
                <p className="text-xs mt-1 text-center hidden sm:block">{s.label}</p>
              </div>
              {i < 3 && <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step: Lookup */}
      {step === "lookup" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg space-y-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setMode("manual")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${mode === "manual" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              ⌨️ Enter ID
            </button>
            <button
              onClick={() => setMode("scan")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${mode === "scan" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              📷 Scan QR
            </button>
          </div>

          {mode === "manual" ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Passport Document ID</label>
              <input
                type="text"
                value={passportId}
                onChange={e => setPassportId(e.target.value)}
                placeholder="Enter passport ID from QR code..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => lookupPassport()}
                disabled={loading || !passportId.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Looking up..." : "🔍 Find Passport"}
              </button>
            </div>
          ) : (
            <div>
              <div id={scannerDivId} className="w-full"></div>
              <p className="text-sm text-gray-500 text-center mt-2">Point camera at the QR code on the medicine passport</p>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
        </div>
      )}

      {/* Step: Confirm Receipt */}
      {step === "confirm" && passport && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg space-y-4">
          <h4 className="text-lg font-bold text-gray-800">📦 Confirm Medicine Receipt</h4>

          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h5 className="font-bold text-gray-800 text-lg">{passport.medicineName}</h5>
                <p className="text-xs text-gray-500 font-mono">{passport.passportId}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(passport.status)}`}>
                {passport.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-gray-600">📦 Quantity: <span className="font-semibold">{passport.quantity}</span></p>
              <p className="text-gray-600">📅 Expiry: <span className="font-semibold">{passport.expiryDate}</span></p>
              <p className="text-gray-600">🏷️ Source: <span className="font-semibold capitalize">{passport.source || "Individual"}</span></p>
              {passport.batchNumber && <p className="text-gray-600">🔢 Batch: <span className="font-semibold">{passport.batchNumber}</span></p>}
            </div>
          </div>

          {(passport.status === "Completed" || passport.status === "Disposed") ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              🔒 This passport is already closed. It cannot be modified.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-sm text-yellow-800">
                ⚠️ By confirming, you acknowledge receiving this medicine on behalf of <strong>{ngoName}</strong>.
              </div>
              <div className="flex space-x-3">
                <button onClick={reset} className="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                  ← Back
                </button>
                <button
                  onClick={confirmReceipt}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Confirming..." : "✅ Confirm Receipt"}
                </button>
              </div>
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
        </div>
      )}

      {/* Step: Record Usage */}
      {step === "usage" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg space-y-4">
          <h4 className="text-lg font-bold text-gray-800">📋 Record Medicine Usage</h4>
          <p className="text-sm text-gray-500">This will permanently lock the passport once submitted.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Used *</label>
              <input
                type="number"
                value={usageForm.quantityUsed}
                onChange={e => setUsageForm({ ...usageForm, quantityUsed: e.target.value })}
                placeholder="e.g. 50"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Use *</label>
              <input
                type="date"
                value={usageForm.date}
                onChange={e => setUsageForm({ ...usageForm, date: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
            <input
              type="text"
              value={usageForm.purpose}
              onChange={e => setUsageForm({ ...usageForm, purpose: e.target.value })}
              placeholder="e.g. Distributed to flood relief patients"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={usageForm.notes}
              onChange={e => setUsageForm({ ...usageForm, notes: e.target.value })}
              placeholder="Any additional details..."
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Final Outcome *</label>
            <div className="flex space-x-3">
              <button
                onClick={() => setUsageForm({ ...usageForm, outcome: "Completed" })}
                className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-all ${usageForm.outcome === "Completed" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}
              >
                🎉 Completed (Used)
              </button>
              <button
                onClick={() => setUsageForm({ ...usageForm, outcome: "Disposed" })}
                className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-all ${usageForm.outcome === "Disposed" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-600"}`}
              >
                🗑️ Disposed (Expired/Unsafe)
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

          <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl text-sm text-orange-800">
            🔒 Once submitted, this passport will be permanently locked and cannot be changed.
          </div>

          <button
            onClick={submitUsage}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Submitting..." : "🔒 Submit & Lock Passport"}
          </button>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg text-center space-y-4">
          <div className="text-6xl">🔒</div>
          <h4 className="text-2xl font-bold text-gray-800">Passport Locked!</h4>
          <p className="text-gray-600">The medicine passport has been permanently closed. The record is now immutable.</p>
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-left">
            <p className="text-sm font-semibold text-green-800 mb-1">✅ What was recorded:</p>
            <p className="text-sm text-green-700">Quantity Used: {usageForm.quantityUsed}</p>
            <p className="text-sm text-green-700">Purpose: {usageForm.purpose}</p>
            <p className="text-sm text-green-700">Outcome: {usageForm.outcome}</p>
            <p className="text-sm text-green-700">Recorded by: {ngoName}</p>
          </div>
          <button
            onClick={reset}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Scan Another Passport
          </button>
        </div>
      )}
    </div>
  );
};

export default PassportScanner;
