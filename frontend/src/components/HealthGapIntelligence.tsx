import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface MedicineStats {
  name: string;
  supplied: number;
  demanded: number;
  gap: number; // negative = shortage, positive = surplus
}

const HealthGapIntelligence: React.FC = () => {
  const [stats, setStats] = useState<MedicineStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "shortage" | "surplus">("all");

  useEffect(() => {
    fetchAndCompute();
  }, []);

  const fetchAndCompute = async () => {
    setLoading(true);
    try {
      // --- Supply: approved donations ---
      const donationsSnap = await getDocs(collection(db, "donations"));
      const supplyMap: Record<string, number> = {};
      donationsSnap.docs.forEach(d => {
        const data = d.data();
        if (data.status === "Approved" && data.medicineName) {
          const key = data.medicineName.trim().toLowerCase();
          supplyMap[key] = (supplyMap[key] || 0) + (Number(data.quantity) || 0);
        }
      });

      // --- Demand: all ngo_requests items ---
      const requestsSnap = await getDocs(collection(db, "ngo_requests"));
      const demandMap: Record<string, number> = {};
      requestsSnap.docs.forEach(d => {
        const data = d.data();
        if (Array.isArray(data.items)) {
          data.items.forEach((item: any) => {
            if (item.medicineName) {
              const key = item.medicineName.trim().toLowerCase();
              demandMap[key] = (demandMap[key] || 0) + (Number(item.requestedQuantity) || 1);
            }
          });
        }
      });

      // --- Merge all medicine names ---
      const allNames = new Set([...Object.keys(supplyMap), ...Object.keys(demandMap)]);
      const result: MedicineStats[] = Array.from(allNames).map(name => {
        const supplied = supplyMap[name] || 0;
        const demanded = demandMap[name] || 0;
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          supplied,
          demanded,
          gap: supplied - demanded
        };
      });

      // Sort by gap ascending (biggest shortages first)
      result.sort((a, b) => a.gap - b.gap);
      setStats(result);
    } catch (err) {
      console.error("CHGI fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = stats.filter(s => {
    if (filter === "shortage") return s.gap < 0;
    if (filter === "surplus") return s.gap > 0;
    return true;
  });

  const totalShortages = stats.filter(s => s.gap < 0).length;
  const totalSurplus = stats.filter(s => s.gap > 0).length;
  const totalBalanced = stats.filter(s => s.gap === 0).length;
  const criticalShortage = stats.filter(s => s.gap <= -10).length;

  const getGapColor = (gap: number) => {
    if (gap <= -10) return "text-red-700 bg-red-100 border-red-300";
    if (gap < 0) return "text-orange-700 bg-orange-100 border-orange-300";
    if (gap === 0) return "text-yellow-700 bg-yellow-100 border-yellow-300";
    return "text-green-700 bg-green-100 border-green-300";
  };

  const getBarWidth = (value: number, max: number) =>
    max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  const maxVal = Math.max(...stats.map(s => Math.max(s.supplied, s.demanded)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">🧠</span>
          <div>
            <h3 className="text-2xl font-bold">Community Health Gap Intelligence</h3>
            <p className="text-indigo-100 text-sm">Supply vs Demand analysis — real health gaps in your community</p>
          </div>
        </div>
        <button
          onClick={fetchAndCompute}
          className="mt-3 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          🔄 Refresh Analysis
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-5 text-white text-center">
          <div className="text-3xl font-bold">{totalShortages}</div>
          <div className="text-sm opacity-90 mt-1">🔴 Shortage Medicines</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white text-center">
          <div className="text-3xl font-bold">{criticalShortage}</div>
          <div className="text-sm opacity-90 mt-1">🚨 Critical Shortages</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-5 text-white text-center">
          <div className="text-3xl font-bold">{totalSurplus}</div>
          <div className="text-sm opacity-90 mt-1">🟢 Surplus Medicines</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-5 text-white text-center">
          <div className="text-3xl font-bold">{totalBalanced}</div>
          <div className="text-sm opacity-90 mt-1">⚖️ Balanced</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-white/20 shadow-lg flex gap-2 flex-wrap">
        {(["all", "shortage", "surplus"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all capitalize ${
              filter === f
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f === "all" ? "📊 All Medicines" : f === "shortage" ? "🔴 Shortages Only" : "🟢 Surplus Only"}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">{filtered.length} medicines</span>
      </div>

      {/* Gap Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧠</div>
            <p className="text-gray-600 text-lg">No data yet.</p>
            <p className="text-gray-500 text-sm mt-1">Approve donations and submit NGO requests to generate health gap insights.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((s, i) => (
              <div key={i} className={`rounded-xl border p-4 ${getGapColor(s.gap)}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-base">{s.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${getGapColor(s.gap)}`}>
                        {s.gap < 0 ? `⚠️ Shortage: ${Math.abs(s.gap)}` : s.gap === 0 ? "⚖️ Balanced" : `✅ Surplus: +${s.gap}`}
                      </span>
                    </div>

                    {/* Supply bar */}
                    <div className="mb-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>📦 Supply (Donated)</span>
                        <span className="font-semibold">{s.supplied}</span>
                      </div>
                      <div className="w-full bg-white/60 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${getBarWidth(s.supplied, maxVal)}%` }}
                        />
                      </div>
                    </div>

                    {/* Demand bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>🏥 Demand (NGO Requests)</span>
                        <span className="font-semibold">{s.demanded}</span>
                      </div>
                      <div className="w-full bg-white/60 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${getBarWidth(s.demanded, maxVal)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gap badge */}
                  <div className="text-center min-w-[80px]">
                    <div className={`text-2xl font-bold ${s.gap < 0 ? "text-red-700" : s.gap === 0 ? "text-yellow-700" : "text-green-700"}`}>
                      {s.gap > 0 ? `+${s.gap}` : s.gap}
                    </div>
                    <div className="text-xs opacity-70">Gap</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insight Box */}
      {!loading && stats.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5">
          <p className="font-bold text-indigo-800 mb-2">💡 Key Insights</p>
          <ul className="space-y-1 text-sm text-indigo-700">
            {stats.filter(s => s.gap < 0).slice(0, 3).map((s, i) => (
              <li key={i}>• <strong>{s.name}</strong> is in shortage by {Math.abs(s.gap)} units — NGOs need more donations of this medicine.</li>
            ))}
            {stats.filter(s => s.gap > 20).slice(0, 2).map((s, i) => (
              <li key={i}>• <strong>{s.name}</strong> has a surplus of {s.gap} units — consider redirecting to other NGOs.</li>
            ))}
            {totalShortages === 0 && <li>✅ No shortages detected. All demanded medicines are currently covered.</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HealthGapIntelligence;
