"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTranslation } from "@/context/UIContext";
import { api } from "@/lib/api";

export default function ResultsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalVotes: 142503, totalRegistered: 1020400, electionState: "Voting" });
  const [candidates, setCandidates] = useState<Array<{ id: number; name: string; party: string; voteCount: number }>>([]);

  useEffect(() => {
    api.analytics.getTurnout()
      .then((data) => {
        if (data.totalRegistered) {
          setStats((prev) => ({
            ...prev,
            totalVotes: data.totalVoted,
            totalRegistered: data.totalRegistered,
          }));
        }
      })
      .catch((err) => {
        console.warn("Turnout API fetch failed, fallback to default", err);
      });

    api.analytics.getResults()
      .then((data) => {
        if (data.candidates) {
          setCandidates(data.candidates);
        }
        if (data.electionState) {
          setStats((prev) => ({ ...prev, electionState: data.electionState }));
        }
      })
      .catch((err) => {
        console.warn("Results API fetch failed, fallback to default", err);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 py-4 px-4 md:px-10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-3xl">how_to_vote</span>
            <span className="text-headline-md font-bold tracking-tight">ElectionGuard</span>
          </Link>
          <nav className="flex items-center gap-6">
            <ThemeToggle />
            <Link href="/" className="text-label-md font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">home</span> {t('common.backToHome')}
            </Link>
            <Link href="/login" className="hidden md:flex px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-bold hover:bg-primary/90 transition-all shadow-sm">
              {t('nav.loginPortal')}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-7xl mx-auto p-4 md:p-10">
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
                  <span className="text-label-md font-bold">{stats.electionState === "Ended" ? "Results Declared" : t('results.votingOngoing')}</span>
                </div>
              </div>

              {candidates.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {candidates.map((c) => (
                    <div key={c.id} className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-on-surface">{c.name}</h4>
                        <p className="text-sm text-on-surface-variant">{c.party}</p>
                      </div>
                      <span className="text-headline-sm font-bold text-primary">{c.voteCount.toLocaleString()} votes</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[60px] opacity-50 mb-4">pending</span>
                  <p className="text-body-lg">{t('results.resultsAfter')}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
                <h3 className="text-label-md text-on-surface-variant mb-2">{t('results.currentVotes')}</h3>
                <p className="text-display-md text-primary font-bold">{stats.totalVotes.toLocaleString()}</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
                <h3 className="text-label-md text-on-surface-variant mb-2">{t('results.registeredVoters')}</h3>
                <p className="text-display-md text-on-surface font-bold">{stats.totalRegistered.toLocaleString()}</p>
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
      </main>
    </div>
  );
}