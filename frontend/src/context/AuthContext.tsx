"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { recordLogin } from "@/lib/loginHistory";
import { getElectionStatus, setElectionStatus, ELECTION_STATUS_EVENT } from "@/lib/electionStatus";
import { api } from "@/lib/api";

type Role = "voter" | "candidate" | "admin" | null;

interface User {
  id: string;
  name: string;
  role: Role;
  // TODO(backend): এইটা backend-এ voter roll / candidate nomination থেকে verify হয়ে
  // session-এ বসবে। Client কখনো নিজে constituencyId পাঠাবে না।
  constituencyId: string;
  constituencyName: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  isLoggedIn: boolean;
  login: (role: Exclude<Role, null>, nid?: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isElectionStarted: boolean;
  toggleElection: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectionStarted, setIsElectionStarted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth on load
    const savedUser = Cookies.get("eg_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user cookie");
      }
    }
    
    // Verify token with backend if available
    const token = Cookies.get("eg_token");
    if (token) {
      api.auth.verify()
        .then((res) => {
          if (res.user) {
            const verifiedUser: User = {
              id: res.user.userId,
              name: res.user.name,
              role: res.user.role,
              constituencyId: res.user.constituencyId,
              constituencyName: res.user.constituencyName,
            };
            setUser(verifiedUser);
            Cookies.set("eg_user", JSON.stringify(verifiedUser), { expires: 1 });
          }
        })
        .catch((err) => {
          console.warn("Backend auth verification failed or server offline, using cached session", err);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch live election status from backend
  useEffect(() => {
    const fetchBackendStatus = () => {
      api.election.getStatus()
        .then((res) => {
          const active = res.status === "Voting" || res.status === "Ongoing";
          setIsElectionStarted(active);
          setElectionStatus(active);
        })
        .catch(() => {
          setIsElectionStarted(getElectionStatus());
        });
    };

    fetchBackendStatus();
    const syncStatus = () => setIsElectionStarted(getElectionStatus());
    window.addEventListener("storage", syncStatus);
    window.addEventListener(ELECTION_STATUS_EVENT, syncStatus);
    return () => {
      window.removeEventListener("storage", syncStatus);
      window.removeEventListener(ELECTION_STATUS_EVENT, syncStatus);
    };
  }, []);

  const login = async (role: Exclude<Role, null>, nid?: string, _password?: string) => {
    try {
      const res = await api.auth.login(nid, role);
      if (res.token) {
        Cookies.set("eg_token", res.token, { expires: 1 });
      }
      const loggedUser: User = {
        id: res.user.id,
        name: res.user.name,
        role: res.user.role,
        constituencyId: res.user.constituencyId,
        constituencyName: res.user.constituencyName,
      };
      setUser(loggedUser);
      Cookies.set("eg_user", JSON.stringify(loggedUser), { expires: 1 });
      recordLogin();
      
      if (role === "admin") router.push("/admin");
      else if (role === "candidate") router.push("/candidate");
      else router.push("/voter");
    } catch (err: any) {
      console.error("Backend authentication failed:", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("eg_user");
    Cookies.remove("eg_token");
    router.push("/");
  };

  const toggleElection = async () => {
    const next = !isElectionStarted;
    setIsElectionStarted(next);
    setElectionStatus(next);

    try {
      await api.election.toggleStatus(next ? "start" : "end");
    } catch (err) {
      console.warn("Backend status update failed, state kept locally", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, isLoggedIn: !!user, login, logout, isLoading, isElectionStarted, toggleElection }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
