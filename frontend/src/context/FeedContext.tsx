"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { seedPosts, seedComments } from "@/lib/mockFeedData";
import { FeedComment, FeedPost, NewCommentInput, NewPostInput } from "@/types/feed";

import { api } from "@/lib/api";

const POSTS_KEY = "eg_feed_posts";
const COMMENTS_KEY = "eg_feed_comments";

interface FeedContextType {
  visiblePosts: FeedPost[];
  commentsFor: (postId: string) => FeedComment[];
  addNotice: (input: NewPostInput) => void;
  addCandidatePost: (input: NewPostInput) => void;
  addComment: (input: NewCommentInput) => void;
  toggleLike: (postId: string) => void;
  reportPost: (postId: string) => void;
  reportComment: (commentId: string) => void;
  removePost: (postId: string) => void;
  hideComment: (commentId: string) => void;
  isLoaded: boolean;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return fallback;
  }
}

export function FeedProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>(() => loadFromStorage(POSTS_KEY, seedPosts));
  const [comments, setComments] = useState<FeedComment[]>(() => loadFromStorage(COMMENTS_KEY, seedComments));
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch backend posts on mount / user change
  useEffect(() => {
    setIsLoaded(true);
    api.feed.getPosts(user?.constituencyId)
      .then((res) => {
        if (res.posts && res.posts.length > 0) {
          const backendPosts: FeedPost[] = res.posts.map((p) => ({
            id: p.id,
            type: (p.type === "ec_notice" ? "EC_NOTICE" : "CANDIDATE_POST") as any,
            author: { id: p.author, name: p.author, role: p.type === "ec_notice" ? "admin" : "candidate" },
            title: p.content.slice(0, 50),
            body: p.content,
            constituencyId: p.constituencyId,
            pinned: p.type === "ec_notice",
            status: "PUBLISHED",
            createdAt: p.createdAt,
            likedBy: [],
            reportCount: 0,
          }));

          setPosts((prev) => {
            const existingIds = new Set(backendPosts.map((bp) => bp.id));
            const localOnly = prev.filter((lp) => !existingIds.has(lp.id));
            return [...backendPosts, ...localOnly];
          });
        }
      })
      .catch((err) => {
        console.warn("Backend feed fetch failed, using local/cached feed data", err);
      });
  }, [user]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }, [posts, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }, [comments, isLoaded]);

  const getVisiblePosts = useCallback((): FeedPost[] => {
    if (!user) return [];
    const filtered = posts.filter((p) => {
      if (p.status !== "PUBLISHED") return false;
      if (p.type === "EC_NOTICE") return true;
      if (user.role === "admin") return true;
      return p.constituencyId === user.constituencyId;
    });

    return filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, user]);

  const commentsFor = useCallback(
    (postId: string) =>
      comments
        .filter((c) => c.postId === postId && c.status === "VISIBLE")
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [comments]
  );

  const addNotice = async (input: NewPostInput) => {
    if (!user || user.role !== "admin") return;
    const newPost: FeedPost = {
      id: `notice-${Date.now()}`,
      type: "EC_NOTICE",
      author: { id: user.id, name: "Election Commission", role: "admin" },
      title: input.title,
      body: input.body,
      pinned: !!input.pinned,
      status: "PUBLISHED",
      createdAt: new Date().toISOString(),
      likedBy: [],
      reportCount: 0,
    };
    setPosts((prev) => [newPost, ...prev]);

    try {
      await api.feed.createPost(`${input.title}\n\n${input.body}`, "ec_notice");
    } catch (err) {
      console.warn("Failed to publish notice to backend API", err);
    }
  };

  const addCandidatePost = async (input: NewPostInput) => {
    if (!user || user.role !== "candidate") return;
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      type: "CANDIDATE_POST",
      author: { id: user.id, name: user.name, role: "candidate", constituencyName: user.constituencyName },
      constituencyId: user.constituencyId,
      constituencyName: user.constituencyName,
      title: input.title,
      body: input.body,
      pinned: false,
      status: "PUBLISHED",
      createdAt: new Date().toISOString(),
      likedBy: [],
      reportCount: 0,
    };
    setPosts((prev) => [newPost, ...prev]);

    try {
      await api.feed.createPost(`${input.title}\n\n${input.body}`, "campaign");
    } catch (err) {
      console.warn("Failed to publish candidate post to backend API", err);
    }
  };

  const addComment = (input: NewCommentInput) => {
    if (!user) return;
    const newComment: FeedComment = {
      id: `comment-${Date.now()}`,
      postId: input.postId,
      author: { id: user.id, name: user.name, role: user.role as "admin" | "candidate" | "voter" },
      body: input.body,
      createdAt: new Date().toISOString(),
      status: "VISIBLE",
      reportCount: 0,
    };
    setComments((prev) => [...prev, newComment]);
  };

  const toggleLike = (postId: string) => {
    if (!user) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likedBy.includes(user.id);
        return { ...p, likedBy: liked ? p.likedBy.filter((id) => id !== user.id) : [...p.likedBy, user.id] };
      })
    );
  };

  const reportPost = (postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, reportCount: p.reportCount + 1 } : p)));
  };

  const reportComment = (commentId: string) => {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, reportCount: c.reportCount + 1 } : c)));
  };

  const removePost = (postId: string) => {
    if (!user || user.role !== "admin") return; // moderation শুধু EC/admin-এর হাতে
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "REMOVED" } : p)));
  };

  const hideComment = (commentId: string) => {
    if (!user || user.role !== "admin") return;
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, status: "HIDDEN" } : c)));
  };

  return (
    <FeedContext.Provider
      value={{
        visiblePosts: getVisiblePosts(),
        commentsFor,
        addNotice,
        addCandidatePost,
        addComment,
        toggleLike,
        reportPost,
        reportComment,
        removePost,
        hideComment,
        isLoaded,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error("useFeed must be used within a FeedProvider");
  }
  return context;
}
