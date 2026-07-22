"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useTranslation } from "@/context/UIContext";
import { mockCandidates } from "@/lib/mockCandidates";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { SkeletonStatCard } from "@/components/ui/Skeleton";

export default function AdminResultsPage() {
  const { t } = useTranslation();
  const isLoading = useSimulatedLoading();

  // constituency অনুযায়ী গ্রুপ করা, প্রতিটার ভেতরে ভোট অনুযায়ী sort -- ডেমো ভোট সংখ্যা
  // mockCandidates.ts থেকে আসছে (TODO(backend): real on-chain tally দিয়ে replace হবে)
  const totalVotes = mockCandidates.reduce((sum, c) => sum + c.voteCount, 0);
  const totalRegistered = 1020400;
  const constituencies = Array.from(new Set(mockCandidates.map((c) => c.constituencyId)));

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          
          <div className="text-center mb-10 w-full">
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('results.title')}</h1>
            <p className="text-body-lg text-on-surface-variant">{t('results.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            {/* Main Results Board */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6">
                <div className="flex justify-between items-start mb-6 border-b border-outline-variant pb-4">
                  <div>
                    <h2 className="text-headline-md text-on-surface">{t('results.livePresident')}</h2>
                    <p className="text-caption text-on-surface-variant mt-1">{t('results.ongoing')}</p>
                  </div>
                  <div className="flex items-center gap-2 text-error bg-error-container/20 px-3 py-1 rounded-full border border-error/20">
                    <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                    <span className="text-label-md font-bold">{t('results.votingOngoing')}</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col gap-6 py-4">
                    {constituencies.map((cid) => (
                      <div key={cid} className="animate-pulse h-24 bg-surface-variant/40 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {constituencies.map((cid) => {
                      const candidates = mockCandidates
                        .filter((c) => c.constituencyId === cid)
                        .sort((a, b) => b.voteCount - a.voteCount);
                      const constituencyTotal = candidates.reduce((s, c) => s + c.voteCount, 0);
                      return (
                        <div key={cid} className="border border-outline-variant/60 rounded-lg p-4">
                          <h3 className="text-label-md font-bold text-on-surface mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                            {candidates[0]?.constituencyName}
                          </h3>
                          <div className="flex flex-col gap-3">
                            {candidates.map((c, idx) => {
                              const pct = constituencyTotal > 0 ? Math.round((c.voteCount / constituencyTotal) * 100) : 0;
                              return (
                                <div key={c.id}>
                                  <div className="flex justify-between items-center text-caption mb-1">
                                    <span className={`font-bold ${idx === 0 ? "text-primary" : "text-on-surface-variant"}`}>
                                      {t(`${c.translationKey}.name` as any)}
                                    </span>
                                    <span className="text-on-surface-variant">{c.voteCount.toLocaleString()} ({pct}%)</span>
                                  </div>
                                  <div className="w-full bg-surface-variant rounded-full h-2">
                                    <div className={`h-2 rounded-full transition-all duration-700 ease-out ${idx === 0 ? "bg-primary" : "bg-secondary"}`} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  <>
                    <SkeletonStatCard />
                    <SkeletonStatCard />
                  </>
                ) : (
                  <>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
                      <h3 className="text-label-md text-on-surface-variant mb-2">{t('results.currentVotes')}</h3>
                      <p className="text-display-md text-primary font-bold">{totalVotes.toLocaleString()}</p>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
                      <h3 className="text-label-md text-on-surface-variant mb-2">{t('results.registeredVoters')}</h3>
                      <p className="text-display-md text-on-surface font-bold">{totalRegistered.toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Verification & Integrity Panel */}
            <div className="space-y-6">
              <div className="bg-secondary-container/30 border border-secondary/20 rounded-xl p-6">
                <div className="flex items-center gap-2 text-secondary mb-4">
                  <span className="material-symbols-outlined">shield</span>
                  <h3 className="text-title-md font-bold">{t('results.integrity')}</h3>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">{t('results.blockchainNodes')}</span>
                    <span className="font-bold text-on-surface">{t('results.activeNodes')}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">{t('results.encryptionStatus')}</span>
                    <span className="font-bold text-success flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span> {t('results.encryptionType')}
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">{t('results.auditLogsText')}</span>
                    <span className="font-bold text-success flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span> {t('results.verified')}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6">
                <h3 className="text-title-md font-bold text-on-surface mb-2">{t('results.verifyVote')}</h3>
                <p className="text-caption text-on-surface-variant mb-4">{t('results.verifyDesc')}</p>
                
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    placeholder={t('results.trackingId')}
                    className="w-full bg-surface-container-lowest border border-outline rounded-lg py-2 px-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="w-full py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors">
                    {t('results.verifyBtn')}
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <h3 className="text-title-md font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">feed</span>
                  {t('results.news')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-caption text-secondary font-bold">{t('results.news1Time')}</p>
                    <p className="text-sm text-on-surface">{t('results.news1Desc')}</p>
                  </div>
                  <div className="border-t border-outline-variant/30 pt-3">
                    <p className="text-caption text-secondary font-bold">{t('results.news2Time')}</p>
                    <p className="text-sm text-on-surface">{t('results.news2Desc')}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
