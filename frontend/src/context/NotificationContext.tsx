"use client";
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFeed } from "@/context/FeedContext";
import { useGrievance } from "@/context/GrievanceContext";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const SEEN_KEY = "eg_notifications_last_seen";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { visiblePosts } = useFeed();
  const { myGrievances, allGrievances } = useGrievance();
  const [lastSeen, setLastSeen] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(SEEN_KEY);
    setLastSeen(saved ? parseInt(saved, 10) : 0);
  }, []);

  const raw: NotificationItem[] = useMemo(() => {
    if (!user) return [];
    const items: NotificationItem[] = [];

    for (const p of visiblePosts) {
      items.push({
        id: `post-${p.id}`,
        title: p.type === "EC_NOTICE" ? "নতুন নোটিশ" : "নতুন পোস্ট",
        body: p.title,
        href: p.type === "EC_NOTICE" ? "/feed" : `/feed`,
        createdAt: p.createdAt,
        read: new Date(p.createdAt).getTime() <= lastSeen,
      });
    }

    if (user.role === "voter") {
      for (const g of myGrievances) {
        if (g.adminResponse) {
          items.push({
            id: `grievance-${g.id}`,
            title: "আপনার অভিযোগের জবাব এসেছে",
            body: g.adminResponse,
            href: "/grievance",
            createdAt: g.createdAt,
            read: new Date(g.createdAt).getTime() <= lastSeen,
          });
        }
      }
    }

    if (user.role === "admin") {
      for (const g of allGrievances.filter((x) => x.status === "PENDING")) {
        items.push({
          id: `grievance-admin-${g.id}`,
          title: "নতুন অভিযোগ জমা পড়েছে",
          body: g.description,
          href: "/admin/grievances",
          createdAt: g.createdAt,
          read: new Date(g.createdAt).getTime() <= lastSeen,
        });
      }
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);
  }, [user, visiblePosts, myGrievances, allGrievances, lastSeen]);

  const markAllRead = () => {
    const now = Date.now();
    setLastSeen(now);
    if (typeof window !== "undefined") localStorage.setItem(SEEN_KEY, String(now));
  };

  const unreadCount = raw.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications: raw, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
}
