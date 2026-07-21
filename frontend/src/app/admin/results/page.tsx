"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useTranslation } from "@/context/UIContext";

export default function AdminResultsPage() {
  const { t } = useTranslation();

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

                <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[60px] opacity-50 mb-4">pending</span>
                  <p className="text-body-lg">{t('results.resultsAfter')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
                  <h3 className="text-label-md text-on-surface-variant mb-2">{t('results.currentVotes')}</h3>
                  <p className="text-display-md text-primary font-bold">142,503</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
                  <h3 className="text-label-md text-on-surface-variant mb-2">{t('results.registeredVoters')}</h3>
                  <p className="text-display-md text-on-surface font-bold">1,020,400</p>
                </div>
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
