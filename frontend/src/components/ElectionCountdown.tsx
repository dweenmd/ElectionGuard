"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/context/UIContext";
import { ELECTION_DATE, ELECTION_END_DATE } from "@/lib/electionConfig";

function getRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function ElectionCountdown() {
  const { t } = useTranslation();
  const [now, setNow] = useState<Date | null>(null); // null প্রথম client render পর্যন্ত -- SSR hydration mismatch এড়াতে

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant animate-pulse h-32" />
    );
  }

  const votingOpen = now >= ELECTION_DATE && now < ELECTION_END_DATE;
  const votingClosed = now >= ELECTION_END_DATE;
  const remaining = getRemaining(ELECTION_DATE);

  if (votingClosed) {
    return (
      <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant flex items-center gap-3">
        <span className="material-symbols-outlined text-on-surface-variant text-3xl">how_to_vote</span>
        <div>
          <p className="text-body-lg font-bold text-on-surface">{t('countdown.closed')}</p>
          <p className="text-caption text-on-surface-variant">{t('countdown.closedDesc')}</p>
        </div>
      </div>
    );
  }

  if (votingOpen) {
    return (
      <div className="bg-success/10 border border-success/30 rounded-xl p-6 shadow-card flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-success animate-pulse shrink-0" />
        <div>
          <p className="text-body-lg font-bold text-success">{t('countdown.open')}</p>
          <p className="text-caption text-on-surface-variant">{t('countdown.openDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant">
      <p className="text-label-md font-bold text-on-surface-variant mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[18px]">event</span>
        {t('countdown.title')}
      </p>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { value: remaining?.days ?? 0, label: t('countdown.days') },
          { value: remaining?.hours ?? 0, label: t('countdown.hours') },
          { value: remaining?.minutes ?? 0, label: t('countdown.minutes') },
          { value: remaining?.seconds ?? 0, label: t('countdown.seconds') },
        ].map((unit) => (
          <div key={unit.label} className="bg-surface-container-lowest rounded-lg py-2 transition-transform duration-150">
            <p className="text-headline-md font-bold text-primary tabular-nums">{String(unit.value).padStart(2, "0")}</p>
            <p className="text-caption text-on-surface-variant">{unit.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
