"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";

const WARNING_AFTER_MS = 10 * 60 * 1000; // ১০ মিনিট নিষ্ক্রিয় থাকলে সতর্কতা
const LOGOUT_AFTER_MS = 11 * 60 * 1000; // আরও ১ মিনিট পর auto-logout
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export default function IdleTimeoutGuard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [showWarning, setShowWarning] = useState(false);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    warnTimer.current = setTimeout(() => setShowWarning(true), WARNING_AFTER_MS);
    logoutTimer.current = setTimeout(() => logout(), LOGOUT_AFTER_MS);
  }, [clearTimers, logout]);

  useEffect(() => {
    if (!user) {
      clearTimers();
      setShowWarning(false);
      return;
    }
    resetTimers();
    const handler = () => { if (!showWarning) resetTimers(); };
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, handler));
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, handler));
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user || !showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 max-w-sm w-full flex flex-col items-center text-center gap-4">
        <span className="material-symbols-outlined text-4xl text-secondary">schedule</span>
        <div>
          <p className="text-body-lg font-bold text-on-surface">{t('idleTimeout.title')}</p>
          <p className="text-body-md text-on-surface-variant mt-1">{t('idleTimeout.desc')}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={logout} className="flex-1 px-4 py-2 border border-outline-variant rounded-lg font-bold text-on-surface hover:bg-surface-variant/30 transition-colors">
            {t('common.logout')}
          </button>
          <button onClick={resetTimers} className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors">
            {t('idleTimeout.stayLoggedIn')}
          </button>
        </div>
      </div>
    </div>
  );
}
