"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useTranslation } from "@/context/UIContext";
import { useCandidates } from "@/context/CandidateContext";
import { useAuditLog } from "@/context/AuditLogContext";
import { DocStatusKey, NominationStatusKey } from "@/types/candidate";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { SkeletonStatCard, SkeletonTableRow } from "@/components/ui/Skeleton";
import { downloadCsv } from "@/lib/csvExport";
import toast from "react-hot-toast";

export default function AdminCandidatesPage() {
  const { t } = useTranslation();
  const isLoading = useSimulatedLoading();
  const { candidates, updateCandidateStatus } = useCandidates();
  const { logAction } = useAuditLog();

  const statusColor: Record<DocStatusKey | NominationStatusKey, string> = {
    verified: "text-success bg-success/10 border-success/30",
    accepted: "text-success bg-success/10 border-success/30",
    pending: "text-secondary bg-secondary/10 border-secondary/30",
    underReview: "text-secondary bg-secondary/10 border-secondary/30",
    rejected: "text-error bg-error/10 border-error/30",
  };

  const total = candidates.length;
  const verifiedCount = candidates.filter((c) => c.docStatusKey === "verified").length;
  const pendingCount = candidates.filter((c) => c.docStatusKey === "pending").length;
  const rejectedCount = candidates.filter((c) => c.docStatusKey === "rejected").length;

  const handleApprove = (id: string) => {
    updateCandidateStatus(id, "verified", "accepted");
    logAction("Candidate Approved", `${id} approved and verified`);
    toast.success(t('admin.actionApproved'));
  };

  const handleReject = (id: string) => {
    updateCandidateStatus(id, "rejected", "rejected");
    logAction("Candidate Rejected", `${id} rejected`);
    toast.success(t('admin.actionRejected'));
  };

  const handleExport = () => {
    downloadCsv(
      "candidates.csv",
      ["ID", "Name", "Party", "Constituency", "Doc Status", "Nomination Status"],
      candidates.map((c) => [c.id, t(`${c.translationKey}.name` as any), t(`${c.translationKey}.party` as any), c.constituencyName, c.docStatusKey, c.nominationStatusKey])
    );
    logAction("Exported Candidate List", `${candidates.length} candidates exported as CSV`);
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-outline-variant pb-6">
            <div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('admin.candidateManagement')}</h1>
              <p className="text-body-lg text-on-surface-variant">{t('admin.candidateManagementDesc')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className="flex items-center gap-2 bg-surface-container-low border border-outline-variant hover:border-primary px-4 py-2 rounded-lg text-label-md font-bold text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                {t('admin.exportCsv')}
              </button>
              <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-4 py-2 rounded-lg">
                <span className="material-symbols-outlined text-primary">group</span>
                <span className="text-label-md font-bold text-on-surface">{total} {t('admin.totalCandidates')}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {isLoading ? (
              <>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
              </>
            ) : (
              <>
                <div className="bg-surface rounded-xl p-4 shadow-card border border-outline-variant text-center">
                  <p className="text-caption text-on-surface-variant mb-1">{t('admin.total')}</p>
                  <p className="text-headline-md font-bold text-primary">{total}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 shadow-card border border-outline-variant text-center">
                  <p className="text-caption text-on-surface-variant mb-1">{t('admin.verified')}</p>
                  <p className="text-headline-md font-bold text-success">{verifiedCount}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 shadow-card border border-outline-variant text-center">
                  <p className="text-caption text-on-surface-variant mb-1">{t('admin.pending')}</p>
                  <p className="text-headline-md font-bold text-secondary">{pendingCount}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 shadow-card border border-outline-variant text-center">
                  <p className="text-caption text-on-surface-variant mb-1">{t('admin.rejected')}</p>
                  <p className="text-headline-md font-bold text-error">{rejectedCount}</p>
                </div>
              </>
            )}
          </div>

          {/* Candidates Table */}
          <div className="bg-surface rounded-xl shadow-card border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-md font-bold text-on-surface">{t('admin.allCandidates')}</h2>
              <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline rounded-lg px-3 py-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
                <input type="text" placeholder={t('admin.searchCandidate')} className="bg-transparent text-body-md focus:outline-none text-on-surface w-40" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-lowest border-b border-outline-variant">
                  <tr>
                    <th className="text-left p-4 text-label-md text-on-surface-variant">{t('admin.id')}</th>
                    <th className="text-left p-4 text-label-md text-on-surface-variant">{t('admin.name')}</th>
                    <th className="text-left p-4 text-label-md text-on-surface-variant">{t('admin.party')}</th>
                    <th className="text-left p-4 text-label-md text-on-surface-variant">{t('admin.constituency')}</th>
                    <th className="text-left p-4 text-label-md text-on-surface-variant">{t('admin.documents')}</th>
                    <th className="text-left p-4 text-label-md text-on-surface-variant">{t('admin.nomination')}</th>
                    <th className="text-left p-4 text-label-md text-on-surface-variant">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {isLoading && (
                    <>
                      <SkeletonTableRow cols={7} />
                      <SkeletonTableRow cols={7} />
                      <SkeletonTableRow cols={7} />
                    </>
                  )}
                  {!isLoading && candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="p-4 text-body-md font-mono text-on-surface-variant">{c.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">{c.icon}</span>
                          </div>
                          <span className="text-body-md font-bold text-on-surface">{t(`${c.translationKey}.name` as any)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-body-md text-on-surface-variant">{t(`${c.translationKey}.party` as any)}</td>
                      <td className="p-4 text-body-md text-on-surface">{c.constituencyName}</td>
                      <td className="p-4">
                        <span className={`text-label-md px-2 py-1 rounded-full border ${statusColor[c.docStatusKey]}`}>
                          {t(`admin.${c.docStatusKey}` as any)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-label-md px-2 py-1 rounded-full border ${statusColor[c.nominationStatusKey]}`}>
                          {t(`admin.${c.nominationStatusKey}` as any)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors" title="View Documents">
                            <span className="material-symbols-outlined text-[18px]">folder_open</span>
                          </button>
                          <button onClick={() => handleApprove(c.id)} className="p-2 hover:bg-success/10 text-success rounded-lg transition-colors" title="Approve">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          </button>
                          <button onClick={() => handleReject(c.id)} className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors" title="Reject">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
