import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";

interface ShortageAlertsProps {
  role?: "ngo" | "donor" | "pharmacy" | "company" | "admin";
}

const URGENCY_COLORS: Record<string, string> = {
  Critical: "bg-red-100 border-red-400 text-red-800",
  High:     "bg-orange-100 border-orange-400 text-orange-800",
  Medium:   "bg-yellow-100 border-yellow-400 text-yellow-800",
};

const URGENCY_ICONS: Record<string, string> = {
  Critical: "🚨",
  High:     "⚠️",
  Medium:   "📢",
};

const ShortageAlerts: React.FC<ShortageAlertsProps> = ({ role = "donor" }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterUrgency, setFilterUrgency] = useState<"all" | "Critical" | "High" | "Medium">("all");
  const [form, setForm] = useState({
    medicineName: "",
    quantityNeeded: "",
    urgency: "High",
    city: "",
    expiryMonthsRequired: "6",
    description: "",
    organizationName: "",
    contactNumber: "",
  });

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "shortage_alerts"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      data.sort((a, b) => {
        const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2 };
        if (order[a.urgency] !== order[b.urgency]) return order[a.urgency] - order[b.urgency];
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicineName || !form.quantityNeeded || !form.city || !form.organizationName || !form.contactNumber) {
      alert("Please fill all required fields.");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.contactNumber)) {
      alert("Enter a valid 10-digit contact number.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "shortage_alerts"), {
        ...form,
        quantityNeeded: Number(form.quantityNeeded),
        expiryMonthsRequired: Number(form.expiryMonthsRequired),
        status: "Active",
        postedBy: auth.currentUser?.uid || "ngo",
        createdAt: Date.now(),
      });
      setForm({ medicineName: "", quantityNeeded: "", urgency: "High", city: "", expiryMonthsRequired: "6", description: "", organizationName: "", contactNumber: "" });
      alert("🚨 Shortage alert posted! All donors, pharmacies and companies will see this.");
      fetchAlerts();
    } catch (e) {
      console.error(e);
      alert("Error posting alert.");
    } finally {
      setSubmitting(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await updateDoc(doc(db, "shortage_alerts", alertId), { status: "Resolved" });
      fetchAlerts();
    } catch (e) {
      alert("Error resolving alert.");
    }
  };

  const filtered = alerts.filter(a =>
    (filterUrgency === "all" || a.urgency === filterUrgency) && a.status !== "Resolved"
  );
  const resolved = alerts.filter(a => a.status === "Resolved");
  const activeCount = alerts.filter(a => a.status === "Active").length;
  const criticalCount = alerts.filter(a => a.urgency === "Critical" && a.status === "Active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-1">
          <span className="text-3xl">🚨</span>
          <div>
            <h3 className="text-2xl font-bold">Medicine Shortage Alert System</h3>
            <p className="text-red-100 text-sm">Real-time alerts for critically needed medicines</p>
          </div>
        </div>
        <div className="flex gap-4 mt-3">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">{activeCount} Active Alerts</span>
          {criticalCount > 0 && <span className="bg-red-800/60 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">🚨 {criticalCount} Critical</span>}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {(["Critical", "High", "Medium"] as const).map(u => (
          <div key={u} className={`rounded-2xl p-4 border-2 text-center cursor-pointer transition-all ${filterUrgency === u ? "scale-105 shadow-lg" : ""} ${URGENCY_COLORS[u]}`}
            onClick={() => setFilterUrgency(filterUrgency === u ? "all" : u)}>
            <div className="text-2xl mb-1">{URGENCY_ICONS[u]}</div>
            <div className="text-2xl font-bold">{alerts.filter(a => a.urgency === u && a.status === "Active").length}</div>
            <div className="text-xs font-semibold">{u}</div>
          </div>
        ))}
      </div>

      {/* NGO: Post Alert Form */}
      {role === "ngo" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <h4 className="text-lg font-bold text-gray-800 mb-4">📢 Post a Shortage Alert</h4>
          <form onSubmit={submitAlert} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                <input type="text" value={form.medicineName}
                  onChange={e => setForm({ ...form, medicineName: e.target.value })}
                  placeholder="e.g. Insulin, Paracetamol"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed *</label>
                <input type="number" min="1" value={form.quantityNeeded}
                  onChange={e => setForm({ ...form, quantityNeeded: e.target.value })}
                  placeholder="e.g. 100"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level *</label>
                <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="Critical">🚨 Critical — Life threatening</option>
                  <option value="High">⚠️ High — Urgent need</option>
                  <option value="Medium">📢 Medium — Running low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Location *</label>
                <input type="text" value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Delhi, Mumbai"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Expiry Required (months)</label>
                <input type="number" min="1" max="60" value={form.expiryMonthsRequired}
                  onChange={e => setForm({ ...form, expiryMonthsRequired: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                <input type="text" value={form.organizationName}
                  onChange={e => setForm({ ...form, organizationName: e.target.value })}
                  placeholder="Your NGO / Hospital name"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input type="tel" value={form.contactNumber} maxLength={10}
                  onChange={e => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, "") })}
                  placeholder="10-digit number"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
              <textarea value={form.description} rows={2}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Any additional context about the shortage..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
              {submitting ? "Posting..." : "🚨 Post Shortage Alert"}
            </button>
          </form>
        </div>
      )}

      {/* Active Alerts — visible to ALL roles */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h4 className="text-lg font-bold text-gray-800">🔴 Active Shortage Alerts</h4>
          <div className="flex gap-2 flex-wrap">
            {(["all", "Critical", "High", "Medium"] as const).map(f => (
              <button key={f} onClick={() => setFilterUrgency(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${filterUrgency === f ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {f === "all" ? "All" : `${URGENCY_ICONS[f]} ${f}`}
              </button>
            ))}
            <button onClick={fetchAlerts} className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">🔄 Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">✅</div>
            <p className="text-gray-600 font-semibold">No active shortage alerts.</p>
            <p className="text-gray-500 text-sm mt-1">All medicine needs are currently met.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(alert => (
              <div key={alert.id} className={`rounded-xl border-2 p-4 ${URGENCY_COLORS[alert.urgency]}`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xl">{URGENCY_ICONS[alert.urgency]}</span>
                      <span className="font-bold text-lg">{alert.medicineName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${URGENCY_COLORS[alert.urgency]}`}>
                        {alert.urgency}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-2">
                      <p>📦 Needed: <span className="font-semibold">{alert.quantityNeeded} units</span></p>
                      <p>📍 Location: <span className="font-semibold">{alert.city}</span></p>
                      <p>⏳ Min Expiry: <span className="font-semibold">{alert.expiryMonthsRequired}+ months</span></p>
                      <p>🏥 By: <span className="font-semibold">{alert.organizationName}</span></p>
                      <p>📞 Contact: <span className="font-semibold">{alert.contactNumber}</span></p>
                      <p>🕐 Posted: <span className="font-semibold">{new Date(alert.createdAt).toLocaleDateString()}</span></p>
                    </div>
                    {alert.description && <p className="text-sm italic opacity-80">"{alert.description}"</p>}
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {(role === "donor" || role === "pharmacy" || role === "company") && (
                      <a href="/dashboard" className="text-center bg-white/80 border-2 border-current px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white transition-all">
                        💊 Donate This Medicine
                      </a>
                    )}
                    {(role === "ngo" || role === "admin") && (
                      <button onClick={() => resolveAlert(alert.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-all">
                        ✅ Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Alerts */}
      {resolved.length > 0 && (
        <details className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow">
          <summary className="p-4 cursor-pointer font-semibold text-gray-600 select-none">
            ✅ Resolved Alerts ({resolved.length})
          </summary>
          <div className="px-4 pb-4 space-y-3">
            {resolved.map(alert => (
              <div key={alert.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 opacity-70">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="font-semibold text-gray-700">{alert.medicineName}</span>
                  <span className="text-xs text-gray-500">— {alert.city} — {alert.organizationName}</span>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default ShortageAlerts;
