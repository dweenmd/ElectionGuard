"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useGrievance } from "@/context/GrievanceContext";
import { useTranslation } from "@/context/UIContext";
import { GrievanceCategory, GrievanceStatus } from "@/types/grievance";
import toast from "react-hot-toast";

const CATEGORIES: GrievanceCategory[] = ["MISCONDUCT", "FRAUD", "TECHNICAL", "HARASSMENT", "OTHER"];

const statusColor: Record<GrievanceStatus, string> = {
  PENDING: "text-secondary bg-secondary/10 border-secondary/30",
  REVIEWING: "text-primary bg-primary/10 border-primary/30",
  RESOLVED: "text-success bg-success/10 border-success/30",
  REJECTED: "text-error bg-error/10 border-error/30",
};

function GrievanceContent() {
  const { myGrievances, addGrievance } = useGrievance();
  const { t } = useTranslation();
  const [category, setCategory] = useState<GrievanceCategory>("MISCONDUCT");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 20) {
      setError(t('grievance.errorTooShort'));
      return;
    }
    setError("");
    addGrievance({ category, description: description.trim() });
    toast.success(t('grievance.submitted'));
    setDescription("");
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('grievance.title')}</h1>
            <p className="text-body-lg text-on-surface-variant">{t('grievance.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 flex flex-col gap-4">
            <div>
              <label className="block text-label-md font-bold text-on-surface mb-2">{t('grievance.category.label')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GrievanceCategory)}
                className="w-full bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`grievance.category.${c}` as any)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-label-md font-bold text-on-surface mb-2">{t('grievance.description')}</label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); if (error) setError(""); }}
                rows={5}
                placeholder={t('grievance.descriptionPlaceholder')}
                className={`w-full bg-surface-container-lowest border rounded-lg px-3 py-2 text-body-md focus:outline-none focus:ring-2 ${error ? "border-error focus:ring-error" : "border-outline focus:ring-primary"}`}
              />
              {error && <p className="text-caption text-error mt-1">{error}</p>}
              <p className="text-caption text-on-surface-variant mt-1">{description.trim().length}/20 {t('grievance.minChars')}</p>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-all active:scale-95">
                {t('grievance.submit')}
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-4">
            <h2 className="text-title-md font-bold text-on-surface">{t('grievance.myComplaints')}</h2>
            {myGrievances.length === 0 && (
              <p className="text-body-md text-on-surface-variant text-center py-8 bg-surface rounded-xl border border-outline-variant">
                {t('grievance.none')}
              </p>
            )}
            {myGrievances.map((g) => (
              <div key={g.id} className="bg-surface rounded-xl shadow-card border border-outline-variant p-5 flex flex-col gap-2 card-hover animate-rise">
                <div className="flex items-center justify-between">
                  <span className="text-label-md font-bold text-on-surface">{t(`grievance.category.${g.category}` as any)}</span>
                  <span className={`text-caption font-bold px-2 py-1 rounded-full border ${statusColor[g.status]}`}>{t(`grievance.status.${g.status}` as any)}</span>
                </div>
                <p className="text-body-md text-on-surface-variant">{g.description}</p>
                {g.adminResponse && (
                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-3 mt-1">
                    <p className="text-caption font-bold text-on-surface-variant mb-1">{t('grievance.ecResponse')}</p>
                    <p className="text-body-md text-on-surface">{g.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GrievancePage() {
  return (
    <ProtectedRoute allowedRoles={["voter"]}>
      <GrievanceContent />
    </ProtectedRoute>
  );
}
