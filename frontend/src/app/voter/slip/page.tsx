"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import { getPollingCentersByConstituency } from "@/lib/mockPollingCenters";

function VoterSlipContent() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const center = user ? getPollingCentersByConstituency(user.constituencyId)[0] : undefined;
  const qrData = encodeURIComponent(`ElectionGuard|${user?.id}|${user?.constituencyId}`);

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-2xl mx-auto w-full flex flex-col gap-6 print:p-0">
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('voterSlip.title')}</h1>
              <p className="text-body-lg text-on-surface-variant">{t('voterSlip.subtitle')}</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-5 py-3 bg-primary text-on-primary rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined">print</span>
              {t('voterSlip.print')}
            </button>
          </div>

          <div className="bg-surface rounded-xl shadow-card border-2 border-primary/30 p-8 print:border print:shadow-none">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-6">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-3xl">how_to_vote</span>
                <span className="text-title-md font-bold">ElectionGuard</span>
              </div>
              <span className="text-caption font-bold text-on-surface-variant">{t('voterSlip.official')}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${qrData}`}
                alt="Voter QR code"
                width={140}
                height={140}
                className="border border-outline-variant rounded-lg shrink-0"
              />
              <div className="flex-1 w-full grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-on-surface-variant">{t('voterSlip.name')}</p>
                  <p className="text-body-lg font-bold text-on-surface">{user?.name}</p>
                </div>
                <div>
                  <p className="text-caption text-on-surface-variant">{t('voterSlip.voterId')}</p>
                  <p className="text-body-lg font-bold text-on-surface font-mono">{user?.id}</p>
                </div>
                <div>
                  <p className="text-caption text-on-surface-variant">{t('voterSlip.constituency')}</p>
                  <p className="text-body-lg font-bold text-on-surface">{user?.constituencyName}</p>
                </div>
                <div>
                  <p className="text-caption text-on-surface-variant">{t('voterSlip.center')}</p>
                  <p className="text-body-lg font-bold text-on-surface">{center?.name ?? "-"}</p>
                </div>
              </div>
            </div>

            <p className="text-caption text-on-surface-variant mt-6 border-t border-outline-variant pt-4">
              {t('voterSlip.disclaimer')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VoterSlipPage() {
  return (
    <ProtectedRoute allowedRoles={["voter"]}>
      <VoterSlipContent />
    </ProtectedRoute>
  );
}
