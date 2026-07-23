"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockCandidates } from "@/lib/mockCandidates";
import { Candidate, DocStatusKey, NominationStatusKey } from "@/types/candidate";

import { api } from "@/lib/api";

const KEY = "eg_candidate_status_overrides";

interface StatusOverride {
  docStatusKey: DocStatusKey;
  nominationStatusKey: NominationStatusKey;
}

interface CandidateContextType {
  candidates: Candidate[]; // mockCandidates + persisted status overrides merged in
  updateCandidateStatus: (id: string, docStatusKey: DocStatusKey, nominationStatusKey: NominationStatusKey) => void;
  refreshCandidates: () => Promise<void>;
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
  const [candidateList, setCandidateList] = useState<Candidate[]>(mockCandidates);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCandidatesFromBackend = async () => {
    try {
      const data = await api.candidates.getAll();
      if (data.candidates && data.candidates.length > 0) {
        const mapped: Candidate[] = data.candidates.map((c, index) => {
          const fallback = mockCandidates[index] || mockCandidates[0];
          return {
            ...fallback,
            id: `c${c.id}`,
            voteCount: c.voteCount ?? fallback.voteCount,
          };
        });
        setCandidateList(mapped);
      }
    } catch (e) {
      console.warn("Could not fetch candidates from backend, using mock list", e);
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    fetchCandidatesFromBackend();
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(KEY, JSON.stringify(overrides));
  }, [overrides, isLoaded]);

  const updateCandidateStatus = (id: string, docStatusKey: DocStatusKey, nominationStatusKey: NominationStatusKey) => {
    if (!user || user.role !== "admin") return;
    setOverrides((prev) => ({ ...prev, [id]: { docStatusKey, nominationStatusKey } }));
  };

  const candidates = candidateList.map((c) => (overrides[c.id] ? { ...c, ...overrides[c.id] } : c));

  return (
    <CandidateContext.Provider value={{ candidates, updateCandidateStatus, refreshCandidates: fetchCandidatesFromBackend }}>
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidates() {
  const context = useContext(CandidateContext);
  if (context === undefined) throw new Error("useCandidates must be used within a CandidateProvider");
  return context;
}
