"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { recordLogin } from "@/lib/loginHistory";
import { getElectionStatus, setElectionStatus, ELECTION_STATUS_EVENT } from "@/lib/electionStatus";

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
  login: (role: Exclude<Role, null>) => void;
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
    setIsLoading(false);
  }, []);

  // Election on/off status এখন localStorage-ভিত্তিক (আগে শুধু React state-এ ছিল, তাই admin
  // চালু করলেও voter/candidate অন্য ট্যাবে বা refresh করার পর সেটা দেখতে পেত না)
  useEffect(() => {
    setIsElectionStarted(getElectionStatus());
    const syncStatus = () => setIsElectionStarted(getElectionStatus());
    window.addEventListener("storage", syncStatus);
    window.addEventListener(ELECTION_STATUS_EVENT, syncStatus);
    return () => {
      window.removeEventListener("storage", syncStatus);
      window.removeEventListener(ELECTION_STATUS_EVENT, syncStatus);
    };
  }, []);

  const login = (role: Exclude<Role, null>) => {
    // Mock login based on role
    // constituencyId/Name admin এর জন্য "ALL" (EC সব এলাকা oversee করে);
    // voter ও candidate কে ইচ্ছাকৃতভাবে একই আসনে (Dhaka-10) রাখা হয়েছে যাতে
    // feed-এর constituency-scoped visibility ডেমোতে সরাসরি দেখা যায়।
    const mockUser: User = {
      id: role === "admin" ? "A123" : role === "candidate" ? "C001" : "V789",
      name: role === "admin" ? "Election Officer" : role === "candidate" ? "Anisur Rahman" : "Rahim Uddin",
      role: role,
      constituencyId: role === "admin" ? "ALL" : "dhaka-10",
      constituencyName: role === "admin" ? "All Constituencies" : "Dhaka-10",
    };
    setUser(mockUser);
    Cookies.set("eg_user", JSON.stringify(mockUser), { expires: 1 }); // Expires in 1 day
    recordLogin();
    
    // Redirect based on role
    if (role === "admin") router.push("/admin");
    else if (role === "candidate") router.push("/candidate");
    else router.push("/voter");
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("eg_user");
    router.push("/");
  };

  const toggleElection = () => {
    setIsElectionStarted((prev) => {
      const next = !prev;
      setElectionStatus(next);
      return next;
    });
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
