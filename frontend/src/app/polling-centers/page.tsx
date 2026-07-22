"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import { getPollingCentersByConstituency } from "@/lib/mockPollingCenters";

function PollingCenterContent() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const centers = user ? getPollingCentersByConstituency(user.constituencyId) : [];

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('pollingCenter.title')}</h1>
            <p className="text-body-lg text-on-surface-variant">{t('pollingCenter.subtitle')} ({user?.constituencyName})</p>
          </div>

          <div className="flex flex-col gap-4">
            {centers.length === 0 && (
              <p className="text-body-md text-on-surface-variant text-center py-8 bg-surface rounded-xl border border-outline-variant">
                {t('pollingCenter.none')}
              </p>
            )}
            {centers.map((c) => (
              <div key={c.id} className="bg-surface rounded-xl shadow-card border border-outline-variant p-5 flex items-start gap-4 card-hover animate-rise">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-body-lg font-bold text-on-surface">{c.name}</h3>
                  <p className="text-body-md text-on-surface-variant">{c.address}</p>
                  <p className="text-caption text-on-surface-variant mt-1">{t('pollingCenter.capacity')}: {c.capacity.toLocaleString()}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3 py-2 bg-primary/10 text-primary rounded-lg text-label-md font-bold hover:bg-primary/20 transition-all active:scale-95 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">directions</span>
                  {t('pollingCenter.directions')}
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PollingCenterPage() {
  return (
    <ProtectedRoute allowedRoles={["voter", "candidate"]}>
      <PollingCenterContent />
    </ProtectedRoute>
  );
}
