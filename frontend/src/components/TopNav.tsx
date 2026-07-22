"use client";
import { useWeb3 } from "@/context/Web3Context";
import { useAuth } from "@/context/AuthContext";
import { useUI, useTranslation } from "@/context/UIContext";
import { useNotifications } from "@/context/NotificationContext";
import { useFeed } from "@/context/FeedContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import { mockCandidates } from "@/lib/mockCandidates";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "এখনই";
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
  return `${Math.floor(hrs / 24)} দিন আগে`;
}

export default function TopNav() {
  const { address, connectWallet } = useWeb3();
  const { logout, user } = useAuth();
  const { toggleMobileMenu, language, setLanguage } = useUI();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const { visiblePosts } = useFeed();
  const { fontScale, setFontScale, highContrast, toggleHighContrast } = useAccessibility();
  const [mounted, setMounted] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const matchedCandidates = q.length < 2 ? [] : mockCandidates.filter((c) =>
    t(`${c.translationKey}.name` as any).toLowerCase().includes(q) || t(`${c.translationKey}.party` as any).toLowerCase().includes(q)
  ).slice(0, 5);
  const matchedPosts = q.length < 2 ? [] : visiblePosts.filter((p) =>
    p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
  ).slice(0, 5);

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
          {user && (
            <div className="relative w-64">
              <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline rounded-lg px-3 py-1.5">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search')}
                  className="bg-transparent text-body-md focus:outline-none text-on-surface w-full"
                />
              </div>
              {q.length >= 2 && (
                <div className="absolute top-full mt-2 left-0 bg-surface rounded-xl shadow-card border border-outline-variant py-2 w-80 max-h-96 overflow-y-auto z-50 thin-scrollbar animate-dropdown">
                  {matchedCandidates.length === 0 && matchedPosts.length === 0 && (
                    <p className="px-4 py-4 text-caption text-on-surface-variant text-center">{t('common.noResults')}</p>
                  )}
                  {matchedCandidates.length > 0 && (
                    <>
                      <p className="px-4 pt-1 pb-1 text-caption font-bold text-on-surface-variant">{t('common.candidates')}</p>
                      {matchedCandidates.map((c) => (
                        <Link key={c.id} href={`/candidates/${c.id}`} onClick={() => setSearchQuery("")} className="block px-4 py-2 hover:bg-surface-variant/30 transition-colors rounded-lg mx-1">
                          <p className="text-label-md font-bold text-on-surface">{t(`${c.translationKey}.name` as any)}</p>
                          <p className="text-caption text-on-surface-variant">{c.constituencyName}</p>
                        </Link>
                      ))}
                    </>
                  )}
                  {matchedPosts.length > 0 && (
                    <>
                      <p className="px-4 pt-2 pb-1 text-caption font-bold text-on-surface-variant border-t border-outline-variant/30 mt-1">{t('common.feed')}</p>
                      {matchedPosts.map((p) => (
                        <Link key={p.id} href="/feed" onClick={() => setSearchQuery("")} className="block px-4 py-2 hover:bg-surface-variant/30 transition-colors rounded-lg mx-1">
                          <p className="text-label-md font-bold text-on-surface line-clamp-1">{p.title}</p>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-1 md:gap-2">
            {user && (
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead(); }}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors rounded-full flex items-center justify-center relative"
                  title="Notifications"
                >
                  <span className={`material-symbols-outlined text-[20px] ${unreadCount > 0 ? "animate-bell-ring" : ""}`}>notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-surface rounded-xl shadow-card border border-outline-variant py-2 w-80 max-h-96 overflow-y-auto z-50 thin-scrollbar animate-dropdown">
                    <div className="px-4 py-2 border-b border-outline-variant/50">
                      <p className="text-label-md font-bold text-on-surface">{t('notifications.title')}</p>
                    </div>
                    {notifications.length === 0 && (
                      <p className="px-4 py-6 text-caption text-on-surface-variant text-center">{t('notifications.empty')}</p>
                    )}
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setNotifOpen(false)}
                        className="block px-4 py-3 hover:bg-surface-variant/30 border-b border-outline-variant/20 last:border-0 transition-colors"
                      >
                        <p className="text-label-md font-bold text-on-surface">{n.title}</p>
                        <p className="text-caption text-on-surface-variant line-clamp-2 mt-0.5">{n.body}</p>
                        <p className="text-caption text-primary mt-1">{timeAgo(n.createdAt)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {mounted && (
              <div className="relative">
                <button
                  onClick={() => setA11yOpen(!a11yOpen)}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors rounded-full flex items-center justify-center"
                  title="Accessibility"
                >
                  <span className="material-symbols-outlined text-[20px]">accessibility_new</span>
                </button>
                {a11yOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-surface rounded-xl shadow-card border border-outline-variant py-3 px-4 w-64 z-50 flex flex-col gap-3 animate-dropdown">
                    <div>
                      <p className="text-label-md font-bold text-on-surface mb-2">{t('accessibility.fontSize')}</p>
                      <div className="flex gap-2">
                        {[100, 115, 130].map((s) => (
                          <button
                            key={s}
                            onClick={() => setFontScale(s as 100 | 115 | 130)}
                            className={`flex-1 py-1.5 rounded-lg border text-label-sm font-bold transition-colors ${fontScale === s ? "bg-primary text-on-primary border-primary" : "bg-surface-container-lowest text-on-surface border-outline-variant"}`}
                          >
                            {s}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-label-md font-bold text-on-surface">{t('accessibility.highContrast')}</span>
                      <input type="checkbox" checked={highContrast} onChange={toggleHighContrast} className="accent-primary w-4 h-4" />
                    </label>
                  </div>
                )}
              </div>
            )}
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
                  <div className="absolute top-full mt-2 right-0 bg-surface rounded-xl shadow-card border border-outline-variant py-2 w-32 z-50 animate-dropdown">
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
