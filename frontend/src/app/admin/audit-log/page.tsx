"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuditLog } from "@/context/AuditLogContext";
import { useTranslation } from "@/context/UIContext";

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "এখনই";
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
  return `${Math.floor(hrs / 24)} দিন আগে`;
}

function AuditLogContent() {
  const { entries } = useAuditLog();
  const { t } = useTranslation();

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-4xl mx-auto w-full flex flex-col gap-6">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('auditLog.title')}</h1>
            <p className="text-body-lg text-on-surface-variant">{t('auditLog.subtitle')}</p>
          </div>

          <div className="bg-surface rounded-xl shadow-card border border-outline-variant overflow-hidden">
            {entries.length === 0 && (
              <p className="text-body-md text-on-surface-variant text-center py-12">{t('auditLog.empty')}</p>
            )}
            <div className="divide-y divide-outline-variant/30">
              {entries.map((e) => (
                <div key={e.id} className="p-4 flex items-start gap-3 hover:bg-surface-variant/20 transition-colors animate-rise">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">history</span>
                  <div className="flex-1">
                    <p className="text-body-md font-bold text-on-surface">{e.action}</p>
                    <p className="text-caption text-on-surface-variant">{e.details}</p>
                    <p className="text-caption text-on-surface-variant mt-1">{e.actor} · {timeAgo(e.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuditLogPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AuditLogContent />
    </ProtectedRoute>
  );
}
