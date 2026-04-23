import React from "react";

interface ConsentEntry {
  stage: string;
  actor: string;
  actorLabel: string;
  timestamp: number;
  note: string;
}

interface ConsentChainViewProps {
  consentChain?: ConsentEntry[];
  donationId?: string;
  donorId?: string;
  createdAt?: number;
}

const STAGE_ICONS: Record<string, string> = {
  "Donor Consent": "🤝",
  "NGO/Hospital Acceptance": "📦",
  "Patient Receipt (Anonymous)": "💊",
};

const STAGE_COLORS: Record<string, string> = {
  "Donor Consent": "bg-blue-100 border-blue-300 text-blue-800",
  "NGO/Hospital Acceptance": "bg-purple-100 border-purple-300 text-purple-800",
  "Patient Receipt (Anonymous)": "bg-green-100 border-green-300 text-green-800",
};

const ALL_STAGES = ["Donor Consent", "NGO/Hospital Acceptance", "Patient Receipt (Anonymous)"];

const ConsentChainView: React.FC<ConsentChainViewProps> = ({ consentChain = [], donationId, donorId, createdAt }) => {
  // For old passports with no consentChain stored: if passport has a donationId,
  // the donor already consented when they submitted the donation — treat it as done.
  const effectiveChain: ConsentEntry[] = [...consentChain];
  const hasDonorConsent = effectiveChain.some(e => e.stage === "Donor Consent");
  if (!hasDonorConsent && donationId) {
    effectiveChain.unshift({
      stage: "Donor Consent",
      actor: donorId || "donor",
      actorLabel: "Donor",
      timestamp: createdAt || Date.now(),
      note: "Donor submitted this medicine for redistribution (consent recorded at donation time)."
    });
  }
  const completedStages = new Set(effectiveChain.map(e => e.stage));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-xl">🔗</span>
        <h4 className="font-bold text-gray-800 text-lg">Consent-to-Care Chain</h4>
        <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {effectiveChain.length}/{ALL_STAGES.length} steps
        </span>
      </div>

      <div className="space-y-3">
        {ALL_STAGES.map((stage, i) => {
          const entry = effectiveChain.find(e => e.stage === stage);
          const done = completedStages.has(stage);
          return (
            <div key={stage} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 ${
                  done ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50"
                }`}>
                  {done ? STAGE_ICONS[stage] : <span className="text-gray-300 text-sm font-bold">{i + 1}</span>}
                </div>
                {i < ALL_STAGES.length - 1 && (
                  <div className={`w-0.5 h-6 mt-1 ${done ? "bg-green-300" : "bg-gray-200"}`} />
                )}
              </div>
              <div className={`flex-1 rounded-xl border px-4 py-3 text-sm ${
                done ? STAGE_COLORS[stage] || "bg-gray-100 border-gray-200 text-gray-700" : "bg-gray-50 border-gray-200 text-gray-400"
              }`}>
                <p className="font-semibold">{stage}</p>
                {done && entry ? (
                  <>
                    <p className="text-xs mt-1 opacity-80">{entry.note}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {new Date(entry.timestamp).toLocaleString()} · {entry.actorLabel}
                    </p>
                  </>
                ) : (
                  <p className="text-xs mt-1">Pending</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {effectiveChain.length === ALL_STAGES.length && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-semibold text-center">
          ✅ Full Consent Chain Complete — Ethically Verified
        </div>
      )}
    </div>
  );
};

export default ConsentChainView;
