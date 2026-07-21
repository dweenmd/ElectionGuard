"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useTranslation } from "@/context/UIContext";

// এই page অ্যাডমিন প্যানেলে সকল প্রার্থীদের তালিকা দেখায় এবং তাদের ডকুমেন্ট যাচাই করার সুবিধা দেয়
export default function AdminCandidatesPage() {
  const { t } = useTranslation();

  const candidates = [
    { id: "C001", name: t('candidatesData.c1.name'), party: t('candidatesData.c1.party'), constituency: "Dhaka-10", docStatus: t('admin.verified'), nominationStatus: t('admin.accepted') },
    { id: "C002", name: t('candidatesData.c2.name'), party: t('candidatesData.c2.party'), constituency: "Dhaka-10", docStatus: t('admin.pending'), nominationStatus: t('admin.underReview') },
    { id: "C003", name: t('candidatesData.c3.name'), party: t('candidatesData.c3.party'), constituency: "Dhaka-10", docStatus: t('admin.verified'), nominationStatus: t('admin.accepted') },
    { id: "C004", name: t('candidatesData.c4.name'), party: t('candidatesData.c4.party'), constituency: "Dhaka-5", docStatus: t('admin.rejected'), nominationStatus: t('admin.rejected') },
  ];

  const statusColor: Record<string, string> = {
    Verified: "text-success bg-success/10 border-success/30",
    Pending: "text-secondary bg-secondary/10 border-secondary/30",
    Rejected: "text-error bg-error/10 border-error/30",
    Accepted: "text-success bg-success/10 border-success/30",
    "Under Review": "text-secondary bg-secondary/10 border-secondary/30",
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
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-4 py-2 rounded-lg">
              <span className="material-symbols-outlined text-primary">group</span>
              <span className="text-label-md font-bold text-on-surface">{candidates.length} {t('admin.totalCandidates')}</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface rounded-xl p-4 shadow-card border border-outline-variant text-center">
              <p className="text-caption text-on-surface-variant mb-1">{t('admin.total')}</p>
              <p className="text-headline-md font-bold text-primary">4</p>
            </div>
            <div className="bg-surface rounded-xl p-4 shadow-card border border-outline-variant text-center">
              <p className="text-caption text-on-surface-variant mb-1">{t('admin.verified')}</p>
              <p className="text-headline-md font-bold text-success">2</p>
            </div>
            <div className="bg-surface rounded-xl p-4 shadow-card border border-outline-variant text-center">
              <p className="text-caption text-on-surface-variant mb-1">{t('admin.pending')}</p>
              <p className="text-headline-md font-bold text-secondary">1</p>
            </div>
            <div className="bg-surface rounded-xl p-4 shadow-card border border-outline-variant text-center">
              <p className="text-caption text-on-surface-variant mb-1">{t('admin.rejected')}</p>
              <p className="text-headline-md font-bold text-error">1</p>
            </div>
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
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="p-4 text-body-md font-mono text-on-surface-variant">{c.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">person</span>
                          </div>
                          <span className="text-body-md font-bold text-on-surface">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-body-md text-on-surface-variant">{c.party}</td>
                      <td className="p-4 text-body-md text-on-surface">{c.constituency}</td>
                      <td className="p-4">
                        <span className={`text-label-md px-2 py-1 rounded-full border ${statusColor[c.docStatus]}`}>
                          {c.docStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-label-md px-2 py-1 rounded-full border ${statusColor[c.nominationStatus]}`}>
                          {c.nominationStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors" title="View Documents">
                            <span className="material-symbols-outlined text-[18px]">folder_open</span>
                          </button>
                          <button className="p-2 hover:bg-success/10 text-success rounded-lg transition-colors" title="Approve">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          </button>
                          <button className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors" title="Reject">
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
