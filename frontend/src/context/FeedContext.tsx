"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { seedPosts, seedComments } from "@/lib/mockFeedData";
import { FeedComment, FeedPost, NewCommentInput, NewPostInput } from "@/types/feed";

const POSTS_KEY = "eg_feed_posts";
const COMMENTS_KEY = "eg_feed_comments";

interface FeedContextType {
  // এই user-এর জন্য visible post গুলো, ইতিমধ্যে filter+sort করা।
  // *** এই ফাংশনটাই সেই জায়গা যেটা backend আসলে server-side query দিয়ে replace হবে। ***
  visiblePosts: FeedPost[];
  commentsFor: (postId: string) => FeedComment[];
  addNotice: (input: NewPostInput) => void;
  addCandidatePost: (input: NewPostInput) => void;
  addComment: (input: NewCommentInput) => void;
  toggleLike: (postId: string) => void;
  reportPost: (postId: string) => void;
  reportComment: (commentId: string) => void;
  removePost: (postId: string) => void; // admin moderation
  hideComment: (commentId: string) => void; // admin moderation
  isLoaded: boolean;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

// localStorage কে এখানে "database" হিসেবে ট্রিট করা হচ্ছে যাতে refresh-এ ডেটা টিকে থাকে।
// backend বসানোর সময় এই দুই loader ফাংশন + নিচের persist effect-কে fetch('/api/feed') দিয়ে replace করলেই চলবে।
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback; // SSR guard
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
  // lazy initializer -> effect-এর ভেতর setState করা লাগছে না, প্রথম render-এই ডেটা রেডি থাকে
  const [posts, setPosts] = useState<FeedPost[]>(() => loadFromStorage(POSTS_KEY, seedPosts));
  const [comments, setComments] = useState<FeedComment[]>(() => loadFromStorage(COMMENTS_KEY, seedComments));
  // hydration mismatch এড়াতে (server-এ localStorage নাই) -- mounted হওয়ার পরেই "loaded" ধরা হচ্ছে
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => setIsLoaded(true), []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }, [posts, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }, [comments, isLoaded]);

  // ==== VISIBILITY RULE (মূল লজিক) ====
  // TODO(backend): এই filtering client-এ রাখা শুধু demo-র জন্য নিরাপদ, কারণ mock data-তে
  // কোনো sensitive তথ্য নেই। Real backend-এ এই একই rule টা API route-এ
  // (WHERE constituencyId = session.constituencyId OR type = 'EC_NOTICE') বসবে
  // এবং client শুধু already-filtered response পাবে -- অন্য এলাকার পোস্ট
  // network response-এই কখনো আসবে না।
  const getVisiblePosts = useCallback((): FeedPost[] => {
    if (!user) return [];
    const filtered = posts.filter((p) => {
      if (p.status !== "PUBLISHED") return false;
      if (p.type === "EC_NOTICE") return true; // সবার জন্য visible
      // CANDIDATE_POST: admin (EC) সব দেখতে পারবে moderation-এর জন্য, বাকিরা শুধু নিজ এলাকারটা
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

  const addNotice = (input: NewPostInput) => {
    if (!user || user.role !== "admin") return; // role গার্ড -- backend-এ middleware দিয়েও একই চেক হবে
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
  };

  const addCandidatePost = (input: NewPostInput) => {
    if (!user || user.role !== "candidate") return;
    // constituencyId সবসময় logged-in user (session) থেকে নেয়া হচ্ছে, input থেকে না --
    // এইটাই মূল নিরাপত্তা নিয়ম, candidate নিজে অন্য এলাকার id বসাতে পারবে না।
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
