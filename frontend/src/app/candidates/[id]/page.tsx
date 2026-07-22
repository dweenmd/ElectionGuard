"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import FeedPostCard from "@/components/feed/FeedPostCard";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import { useFeed } from "@/context/FeedContext";
import { getCandidateById } from "@/lib/mockCandidates";

function CandidateProfileContent() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { visiblePosts } = useFeed();
  const candidate = getCandidateById(params.id);
  const backHref = user?.role === "admin" ? "/admin/candidates" : "/voter";

  // useFeed().visiblePosts আগে থেকেই viewer-এর constituency অনুযায়ী filtered --
  // তাই অন্য এলাকার candidate-এর profile-এ এলেও তার পোস্ট এখানে দেখা যাবে না,
  // access-control আলাদা করে এই পেজে আবার লিখতে হচ্ছে না।
  const candidatePosts = visiblePosts.filter((p) => p.type === "CANDIDATE_POST" && p.author.id === candidate?.id);

  if (!candidate) {
    return (
      <div className="flex h-screen overflow-hidden w-full">
        <Sidebar />
        <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
          <TopNav />
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">person_off</span>
            <p className="text-body-lg text-on-surface-variant">{t('candidateProfile.notFound')}</p>
            <Link href={backHref} className="text-primary font-bold hover:underline">{t('candidateProfile.back')}</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full flex flex-col gap-6">
          <Link href={backHref} className="text-on-surface-variant text-label-md font-bold hover:text-primary flex items-center gap-1 w-fit">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {t('candidateProfile.back')}
          </Link>

          {/* Profile header */}
          <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 flex flex-col sm:flex-row gap-6 items-start animate-rise">
            <div className="w-24 h-24 rounded-full bg-surface-container-high border-4 border-surface-variant flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant">{candidate.icon}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-headline-md text-on-surface font-bold">{t(`${candidate.translationKey}.name` as any)}</h1>
              <p className="text-body-lg text-on-surface-variant mt-1">{t(`${candidate.translationKey}.party` as any)}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-caption font-bold text-secondary bg-secondary/10 border border-secondary/30 px-2 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {candidate.constituencyName}
              </span>
              <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant/50 mt-4">
                <p className="text-body-md text-on-surface italic">&quot;{t(`${candidate.translationKey}.quote` as any)}&quot;</p>
              </div>
            </div>
          </div>

          {/* Manifesto */}
          <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 animate-rise">
            <h2 className="text-title-md font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              {t('candidateProfile.manifesto')}
            </h2>
            <p className="text-body-md text-on-surface-variant whitespace-pre-line">{candidate.manifestoFull}</p>
          </div>

          {/* Recent posts (constituency-filtered automatically via useFeed) */}
          <div className="flex flex-col gap-4">
            <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">newspaper</span>
              {t('candidateProfile.recentPosts')}
            </h2>
            {candidatePosts.length === 0 && (
              <p className="text-body-md text-on-surface-variant text-center py-8 bg-surface rounded-xl border border-outline-variant">
                {t('candidateProfile.noPosts')}
              </p>
            )}
            {candidatePosts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CandidateProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["voter", "candidate", "admin"]}>
      <CandidateProfileContent />
    </ProtectedRoute>
  );
}
