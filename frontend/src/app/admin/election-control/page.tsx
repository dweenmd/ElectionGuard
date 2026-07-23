"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/context/AuthContext";
import { useAuditLog } from "@/context/AuditLogContext";
import { useTranslation } from "@/context/UIContext";
import { ELECTION_DATE, ELECTION_END_DATE } from "@/lib/electionConfig";

export default function AdminElectionControlPage() {
  const { isElectionStarted, toggleElection } = useAuth();
  const { logAction } = useAuditLog();
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmToggle = () => {
    const startingNow = !isElectionStarted;
    toggleElection();
    // TODO(backend): এখানে আসল POST /api/election/status কল হবে
    logAction(
      startingNow ? "Election Started" : "Election Stopped",
      startingNow
        ? "Voting was opened platform-wide for all voters and candidates"
        : "Voting was closed platform-wide"
    );
    toast.success(startingNow ? t("electionControl.startedToast") : t("electionControl.stoppedToast"));
    setShowConfirm(false);
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full flex flex-col gap-8">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t("electionControl.title")}</h1>
            <p className="text-body-lg text-on-surface-variant">{t("electionControl.subtitle")}</p>
          </div>

          {/* Status card */}
          <div
            className={`rounded-xl border-2 p-6 md:p-10 flex flex-col items-center text-center gap-4 transition-colors ${
              isElectionStarted ? "bg-success/10 border-success/30" : "bg-surface-container-lowest border-outline-variant"
            }`}
          >
            <span className={`material-symbols-outlined text-[64px] ${isElectionStarted ? "text-success" : "text-on-surface-variant"}`}>
              {isElectionStarted ? "lock_open" : "lock"}
            </span>
            <div>
              <p className={`text-headline-md font-bold ${isElectionStarted ? "text-success" : "text-on-surface"}`}>
                {isElectionStarted ? t("electionControl.statusActive") : t("electionControl.statusInactive")}
              </p>
              <p className="text-body-md text-on-surface-variant mt-2 max-w-md">
                {isElectionStarted ? t("electionControl.statusActiveDesc") : t("electionControl.statusInactiveDesc")}
              </p>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className={`mt-2 px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                isElectionStarted
                  ? "bg-error text-on-error hover:bg-error/90"
                  : "bg-primary text-on-primary hover:bg-primary/90"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isElectionStarted ? "stop_circle" : "play_circle"}
              </span>
              {isElectionStarted ? t("electionControl.stopButton") : t("electionControl.startButton")}
            </button>
          </div>

          {/* Scheduled window — reference only, toggle above is the real switch */}
          <div className="bg-secondary-container/40 border border-secondary/20 rounded-xl p-5 flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary text-2xl shrink-0">event</span>
            <div>
              <p className="text-label-md font-bold text-on-surface mb-1">{t("electionControl.scheduledWindow")}</p>
              <p className="text-body-md text-on-surface-variant">
                {ELECTION_DATE.toLocaleString()} &ndash; {ELECTION_END_DATE.toLocaleString()}
              </p>
              <p className="text-caption text-on-surface-variant mt-2">{t("electionControl.scheduledWindowNote")}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Confirm modal — election-wide toggle, তাই accidental click থেকে বাঁচাতে confirm নেওয়া হচ্ছে */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 max-w-md w-full flex flex-col items-center text-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span className={`material-symbols-outlined text-4xl ${isElectionStarted ? "text-error" : "text-primary"}`}>
              {isElectionStarted ? "warning" : "how_to_vote"}
            </span>
            <div>
              <p className="text-headline-md text-on-surface">
                {isElectionStarted ? t("electionControl.confirmStopTitle") : t("electionControl.confirmStartTitle")}
              </p>
              <p className="text-body-md text-on-surface-variant mt-2">
                {isElectionStarted ? t("electionControl.confirmStopDesc") : t("electionControl.confirmStartDesc")}
              </p>
            </div>
            <div className="flex gap-3 w-full mt-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-outline-variant rounded-lg font-bold text-on-surface hover:bg-surface-variant/30 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
                  isElectionStarted
                    ? "bg-error text-on-error hover:bg-error/90"
                    : "bg-primary text-on-primary hover:bg-primary/90"
                }`}
              >
                {isElectionStarted ? t("electionControl.confirmProceedStop") : t("electionControl.confirmProceedStart")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
