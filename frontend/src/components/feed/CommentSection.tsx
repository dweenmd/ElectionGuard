"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFeed } from "@/context/FeedContext";
import { useAuditLog } from "@/context/AuditLogContext";
import { useTranslation } from "@/context/UIContext";

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const { commentsFor, addComment, reportComment, hideComment } = useFeed();
  const { logAction } = useAuditLog();
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const comments = commentsFor(postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    addComment({ postId, body });
    setText("");
  };

  return (
    <div className="border-t border-outline-variant/60 pt-4 flex flex-col gap-4">
      {comments.length === 0 && (
        <p className="text-caption text-on-surface-variant">{t("feed.noComments")}</p>
      )}

      <div className="flex flex-col gap-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 animate-rise">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
            </div>
            <div className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-label-md font-bold text-on-surface">{c.author.name}</span>
                <div className="flex items-center gap-2">
                  {user?.role === "admin" && (
                    <button
                      onClick={() => { hideComment(c.id); logAction("Comment Hidden", `by ${c.author.name}`); }}
                      className="text-caption text-error hover:underline"
                    >
                      {t("feed.hide")}
                    </button>
                  )}
                  <button
                    onClick={() => reportComment(c.id)}
                    className="text-caption text-on-surface-variant hover:text-primary hover:underline"
                  >
                    {t("feed.report")}
                  </button>
                </div>
              </div>
              <p className="text-body-md text-on-surface">{c.body}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("feed.writeComment")}
          className="flex-1 bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-label-md hover:bg-primary/90 transition-colors disabled:opacity-40"
          disabled={!text.trim()}
        >
          {t("feed.send")}
        </button>
      </form>
    </div>
  );
}
