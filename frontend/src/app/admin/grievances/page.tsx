"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useGrievance } from "@/context/GrievanceContext";
import { useAuditLog } from "@/context/AuditLogContext";
import { useTranslation } from "@/context/UIContext";
import { GrievanceStatus } from "@/types/grievance";
import { downloadCsv } from "@/lib/csvExport";
import toast from "react-hot-toast";

const statusColor: Record<GrievanceStatus, string> = {
  PENDING: "text-secondary bg-secondary/10 border-secondary/30",
  REVIEWING: "text-primary bg-primary/10 border-primary/30",
  RESOLVED: "text-success bg-success/10 border-success/30",
  REJECTED: "text-error bg-error/10 border-error/30",
};

const STATUSES: GrievanceStatus[] = ["PENDING", "REVIEWING", "RESOLVED", "REJECTED"];

function GrievanceRow({ id }: { id: string }) {
  const { allGrievances, updateStatus } = useGrievance();
  const { logAction } = useAuditLog();
  const { t } = useTranslation();
  const g = allGrievances.find((x) => x.id === id)!;
  const [response, setResponse] = useState(g.adminResponse ?? "");

  return (
    <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-5 flex flex-col gap-3 card-hover animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-label-md font-bold text-on-surface">{g.voterName}</span>
          <span className="text-caption text-on-surface-variant ml-2">· {g.constituencyName} · {t(`grievance.category.${g.category}` as any)}</span>
        </div>
        <span className={`text-caption font-bold px-2 py-1 rounded-full border ${statusColor[g.status]}`}>{t(`grievance.status.${g.status}` as any)}</span>
      </div>
      <p className="text-body-md text-on-surface-variant">{g.description}</p>
      <div className="flex flex-col sm:flex-row gap-2 mt-1">
        <input
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder={t('grievance.responsePlaceholder')}
          className="flex-1 bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={g.status}
          onChange={(e) => {
            updateStatus(g.id, e.target.value as GrievanceStatus, response.trim() || undefined);
            logAction("Grievance Status Updated", `${g.id} (${g.voterName}) → ${e.target.value}`);
            toast.success(t('grievance.statusUpdated'));
          }}
          className="bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`grievance.status.${s}` as any)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function AdminGrievanceContent() {
  const { allGrievances } = useGrievance();
  const { logAction } = useAuditLog();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<GrievanceStatus | "ALL">("ALL");

  const filtered = filter === "ALL" ? allGrievances : allGrievances.filter((g) => g.status === filter);

  const handleExport = () => {
    downloadCsv(
      "grievances.csv",
      ["ID", "Voter", "Constituency", "Category", "Status", "Description", "Date"],
      filtered.map((g) => [g.id, g.voterName, g.constituencyName, g.category, g.status, g.description, g.createdAt])
    );
    logAction("Exported Grievance List", `${filtered.length} grievances exported as CSV`);
    toast.success(t('admin.exportSuccess'));
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('grievance.adminTitle')}</h1>
              <p className="text-body-lg text-on-surface-variant">{t('grievance.adminSubtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className="flex items-center gap-2 bg-surface-container-low border border-outline-variant hover:border-primary px-4 py-2 rounded-lg text-label-md font-bold text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                {t('admin.exportCsv')}
              </button>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as GrievanceStatus | "ALL")}
                className="bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">{t('grievance.allStatuses')}</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{t(`grievance.status.${s}` as any)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filtered.length === 0 && (
              <p className="text-body-md text-on-surface-variant text-center py-8 bg-surface rounded-xl border border-outline-variant">
                {t('grievance.none')}
              </p>
            )}
            {filtered.map((g) => (
              <GrievanceRow key={g.id} id={g.id} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminGrievancePage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminGrievanceContent />
    </ProtectedRoute>
  );
}
