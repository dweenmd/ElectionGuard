"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { isLoggedIn, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (role && !allowedRoles.includes(role)) {
        // If logged in but wrong role, redirect to their correct portal
        if (role === "admin") router.push("/admin");
        else if (role === "candidate") router.push("/candidate");
        else router.push("/voter");
      }
    }
  }, [isLoggedIn, role, isLoading, router, pathname, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <span className="flex h-12 w-12 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-12 w-12 bg-primary"></span>
          </span>
          <p className="text-on-surface-variant text-label-md">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || (role && !allowedRoles.includes(role))) {
    return null;
  }

  return <>{children}</>;
}
