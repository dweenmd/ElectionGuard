"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

import { api } from "@/lib/api";

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  details: string;
  createdAt: string;
}

interface AuditLogContextType {
  entries: AuditLogEntry[];
  logAction: (action: string, details: string) => void;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);
const KEY = "eg_audit_log";

function loadEntries(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load audit log", e);
    return [];
  }
}

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AuditLogEntry[]>(() => loadEntries());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (user) {
      api.audit.getLogs()
        .then((res) => {
          if (res.entries) {
            setEntries((prev) => {
              const existingIds = new Set(res.entries.map((e) => e.id));
              const localOnly = prev.filter((p) => !existingIds.has(p.id));
              return [...res.entries, ...localOnly].slice(0, 200);
            });
          }
        })
        .catch((err) => {
          console.warn("Backend audit logs fetch failed, using local logs", err);
        });
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(KEY, JSON.stringify(entries));
  }, [entries, isLoaded]);

  const logAction = async (action: string, details: string) => {
    if (!user) return;
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actor: user.name,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev].slice(0, 200));

    try {
      await api.audit.createLog(action, details);
    } catch (err) {
      console.warn("Failed to create audit log on backend API", err);
    }
  };

  return (
    <AuditLogContext.Provider value={{ entries, logAction }}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (context === undefined) throw new Error("useAuditLog must be used within an AuditLogProvider");
  return context;
}
