"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostComposer from "@/components/feed/PostComposer";
import FeedPostCard from "@/components/feed/FeedPostCard";
import { useAuth } from "@/context/AuthContext";
import { useFeed } from "@/context/FeedContext";
import { useTranslation } from "@/context/UIContext";
import { SkeletonCard } from "@/components/ui/Skeleton";

function FeedContent() {
  const { user } = useAuth();
  const { visiblePosts, isLoaded } = useFeed();
  const { t } = useTranslation();

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t("feed.title")}</h1>
              <p className="text-body-lg text-on-surface-variant">{t("feed.subtitle")}</p>
            </div>
            {user?.role !== "admin" && (
              <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant flex items-center gap-2 shrink-0">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <span className="text-label-md font-bold text-on-surface">{user?.constituencyName}</span>
              </div>
            )}
          </div>

          <PostComposer />

          {!isLoaded && (
            <div className="flex flex-col gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {isLoaded && visiblePosts.length === 0 && (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-2 block">inbox</span>
              {t("feed.empty")}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {visiblePosts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute allowedRoles={["voter", "candidate", "admin"]}>
      <FeedContent />
    </ProtectedRoute>
  );
}
