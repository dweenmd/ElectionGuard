"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";

export default function VotePage() {
  const { isElectionStarted } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        
        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          {!isElectionStarted ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <span className="material-symbols-outlined text-[80px] text-error mb-6">lock</span>
              <h2 className="text-headline-lg text-on-background mb-4">{t('vote.notStarted')}</h2>
              <p className="text-body-lg text-on-surface-variant max-w-lg mb-8">
                {t('vote.lockedDesc')}
              </p>
              <Link href="/voter" className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors">
                {t('vote.returnDashboard')}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-8 md:gap-12">
              {/* Page Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                  <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('vote.title')}</h1>
                  <p className="text-body-lg text-on-surface-variant">{t('vote.subtitle')}</p>
                </div>
                <div className="bg-error-container text-on-error-container px-4 py-2 rounded-lg border border-error/20">
                  <p className="text-label-md font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">timer</span>
                    {t('vote.timeRemaining')}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-secondary-container/50 border border-secondary/20 p-4 md:p-6 rounded-xl flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary text-3xl shrink-0">info</span>
                <div>
                  <h3 className="text-label-md font-bold text-on-surface mb-1">{t('vote.instructions')}</h3>
                  <p className="text-body-md text-on-surface-variant">{t('vote.instructionsDesc')}</p>
                </div>
              </div>

              {/* Candidates */}
              <form className="flex flex-col gap-6" id="ballotForm">
                {/* Candidate 1 */}
                <label className="block relative bg-surface-container-lowest rounded-xl shadow-card border-2 border-transparent transition-all cursor-pointer hover:border-outline-variant has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/20 group">
                  <input className="sr-only peer" name="candidate" type="radio" value="c1" />
                  <div className="flex flex-col sm:flex-row p-6 gap-6 items-center sm:items-start">
                    <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-surface-variant peer-checked:border-primary transition-colors bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                    </div>
                    <div className="flex-grow text-center sm:text-left space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <h2 className="text-headline-md text-on-surface">{t('candidatesData.c1.name')}</h2>
                          <div className="flex items-center justify-center sm:justify-start gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-xl">star</span>
                            <span className="text-label-md">{t('candidatesData.c1.party')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-lg mt-3">
                        <p className="text-caption text-on-surface-variant line-clamp-2">"{t('candidatesData.c1.quote')}"</p>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center shrink-0 transition-colors">
                      <span className="material-symbols-outlined text-transparent peer-checked:text-on-primary transition-colors text-3xl">check</span>
                    </div>
                  </div>
                </label>

                {/* Candidate 2 */}
                <label className="block relative bg-surface-container-lowest rounded-xl shadow-card border-2 border-transparent transition-all cursor-pointer hover:border-outline-variant has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/20 group">
                  <input className="sr-only peer" name="candidate" type="radio" value="c2" />
                  <div className="flex flex-col sm:flex-row p-6 gap-6 items-center sm:items-start">
                    <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-surface-variant peer-checked:border-primary transition-colors bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">person_4</span>
                    </div>
                    <div className="flex-grow text-center sm:text-left space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <h2 className="text-headline-md text-on-surface">{t('candidatesData.c2.name')}</h2>
                          <div className="flex items-center justify-center sm:justify-start gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-xl">eco</span>
                            <span className="text-label-md">{t('candidatesData.c2.party')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-lg mt-3">
                        <p className="text-caption text-on-surface-variant line-clamp-2">"{t('candidatesData.c2.quote')}"</p>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center shrink-0 transition-colors">
                      <span className="material-symbols-outlined text-transparent peer-checked:text-on-primary transition-colors text-3xl">check</span>
                    </div>
                  </div>
                </label>

                {/* Candidate 3 */}
                <label className="block relative bg-surface-container-lowest rounded-xl shadow-card border-2 border-transparent transition-all cursor-pointer hover:border-outline-variant has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/20 group">
                  <input className="sr-only peer" name="candidate" type="radio" value="c3" />
                  <div className="flex flex-col sm:flex-row p-6 gap-6 items-center sm:items-start">
                    <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-surface-variant peer-checked:border-primary transition-colors bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">person_3</span>
                    </div>
                    <div className="flex-grow text-center sm:text-left space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <h2 className="text-headline-md text-on-surface">{t('candidatesData.c3.name')}</h2>
                          <div className="flex items-center justify-center sm:justify-start gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-xl">handshake</span>
                            <span className="text-label-md">{t('candidatesData.c3.party')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-lg mt-3">
                        <p className="text-caption text-on-surface-variant line-clamp-2">"{t('candidatesData.c3.quote')}"</p>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center shrink-0 transition-colors">
                      <span className="material-symbols-outlined text-transparent peer-checked:text-on-primary transition-colors text-3xl">check</span>
                    </div>
                  </div>
                </label>

              </form>

              {/* Submit Area */}
              <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-6 mt-4">
                <div className="flex items-center gap-3 text-on-surface-variant text-caption">
                  <span className="material-symbols-outlined text-primary">security</span>
                  {t('vote.encrypted')}
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-6 py-3 border-2 border-outline text-on-surface hover:bg-surface-variant rounded-lg font-bold transition-colors">
                    {t('common.cancel')}
                  </button>
                  <button 
                    type="button" 
                    className="flex-1 sm:flex-none px-8 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 group"
                  >
                    {t('vote.submitVote')}
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}