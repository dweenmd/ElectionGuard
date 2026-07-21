"use client";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useTranslation } from "@/context/UIContext";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUI } from "@/context/UIContext";

export default function Home() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useUI();
  const [mounted, setMounted] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 py-4 px-4 md:px-10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">how_to_vote</span>
            <span className="text-headline-md font-bold tracking-tight">ElectionGuard</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            
            {mounted && (
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors rounded-full flex items-center justify-center" 
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              </button>
            )}

            {mounted && (
              <div className="relative">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors rounded-full flex items-center justify-center gap-1" 
                  title={t('common.changeLanguage')}
                >
                  <span className="material-symbols-outlined text-[20px]">language</span>
                  <span className="text-xs font-bold uppercase">{language}</span>
                </button>
                
                {langMenuOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-surface rounded-xl shadow-card border border-outline-variant py-2 w-32 z-50">
                    <button 
                      onClick={() => { setLanguage('bn'); setLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-label-md hover:bg-surface-variant transition-colors ${language === 'bn' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface'}`}
                    >
                      বাংলা
                    </button>
                    <button 
                      onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-label-md hover:bg-surface-variant transition-colors ${language === 'en' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface'}`}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>
            )}

            <Link href="/results" className="text-label-md font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">bar_chart</span> {t('common.results')}
            </Link>
            
            <Link href="/login" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-bold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              {t('nav.loginPortal')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-20 px-4 md:px-10 overflow-hidden w-full min-h-[70vh]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container opacity-50 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container opacity-50 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-4xl w-full text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container text-on-primary-container border border-primary/20 animate-fade-in text-sm font-bold">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            Next-Gen Voting System
          </div>
          
          <h1 className="text-display-md md:text-display-lg text-on-surface font-bold tracking-tight">
            {t('landing.heroTitle')}
          </h1>
          
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-8">
            <Link href="/login" className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-ambient hover:shadow-card hover:border-primary transition-all flex flex-col items-center justify-center gap-4 text-on-surface hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <span className="text-label-md font-bold">{t('landing.voterPortal')}</span>
            </Link>

            <Link href="/login" className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-ambient hover:shadow-card hover:border-primary transition-all flex flex-col items-center justify-center gap-4 text-on-surface hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">badge</span>
              </div>
              <span className="text-label-md font-bold">{t('landing.candidatePortal')}</span>
            </Link>

            <Link href="/login" className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-ambient hover:shadow-card hover:border-primary transition-all flex flex-col items-center justify-center gap-4 text-on-surface hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
              <span className="text-label-md font-bold">{t('landing.adminPortal')}</span>
            </Link>

            <Link href="/results" className="group bg-primary text-on-primary border border-transparent rounded-xl p-6 shadow-ambient hover:shadow-card hover:bg-primary/90 transition-all flex flex-col items-center justify-center gap-4 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <span className="material-symbols-outlined text-[60px]">bar_chart</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-on-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                <span className="material-symbols-outlined text-3xl">monitoring</span>
              </div>
              <span className="text-label-md font-bold relative z-10">{t('landing.liveResults')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-container-lowest py-20 px-4 md:px-10 border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-display-sm font-bold text-on-surface mb-4">{t('landing.featuresTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 gap-4">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[40px]">link</span>
              </div>
              <h3 className="text-title-lg font-bold text-on-surface">{t('landing.feature1Title')}</h3>
              <p className="text-body-md text-on-surface-variant">{t('landing.feature1Desc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 gap-4">
              <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[40px]">enhanced_encryption</span>
              </div>
              <h3 className="text-title-lg font-bold text-on-surface">{t('landing.feature2Title')}</h3>
              <p className="text-body-md text-on-surface-variant">{t('landing.feature2Desc')}</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 gap-4">
              <div className="w-20 h-20 bg-success/10 text-success rounded-2xl flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[40px]">fingerprint</span>
              </div>
              <h3 className="text-title-lg font-bold text-on-surface">{t('landing.feature3Title')}</h3>
              <p className="text-body-md text-on-surface-variant">{t('landing.feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-surface py-20 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-display-sm font-bold text-on-surface mb-4">{t('landing.howItWorksTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-outline-variant -translate-y-1/2 z-0"></div>
            
            <div className="bg-surface border border-outline-variant rounded-xl p-8 relative z-10 shadow-card flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-title-md">1</div>
              <h3 className="text-title-md font-bold text-on-surface mt-2">{t('landing.step1Title')}</h3>
              <p className="text-body-sm text-on-surface-variant">{t('landing.step1Desc')}</p>
            </div>

            <div className="bg-surface border border-outline-variant rounded-xl p-8 relative z-10 shadow-card flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-title-md">2</div>
              <h3 className="text-title-md font-bold text-on-surface mt-2">{t('landing.step2Title')}</h3>
              <p className="text-body-sm text-on-surface-variant">{t('landing.step2Desc')}</p>
            </div>

            <div className="bg-surface border border-outline-variant rounded-xl p-8 relative z-10 shadow-card flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-title-md">3</div>
              <h3 className="text-title-md font-bold text-on-surface mt-2">{t('landing.step3Title')}</h3>
              <p className="text-body-sm text-on-surface-variant">{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center border-t border-outline-variant/30 text-on-surface-variant text-caption bg-surface-container-lowest mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-10 gap-4">
          <p>© 2026 ElectionGuard. Secured by Blockchain Technology.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
