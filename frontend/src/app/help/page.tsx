"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useTranslation, TranslationKey } from "@/context/UIContext";

type FaqKey = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "c1" | "c2" | "c3" | "a1" | "a2" | "a3";

// TODO(backend): role অনুযায়ী FAQ list পরে CMS/backend থেকে আসতে পারে; আপাতত static mapping
const ROLE_FAQ_KEYS: Record<"voter" | "candidate" | "admin", FaqKey[]> = {
  voter: ["q1", "q2", "q3", "q5"],
  candidate: ["c1", "c2", "c3"],
  admin: ["a1", "a2", "a3"],
};

const ROLE_SECTION_TITLE_KEY: Record<"voter" | "candidate" | "admin", TranslationKey> = {
  voter: "help.voterSection",
  candidate: "help.candidateSection",
  admin: "help.adminSection",
};

const ROLE_SECTION_ICON: Record<"voter" | "candidate" | "admin", string> = {
  voter: "how_to_vote",
  candidate: "campaign",
  admin: "admin_panel_settings",
};

const GENERAL_FAQ_KEYS: FaqKey[] = ["q4", "q6"];

function HelpContent() {
  const { role } = useAuth();
  const { t } = useTranslation();
  const activeRole = role ?? "voter";
  const roleKeys = ROLE_FAQ_KEYS[activeRole];
  const [open, setOpen] = useState<string | null>(roleKeys[0] ?? GENERAL_FAQ_KEYS[0]);

  const renderFaqGroup = (keys: FaqKey[]) => (
    <div className="flex flex-col gap-3">
      {keys.map((key) => (
        <div key={key} className="bg-surface rounded-xl shadow-card border border-outline-variant overflow-hidden card-hover">
          <button
            onClick={() => setOpen(open === key ? null : key)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-variant/20 transition-colors"
          >
            <span className="text-body-lg font-bold text-on-surface">{t(`help.${key}.q` as TranslationKey)}</span>
            <span className="material-symbols-outlined text-primary shrink-0 transition-transform duration-200">
              {open === key ? "expand_less" : "expand_more"}
            </span>
          </button>
          {open === key && (
            <div className="px-5 pb-4 text-body-md text-on-surface-variant animate-expand">
              {t(`help.${key}.a` as TranslationKey)}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full flex flex-col gap-8">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('help.title')}</h1>
            <p className="text-body-lg text-on-surface-variant">{t('help.subtitle')}</p>
          </div>

          {/* Role-specific FAQ — logged-in user-এর role অনুযায়ী সবচেয়ে প্রাসঙ্গিক প্রশ্ন আগে দেখানো হয় */}
          <div className="flex flex-col gap-3">
            <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">{ROLE_SECTION_ICON[activeRole]}</span>
              {t(ROLE_SECTION_TITLE_KEY[activeRole])}
            </h2>
            {renderFaqGroup(roleKeys)}
          </div>

          {/* General FAQ — সব role-এর জন্য প্রযোজ্য */}
          <div className="flex flex-col gap-3">
            <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">help</span>
              {t('help.generalSection')}
            </h2>
            {renderFaqGroup(GENERAL_FAQ_KEYS)}
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
