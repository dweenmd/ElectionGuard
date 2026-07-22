"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockCandidates } from "@/lib/mockCandidates";
import { Candidate, DocStatusKey, NominationStatusKey } from "@/types/candidate";

const KEY = "eg_candidate_status_overrides";

interface StatusOverride {
  docStatusKey: DocStatusKey;
  nominationStatusKey: NominationStatusKey;
}

interface CandidateContextType {
  candidates: Candidate[]; // mockCandidates + persisted status overrides merged in
  updateCandidateStatus: (id: string, docStatusKey: DocStatusKey, nominationStatusKey: NominationStatusKey) => void;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

function loadOverrides(): Record<string, StatusOverride> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error("Failed to load candidate status overrides", e);
    return {};
  }
}

export function CandidateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [overrides, setOverrides] = useState<Record<string, StatusOverride>>(() => loadOverrides());
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => setIsLoaded(true), []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(KEY, JSON.stringify(overrides));
  }, [overrides, isLoaded]);

  const updateCandidateStatus = (id: string, docStatusKey: DocStatusKey, nominationStatusKey: NominationStatusKey) => {
    if (!user || user.role !== "admin") return; // শুধু EC/admin candidate status বদলাতে পারবে
    setOverrides((prev) => ({ ...prev, [id]: { docStatusKey, nominationStatusKey } }));
  };

  const candidates = mockCandidates.map((c) => (overrides[c.id] ? { ...c, ...overrides[c.id] } : c));

  return (
    <CandidateContext.Provider value={{ candidates, updateCandidateStatus }}>
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidates() {
  const context = useContext(CandidateContext);
  if (context === undefined) throw new Error("useCandidates must be used within a CandidateProvider");
  return context;
}
