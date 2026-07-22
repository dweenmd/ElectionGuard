"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

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
  useEffect(() => setIsLoaded(true), []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(KEY, JSON.stringify(entries));
  }, [entries, isLoaded]);

  const logAction = (action: string, details: string) => {
    if (!user) return;
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actor: user.name,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev].slice(0, 200)); // ২০০ এন্ট্রি পর্যন্ত রাখা হচ্ছে
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
