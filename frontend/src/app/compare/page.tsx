"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import { useCandidates } from "@/context/CandidateContext";

function CompareContent() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { candidates: allCandidates } = useCandidates();
  const candidates = user ? allCandidates.filter((c) => c.constituencyId === user.constituencyId) : [];
  const [selected, setSelected] = useState<string[]>(candidates.slice(0, 2).map((c) => c.id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // সর্বোচ্চ ৩ জন একসাথে compare করা যাবে
      return [...prev, id];
    });
  };

  const selectedCandidates = candidates.filter((c) => selected.includes(c.id));

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full flex flex-col gap-6">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('compare.title')}</h1>
            <p className="text-body-lg text-on-surface-variant">{t('compare.subtitle')}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {candidates.map((c) => (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`px-4 py-2 rounded-full border text-label-md font-bold transition-all active:scale-95 ${
                  selected.includes(c.id) ? "bg-primary text-on-primary border-primary" : "bg-surface text-on-surface border-outline-variant hover:border-primary"
                }`}
              >
                {t(`${c.translationKey}.name` as any)}
              </button>
            ))}
          </div>

          {selectedCandidates.length === 0 && (
            <p className="text-body-md text-on-surface-variant text-center py-12 bg-surface rounded-xl border border-outline-variant">
              {t('compare.selectPrompt')}
            </p>
          )}

          {selectedCandidates.length > 0 && (
            <div className="overflow-x-auto">
              <div className="grid gap-4 min-w-[600px]" style={{ gridTemplateColumns: `repeat(${selectedCandidates.length}, minmax(220px, 1fr))` }}>
                {selectedCandidates.map((c) => (
                  <div key={c.id} className="bg-surface rounded-xl shadow-card border border-outline-variant p-5 flex flex-col gap-4 card-hover animate-rise">
                    <div className="flex flex-col items-center text-center gap-2 border-b border-outline-variant pb-4">
                      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant">{c.icon}</span>
                      </div>
                      <h3 className="text-body-lg font-bold text-on-surface">{t(`${c.translationKey}.name` as any)}</h3>
                      <p className="text-caption text-on-surface-variant">{t(`${c.translationKey}.party` as any)}</p>
                    </div>

                    <div>
                      <p className="text-caption font-bold text-primary mb-1">{t('compare.quote')}</p>
                      <p className="text-body-md text-on-surface italic">&quot;{t(`${c.translationKey}.quote` as any)}&quot;</p>
                    </div>

                    <div>
                      <p className="text-caption font-bold text-primary mb-1">{t('compare.manifesto')}</p>
                      <p className="text-body-md text-on-surface-variant whitespace-pre-line line-clamp-[8]">{c.manifestoFull}</p>
                    </div>

                    <div>
                      <p className="text-caption font-bold text-primary mb-1">{t('compare.status')}</p>
                      <p className="text-body-md text-on-surface">{t(`admin.${c.nominationStatusKey}` as any)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <ProtectedRoute allowedRoles={["voter", "candidate"]}>
      <CompareContent />
    </ProtectedRoute>
  );
}
