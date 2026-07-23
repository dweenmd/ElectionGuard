"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import { ELECTION_END_DATE } from "@/lib/electionConfig";
import { getVoteRecord, recordVote, VoteRecord } from "@/lib/voteRecord";

type CandidateId = "c1" | "c2" | "c3";

// TODO(backend): candidate list এবং icon/party mapping পরে /api/candidates থেকে আসবে।
const CANDIDATES: { id: CandidateId; icon: string; partyIcon: string }[] = [
  { id: "c1", icon: "person", partyIcon: "star" },
  { id: "c2", icon: "person_4", partyIcon: "eco" },
  { id: "c3", icon: "person_3", partyIcon: "handshake" },
];

function getRemainingParts(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { hours, minutes, seconds, expired: false };
}

function formatClock({ hours, minutes, seconds }: { hours: number; minutes: number; seconds: number }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function VotePage() {
  const { isElectionStarted, user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateId | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteRecord, setVoteRecord] = useState<VoteRecord | null>(null);
  const [checkedExistingVote, setCheckedExistingVote] = useState(false);
  const [remaining, setRemaining] = useState(() => getRemainingParts(ELECTION_END_DATE));
  const [isSubmitAreaVisible, setIsSubmitAreaVisible] = useState(true);
  const submitAreaRef = useRef<HTMLDivElement>(null);

  // Refresh করলেও যাতে দ্বিতীয়বার ভোট দেওয়া না যায়, তাই এই user আগে ভোট দিয়েছে কিনা তা লোড করা হচ্ছে
  useEffect(() => {
    if (!user) return;
    setVoteRecord(getVoteRecord(user.id));
    setCheckedExistingVote(true);
  }, [user]);

  // ব্যালট লম্বা হলে scroll করার সময় submit area কখন view-তে আছে তা track করা হচ্ছে,
  // যাতে না থাকলে sticky "Currently selected" bar দেখানো যায়
  useEffect(() => {
    const el = submitAreaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setIsSubmitAreaVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [voteRecord, checkedExistingVote]);

  // Live countdown — প্রতি সেকেন্ডে আপডেট হবে
  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemainingParts(ELECTION_END_DATE)), 1000);
    return () => clearInterval(interval);
  }, []);

  const candidateNames: Record<CandidateId, string> = useMemo(
    () => ({
      c1: t("candidatesData.c1.name"),
      c2: t("candidatesData.c2.name"),
      c3: t("candidatesData.c3.name"),
    }),
    [t]
  );

  const candidateParties: Record<CandidateId, string> = useMemo(
    () => ({
      c1: t("candidatesData.c1.party"),
      c2: t("candidatesData.c2.party"),
      c3: t("candidatesData.c3.party"),
    }),
    [t]
  );

  const candidateQuotes: Record<CandidateId, string> = useMemo(
    () => ({
      c1: t("candidatesData.c1.quote"),
      c2: t("candidatesData.c2.quote"),
      c3: t("candidatesData.c3.quote"),
    }),
    [t]
  );

  const handleCancel = () => {
    setSelectedCandidate(null);
    router.push("/voter");
  };

  const handleConfirmVote = () => {
    if (!selectedCandidate || !user) return;
    setIsSubmitting(true);
    // TODO(backend): এখানে আসল POST /api/vote কল হবে (encrypted ballot পাঠানো হবে)
    setTimeout(() => {
      const record = recordVote(user.id, selectedCandidate);
      setVoteRecord(record);
      setIsSubmitting(false);
      setShowConfirmModal(false);
      toast.success(t("vote.voteSuccessToast"));
    }, 900);
  };

  const canSubmit = !!selectedCandidate && !remaining.expired;

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />

        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          {!isElectionStarted ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <span className="material-symbols-outlined text-[80px] text-error mb-6">lock</span>
              <h2 className="text-headline-lg text-on-background mb-4">{t("vote.notStarted")}</h2>
              <p className="text-body-lg text-on-surface-variant max-w-lg mb-8">{t("vote.lockedDesc")}</p>
              <Link
                href="/voter"
                className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                {t("vote.returnDashboard")}
              </Link>
            </div>
          ) : !checkedExistingVote ? (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
          ) : voteRecord ? (
            // ইতিমধ্যে ভোট দেওয়া হয়ে গেছে — ব্যালট আর দেখানো হবে না, পুনরায় ভোট দেওয়া যাবে না
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <span className="material-symbols-outlined text-[80px] text-success mb-6">check_circle</span>
              <h2 className="text-headline-lg text-on-background mb-3">{t("vote.alreadyVotedTitle")}</h2>
              <p className="text-body-lg text-on-surface-variant max-w-lg mb-2">{t("vote.alreadyVotedDesc")}</p>

              <div className="bg-surface-container-lowest rounded-xl shadow-card border-2 border-primary p-6 my-6 flex items-center gap-4 max-w-md w-full">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-4 border-primary bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                    {CANDIDATES.find((c) => c.id === voteRecord.candidateId)?.icon ?? "person"}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-headline-md text-on-surface">
                    {candidateNames[voteRecord.candidateId as CandidateId]}
                  </h3>
                  <p className="text-label-md text-on-surface-variant">
                    {candidateParties[voteRecord.candidateId as CandidateId]}
                  </p>
                </div>
              </div>

              <p className="text-caption text-on-surface-variant mb-8">
                {t("vote.votedAtLabel")}: {new Date(voteRecord.votedAt).toLocaleString()}
              </p>

              <p className="text-body-md text-on-surface-variant max-w-lg mb-8">{t("vote.alreadyVotedNote")}</p>

              <Link
                href="/voter"
                className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                {t("vote.returnDashboard")}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-8 md:gap-12">
              {/* Page Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                  <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t("vote.title")}</h1>
                  <p className="text-body-lg text-on-surface-variant">{t("vote.subtitle")}</p>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg border ${
                    remaining.expired
                      ? "bg-surface-variant text-on-surface-variant border-outline-variant"
                      : "bg-error-container text-on-error-container border-error/20"
                  }`}
                >
                  <p className="text-label-md font-bold flex items-center gap-2 tabular-nums">
                    <span className="material-symbols-outlined text-[18px]">timer</span>
                    {remaining.expired
                      ? t("vote.votingClosedShort")
                      : `${t("vote.timeRemaining")}: ${formatClock(remaining)}`}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-secondary-container/50 border border-secondary/20 p-4 md:p-6 rounded-xl flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary text-3xl shrink-0">info</span>
                <div>
                  <h3 className="text-label-md font-bold text-on-surface mb-1">{t("vote.instructions")}</h3>
                  <p className="text-body-md text-on-surface-variant">{t("vote.instructionsDesc")}</p>
                </div>
              </div>

              {/* Candidates */}
              <form className="flex flex-col gap-6" id="ballotForm">
                {CANDIDATES.map((candidate) => (
                  <label
                    key={candidate.id}
                    className="block relative bg-surface-container-lowest rounded-xl shadow-card border-2 border-transparent transition-all cursor-pointer hover:border-outline-variant has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/20 group"
                  >
                    <input
                      className="sr-only peer"
                      name="candidate"
                      type="radio"
                      value={candidate.id}
                      checked={selectedCandidate === candidate.id}
                      onChange={() => setSelectedCandidate(candidate.id)}
                    />
                    <div className="flex flex-col sm:flex-row p-6 gap-6 items-center sm:items-start">
                      <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-surface-variant peer-checked:border-primary transition-colors bg-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                          {candidate.icon}
                        </span>
                      </div>
                      <div className="flex-grow text-center sm:text-left space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <h2 className="text-headline-md text-on-surface">{candidateNames[candidate.id]}</h2>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-on-surface-variant">
                              <span className="material-symbols-outlined text-xl">{candidate.partyIcon}</span>
                              <span className="text-label-md">{candidateParties[candidate.id]}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-surface-container-low p-3 rounded-lg mt-3">
                          <p className="text-caption text-on-surface-variant line-clamp-2">
                            &ldquo;{candidateQuotes[candidate.id]}&rdquo;
                          </p>
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-full border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center shrink-0 transition-colors">
                        <span className="material-symbols-outlined text-transparent peer-checked:text-on-primary transition-colors text-3xl">
                          check
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </form>

              {/* Sticky selection bar — লম্বা ব্যালটে scroll করার সময় submit area view-তে না থাকলে দেখাবে */}
              {selectedCandidate && !isSubmitAreaVisible && (
                <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40 flex justify-center px-4 pb-4 pointer-events-none">
                  <div className="pointer-events-auto bg-surface/95 backdrop-blur-md rounded-xl shadow-card border border-outline-variant px-4 py-3 flex items-center gap-4 max-w-xl w-full animate-fade-in">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-primary bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl text-on-surface-variant">
                        {CANDIDATES.find((c) => c.id === selectedCandidate)?.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-caption text-on-surface-variant leading-none mb-1">
                        {t("vote.currentlySelected")}
                      </p>
                      <p className="text-label-md font-bold text-on-surface truncate">
                        {candidateNames[selectedCandidate]}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => submitAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
                      className="shrink-0 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-label-md hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                      {t("vote.reviewSubmit")}
                      <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Area */}
              <div
                ref={submitAreaRef}
                className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-6 mt-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 text-on-surface-variant text-caption">
                    <span className="material-symbols-outlined text-primary">security</span>
                    {t("vote.encrypted")}
                  </div>
                  {!selectedCandidate && !remaining.expired && (
                    <div className="flex items-center gap-2 text-on-surface-variant text-caption">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      {t("vote.selectCandidateHint")}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none px-6 py-3 border-2 border-outline text-on-surface hover:bg-surface-variant rounded-lg font-bold transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={() => setShowConfirmModal(true)}
                    className="flex-1 sm:flex-none px-8 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                  >
                    {t("vote.submitVote")}
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal — vote irreversible, তাই submit করার আগে শেষবারের মতো নিশ্চিত করা হচ্ছে */}
      {showConfirmModal && selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setShowConfirmModal(false)}
        >
          <div
            className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 max-w-md w-full flex flex-col items-center text-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined text-4xl text-primary">how_to_vote</span>
            <div>
              <p className="text-headline-md text-on-surface">{t("vote.confirmTitle")}</p>
              <p className="text-body-md text-on-surface-variant mt-2">
                {t("vote.confirmDesc").replace("{name}", candidateNames[selectedCandidate])}
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex items-center gap-3 w-full">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                  {CANDIDATES.find((c) => c.id === selectedCandidate)?.icon}
                </span>
              </div>
              <div className="text-left">
                <p className="text-label-md font-bold text-on-surface">{candidateNames[selectedCandidate]}</p>
                <p className="text-caption text-on-surface-variant">{candidateParties[selectedCandidate]}</p>
              </div>
            </div>

            <div className="bg-error-container/40 border border-error/30 rounded-lg p-3 flex items-start gap-2 text-left">
              <span className="material-symbols-outlined text-error text-xl shrink-0">warning</span>
              <p className="text-caption text-on-error-container">{t("vote.confirmWarning")}</p>
            </div>

            <div className="flex gap-3 w-full mt-1">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-outline-variant rounded-lg font-bold text-on-surface hover:bg-surface-variant/30 transition-colors disabled:opacity-50"
              >
                {t("vote.confirmBack")}
              </button>
              <button
                onClick={handleConfirmVote}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                {isSubmitting ? t("vote.submitting") : t("vote.confirmButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
