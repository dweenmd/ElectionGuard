"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFeed } from "@/context/FeedContext";
import { useTranslation } from "@/context/UIContext";
import { FeedPost } from "@/types/feed";
import CommentSection from "./CommentSection";

function timeAgo(iso: string, lang: "bn" | "en") {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (lang === "bn") {
    if (mins < 60) return `${mins} মিনিট আগে`;
    if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
    return `${days} দিন আগে`;
  }
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

export default function FeedPostCard({ post }: { post: FeedPost }) {
  const { user } = useAuth();
  const { toggleLike, reportPost, removePost, commentsFor } = useFeed();
  const { t, language } = useTranslation();
  const [showComments, setShowComments] = useState(false);
  const [reported, setReported] = useState(false);

  const isNotice = post.type === "EC_NOTICE";
  const liked = user ? post.likedBy.includes(user.id) : false;
  const commentCount = commentsFor(post.id).length;

  const handleReport = () => {
    if (reported) return;
    reportPost(post.id);
    setReported(true);
  };

  return (
    <article
      className={`bg-surface rounded-xl shadow-card border p-5 md:p-6 flex flex-col gap-4 ${
        isNotice ? "border-primary/40" : "border-outline-variant"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              isNotice ? "bg-primary text-on-primary" : "bg-secondary-container text-on-secondary-container"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{isNotice ? "campaign" : "person"}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-body-lg font-bold text-on-surface">{post.author.name}</h3>
              {isNotice && (
                <span className="text-caption font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
                  {t("feed.ecBadge")}
                </span>
              )}
              {!isNotice && (
                <span className="text-caption font-bold text-secondary bg-secondary/10 border border-secondary/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  {post.constituencyName}
                </span>
              )}
            </div>
            <p className="text-caption text-on-surface-variant">
              {post.author.party ? `${post.author.party} · ` : ""}
              {timeAgo(post.createdAt, language)}
            </p>
          </div>
        </div>
        {post.pinned && (
          <span className="material-symbols-outlined text-primary text-[20px]" title={t("feed.pinned")}>
            keep
          </span>
        )}
      </div>

      {/* Body */}
      <div>
        <h4 className="text-body-lg font-bold text-on-surface mb-1">{post.title}</h4>
        <p className="text-body-md text-on-surface-variant whitespace-pre-line">{post.body}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-outline-variant/60 pt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md font-bold transition-colors ${
              liked ? "text-primary bg-primary/10" : "text-on-surface-variant hover:bg-surface-variant/50"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              thumb_up
            </span>
            {post.likedBy.length > 0 ? post.likedBy.length : t("feed.like")}
          </button>
          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md font-bold text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
            {commentCount > 0 ? commentCount : t("feed.comment")}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === "admin" && (
            <button
              onClick={() => removePost(post.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-label-sm font-bold text-error hover:bg-error/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              {t("feed.remove")}
            </button>
          )}
          <button
            onClick={handleReport}
            disabled={reported}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-label-sm font-bold text-on-surface-variant hover:bg-surface-variant/50 disabled:opacity-40 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">flag</span>
            {reported ? t("feed.reported") : t("feed.report")}
          </button>
        </div>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </article>
  );
}
