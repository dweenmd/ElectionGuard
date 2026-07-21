"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useTranslation } from "@/context/UIContext";

export default function CandidateDashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('candidate.candidateDashboardTitle')}</h1>
              <p className="text-body-lg text-on-surface-variant">{t('candidate.candidateDashboardDesc')}</p>
            </div>
            <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="text-label-md font-bold text-on-surface">{t('candidate.dhaka10')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Stats */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">visibility</span>
                </div>
                <div>
                  <h3 className="text-caption text-on-surface-variant uppercase font-bold tracking-wider mb-1">{t('candidate.profileViews')}</h3>
                  <p className="text-headline-md font-bold text-on-surface">12,450</p>
                </div>
              </div>
              
              <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">thumb_up</span>
                </div>
                <div>
                  <h3 className="text-caption text-on-surface-variant uppercase font-bold tracking-wider mb-1">{t('candidate.manifestoLikes')}</h3>
                  <p className="text-headline-md font-bold text-on-surface">3,200</p>
                </div>
              </div>

              <div className="sm:col-span-2 bg-surface rounded-xl p-6 shadow-card border border-outline-variant">
                <h2 className="text-title-md font-bold text-on-surface mb-4 border-b border-outline-variant pb-2">{t('candidate.nominationStatus')}</h2>
                
                <div className="flex items-center gap-4 p-4 bg-success-container/20 border border-success/30 rounded-lg">
                  <span className="material-symbols-outlined text-success text-3xl">verified</span>
                  <div>
                    <h3 className="text-label-md font-bold text-on-surface">{t('candidate.verifiedCandidate')}</h3>
                    <p className="text-body-md text-on-surface-variant">{t('candidate.verifiedCandidateDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="flex flex-col gap-4">
              <Link href="/candidate/upload" className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant hover:border-primary transition-colors flex flex-col gap-2 group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">upload_file</span>
                  <h3 className="text-label-md font-bold text-on-surface">{t('common.uploadDocs')}</h3>
                </div>
                <p className="text-caption text-on-surface-variant">{t('candidate.uploadDocsDesc')}</p>
              </Link>
              
              <Link href="/candidate/campaign" className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant hover:border-primary transition-colors flex flex-col gap-2 group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">campaign</span>
                  <h3 className="text-label-md font-bold text-on-surface">{t('common.campaign')}</h3>
                </div>
                <p className="text-caption text-on-surface-variant">{t('candidate.updateCampaignDesc')}</p>
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}