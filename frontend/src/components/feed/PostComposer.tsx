"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFeed } from "@/context/FeedContext";
import { useTranslation } from "@/context/UIContext";
import toast from "react-hot-toast";

export default function PostComposer() {
  const { user } = useAuth();
  const { addNotice, addCandidatePost } = useFeed();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  if (!user || (user.role !== "admin" && user.role !== "candidate")) return null;

  const isAdmin = user.role === "admin";

  const reset = () => {
    setTitle("");
    setBody("");
    setPinned(false);
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    if (isAdmin) {
      addNotice({ title: title.trim(), body: body.trim(), pinned });
      toast.success(t("feed.noticePublished"));
    } else {
      addCandidatePost({ title: title.trim(), body: body.trim() });
      toast.success(t("feed.postPublished"));
    }
    reset();
  };

  return (
    <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-5">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-primary transition-colors"
        >
          <span className="material-symbols-outlined text-primary">add_box</span>
          {isAdmin ? t("feed.composerPromptAdmin") : t("feed.composerPromptCandidate")}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-body-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">{isAdmin ? "campaign" : "edit_note"}</span>
              {isAdmin ? t("feed.newNotice") : t("feed.newPost")}
            </h3>
            {!isAdmin && (
              <span className="text-caption text-on-surface-variant bg-surface-variant px-2 py-1 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {user.constituencyName}
              </span>
            )}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("feed.titlePlaceholder")}
            className="bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("feed.bodyPlaceholder")}
            rows={3}
            className="bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {isAdmin && (
            <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-primary" />
              {t("feed.pinNotice")}
            </label>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={reset} className="px-4 py-2 rounded-lg text-label-md font-bold text-on-surface-variant hover:bg-surface-variant/50">
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !body.trim()}
              className="px-5 py-2 bg-primary text-on-primary rounded-lg font-bold text-label-md hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              {isAdmin ? t("feed.publishNotice") : t("feed.publishPost")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
