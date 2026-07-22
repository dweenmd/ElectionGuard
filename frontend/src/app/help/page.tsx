"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTranslation } from "@/context/UIContext";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"];

function HelpContent() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<string | null>("q1");

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('help.title')}</h1>
            <p className="text-body-lg text-on-surface-variant">{t('help.subtitle')}</p>
          </div>

          <div className="flex flex-col gap-3">
            {FAQ_KEYS.map((key) => (
              <div key={key} className="bg-surface rounded-xl shadow-card border border-outline-variant overflow-hidden card-hover">
                <button
                  onClick={() => setOpen(open === key ? null : key)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-variant/20 transition-colors"
                >
                  <span className="text-body-lg font-bold text-on-surface">{t(`help.${key}.q` as any)}</span>
                  <span className="material-symbols-outlined text-primary shrink-0 transition-transform duration-200">{open === key ? "expand_less" : "expand_more"}</span>
                </button>
                {open === key && (
                  <div className="px-5 pb-4 text-body-md text-on-surface-variant animate-expand">{t(`help.${key}.a` as any)}</div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-secondary-container/30 border border-secondary/20 rounded-xl p-6 flex items-center gap-4">
            <span className="material-symbols-outlined text-secondary text-3xl">support_agent</span>
            <div>
              <p className="text-label-md font-bold text-on-surface">{t('help.stillNeedHelp')}</p>
              <p className="text-caption text-on-surface-variant">{t('help.contactDesc')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HelpPage() {
  return (
    <ProtectedRoute allowedRoles={["voter", "candidate", "admin"]}>
      <HelpContent />
    </ProtectedRoute>
  );
}
