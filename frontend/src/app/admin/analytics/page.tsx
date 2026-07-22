"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTranslation } from "@/context/UIContext";
import { mockTurnout } from "@/lib/mockTurnout";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { SkeletonStatCard } from "@/components/ui/Skeleton";

function AnalyticsContent() {
  const { t } = useTranslation();
  const isLoading = useSimulatedLoading();

  const totalRegistered = mockTurnout.reduce((s, r) => s + r.registered, 0);
  const totalVoted = mockTurnout.reduce((s, r) => s + r.voted, 0);
  const overallPct = totalRegistered > 0 ? Math.round((totalVoted / totalRegistered) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-6">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('analytics.title')}</h1>
            <p className="text-body-lg text-on-surface-variant">{t('analytics.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
              </>
            ) : (
              <>
                <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant text-center">
                  <p className="text-label-md text-on-surface-variant mb-2">{t('analytics.totalRegistered')}</p>
                  <p className="text-headline-md font-bold text-on-surface">{totalRegistered.toLocaleString()}</p>
                </div>
                <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant text-center">
                  <p className="text-label-md text-on-surface-variant mb-2">{t('analytics.totalVoted')}</p>
                  <p className="text-headline-md font-bold text-primary">{totalVoted.toLocaleString()}</p>
                </div>
                <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant text-center">
                  <p className="text-label-md text-on-surface-variant mb-2">{t('analytics.overallTurnout')}</p>
                  <p className="text-headline-md font-bold text-success">{overallPct}%</p>
                </div>
              </>
            )}
          </div>

          <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6">
            <h2 className="text-title-md font-bold text-on-surface mb-4">{t('analytics.byConstituency')}</h2>
            {isLoading ? (
              <div className="flex flex-col gap-4">
                <div className="animate-pulse h-16 bg-surface-variant/40 rounded-lg" />
                <div className="animate-pulse h-16 bg-surface-variant/40 rounded-lg" />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {mockTurnout.map((row) => {
                  const pct = row.registered > 0 ? Math.round((row.voted / row.registered) * 100) : 0;
                  return (
                    <div key={row.constituencyId}>
                      <div className="flex justify-between items-center text-body-md mb-1">
                        <span className="font-bold text-on-surface">{row.constituencyName}</span>
                        <span className="text-on-surface-variant">{row.voted.toLocaleString()} / {row.registered.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-3">
                        <div className="h-3 rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
