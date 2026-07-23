"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { seedGrievances } from "@/lib/mockGrievanceData";
import { Grievance, GrievanceCategory, GrievanceStatus, NewGrievanceInput } from "@/types/grievance";

import { api } from "@/lib/api";

const KEY = "eg_grievances";

interface GrievanceContextType {
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

  useEffect(() => {
    setIsLoaded(true);
    if (user) {
      api.grievances.getAll()
        .then((res) => {
          if (res.grievances) {
            const validCategories = ["MISCONDUCT", "FRAUD", "TECHNICAL", "HARASSMENT", "OTHER"];
            const mapped: Grievance[] = res.grievances.map((g) => {
              const catUpper = g.category ? g.category.toUpperCase() : "OTHER";
              const category: GrievanceCategory = (validCategories.includes(catUpper) ? catUpper : "OTHER") as GrievanceCategory;
              return {
                id: g.id,
                voterId: g.voterId,
                voterName: g.voterName,
                constituencyId: user.constituencyId,
                constituencyName: user.constituencyName,
                category,
                description: g.description,
                status: (g.status.toUpperCase() === "OPEN" ? "PENDING" : g.status.toUpperCase()) as GrievanceStatus,
                createdAt: g.createdAt,
              };
            });

            setGrievances((prev) => {
              const existingIds = new Set(mapped.map((mg) => mg.id));
              const localOnly = prev.filter((pg) => !existingIds.has(pg.id));
              return [...mapped, ...localOnly];
            });
          }
        })
        .catch((err) => {
          console.warn("Backend grievance fetch failed, using local/cached data", err);
        });
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(KEY, JSON.stringify(grievances));
  }, [grievances, isLoaded]);

  const addGrievance = async (input: NewGrievanceInput) => {
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

    try {
      await api.grievances.create(input.category, input.description);
    } catch (err) {
      console.warn("Failed to create grievance on backend API", err);
    }
  };

  const updateStatus = async (id: string, status: GrievanceStatus, adminResponse?: string) => {
    if (!user || user.role !== "admin") return;
    setGrievances((prev) => prev.map((g) => (g.id === id ? { ...g, status, adminResponse: adminResponse ?? g.adminResponse } : g)));

    try {
      await api.grievances.updateStatus(id, status.toLowerCase());
    } catch (err) {
      console.warn("Failed to update grievance status on backend API", err);
    }
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
