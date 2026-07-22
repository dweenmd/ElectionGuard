"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ElectionCountdown from "@/components/ElectionCountdown";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import { getCandidatesByConstituency } from "@/lib/mockCandidates";

export default function VoterDashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isLoading = useSimulatedLoading();
  const myCandidates = user ? getCandidatesByConstituency(user.constituencyId) : [];
  
  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        
        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('voterDashboard.title')}</h1>
              <p className="text-body-lg text-on-surface-variant">{t('voterDashboard.subtitle')}</p>
            </div>
            <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="text-label-md font-bold text-on-surface">{user?.constituencyName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Candidates Section */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <h2 className="text-headline-md text-on-surface">{t('voterDashboard.candidatesTitle')}</h2>
                <span className="text-caption text-on-surface-variant bg-surface-variant px-2 py-1 rounded">{myCandidates.length} {t('voterDashboard.candidatesCountLabel')}</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {isLoading && (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                )}
                {!isLoading && myCandidates.map((c) => (
                  <div key={c.id} className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant flex flex-col sm:flex-row gap-6 items-start card-hover animate-rise">
                    <div className="w-20 h-20 rounded-full bg-surface-container-high border-4 border-surface-variant flex items-center justify-center shrink-0 overflow-hidden">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">{c.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-body-lg font-bold text-on-surface">{t(`${c.translationKey}.name` as any)}</h3>
                          <p className="text-caption text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">star</span> {t(`${c.translationKey}.party` as any)}
                          </p>
                        </div>
                        <Link href={`/candidates/${c.id}`} className="text-primary text-label-md font-bold hover:underline shrink-0">{t('common.details')}</Link>
                      </div>
                      <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant/50">
                        <p className="text-body-md text-on-surface italic">&quot;{t(`${c.translationKey}.quote` as any)}&quot;</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!isLoading && myCandidates.length === 0 && (
                  <p className="text-body-md text-on-surface-variant text-center py-8">{t('voterDashboard.noCandidates')}</p>
                )}
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="flex flex-col gap-6">
              <ElectionCountdown />

              <div className="bg-primary text-on-primary rounded-xl p-6 shadow-card flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-[100px]">how_to_vote</span>
                </div>
                <h3 className="text-headline-md relative z-10">{t('voterDashboard.ballotPaper')}</h3>
                <p className="text-body-md text-primary-fixed relative z-10">{t('voterDashboard.ballotDesc')}</p>
                <Link href="/vote" className="mt-2 bg-on-primary text-primary px-4 py-2 rounded font-bold text-center hover:opacity-90 transition-opacity relative z-10">
                  {t('voterDashboard.viewBallot')}
                </Link>
              </div>

              <Link href="/voter/verify" className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant hover:border-primary transition-colors flex flex-col gap-2 group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">fingerprint</span>
                  <h3 className="text-label-md font-bold text-on-surface">{t('voterDashboard.biometricVerify')}</h3>
                </div>
                <p className="text-caption text-on-surface-variant">{t('voterDashboard.biometricDesc')}</p>
              </Link>
              
              <Link href="/voter/upload" className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant hover:border-primary transition-colors flex flex-col gap-2 group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">upload_file</span>
                  <h3 className="text-label-md font-bold text-on-surface">{t('common.uploadDocs')}</h3>
                </div>
                <p className="text-caption text-on-surface-variant">{t('voterDashboard.docUploadDesc')}</p>
              </Link>

              <Link href="/grievance" className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant hover:border-primary transition-colors flex flex-col gap-2 group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">report</span>
                  <h3 className="text-label-md font-bold text-on-surface">{t('common.grievance')}</h3>
                </div>
                <p className="text-caption text-on-surface-variant">{t('grievance.subtitle')}</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
