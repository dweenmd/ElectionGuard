"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { seedGrievances } from "@/lib/mockGrievanceData";
import { Grievance, GrievanceStatus, NewGrievanceInput } from "@/types/grievance";

const KEY = "eg_grievances";

interface GrievanceContextType {
  // voter হলে শুধু নিজের অভিযোগ, admin হলে সবগুলো -- এই ভাগাভাগিও backend-এ session অনুযায়ী হবে।
  myGrievances: Grievance[];
  allGrievances: Grievance[];
  addGrievance: (input: NewGrievanceInput) => void;
  updateStatus: (id: string, status: GrievanceStatus, adminResponse?: string) => void;
  isLoaded: boolean;
}

const GrievanceContext = createContext<GrievanceContextType | undefined>(undefined);

function loadFromStorage(): Grievance[] {
  if (typeof window === "undefined") return seedGrievances;
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? (JSON.parse(saved) as Grievance[]) : seedGrievances;
  } catch (e) {
    console.error("Failed to load grievances from localStorage", e);
    return seedGrievances;
  }
}

export function GrievanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>(() => loadFromStorage());
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => setIsLoaded(true), []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(KEY, JSON.stringify(grievances));
  }, [grievances, isLoaded]);

  const addGrievance = (input: NewGrievanceInput) => {
    if (!user || user.role !== "voter") return;
    const newGrievance: Grievance = {
      id: `g-${Date.now()}`,
      voterId: user.id,
      voterName: user.name,
      constituencyId: user.constituencyId,
      constituencyName: user.constituencyName,
      category: input.category,
      description: input.description,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    setGrievances((prev) => [newGrievance, ...prev]);
  };

  const updateStatus = (id: string, status: GrievanceStatus, adminResponse?: string) => {
    if (!user || user.role !== "admin") return; // moderation শুধু EC/admin-এর হাতে
    setGrievances((prev) => prev.map((g) => (g.id === id ? { ...g, status, adminResponse: adminResponse ?? g.adminResponse } : g)));
  };

  const myGrievances = user ? grievances.filter((g) => g.voterId === user.id) : [];

  return (
    <GrievanceContext.Provider value={{ myGrievances, allGrievances: grievances, addGrievance, updateStatus, isLoaded }}>
      {children}
    </GrievanceContext.Provider>
  );
}

export function useGrievance() {
  const context = useContext(GrievanceContext);
  if (context === undefined) {
    throw new Error("useGrievance must be used within a GrievanceProvider");
  }
  return context;
}
