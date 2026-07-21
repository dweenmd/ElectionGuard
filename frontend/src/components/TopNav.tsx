"use client";
import { useWeb3 } from "@/context/Web3Context";
import { useAuth } from "@/context/AuthContext";
import { useUI, useTranslation } from "@/context/UIContext";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopNav() {
  const { address, connectWallet } = useWeb3();
  const { logout, user } = useAuth();
  const { toggleMobileMenu, language, setLanguage } = useUI();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="docked full-width top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm z-10 sticky">
      <div className="flex justify-between items-center w-full px-4 md:px-10 py-3 max-w-7xl mx-auto">
        <div className="flex items-center md:hidden gap-3">
          <button onClick={toggleMobileMenu} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <Link href="/" className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-2xl">how_to_vote</span>
            <span className="text-title-md font-bold tracking-tight">ElectionGuard</span>
          </Link>
        </div>
        
        {/* Desktop Navigation & Back */}
        <div className="hidden md:flex items-center gap-4 text-on-surface-variant">
          {pathname !== '/' && (
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-1 hover:text-primary transition-colors bg-surface-variant/30 px-3 py-1.5 rounded-full border border-outline-variant/50 hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="text-sm font-bold">Back</span>
            </button>
          )}
          {user && (
            <span className="text-body-md">
              {t('common.welcome')}, <span className="font-bold text-on-surface">{user.name}</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-1 md:gap-2">
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
            {user && (
              <button 
                onClick={logout}
                className="p-2 text-error hover:bg-error/10 transition-colors rounded-full flex items-center justify-center" 
                title={t('common.logout')}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            )}
          </div>
          {address ? (
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-success/10 text-success border border-success/30 rounded-lg text-label-md font-bold">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              {address.slice(0, 6)}...{address.slice(-4)}
            </button>
          ) : (
            <button 
              onClick={connectWallet}
              className="hidden md:flex px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-bold hover:bg-primary/90 transition-all shadow-sm hover:shadow"
            >
              {t('common.connectWallet')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
