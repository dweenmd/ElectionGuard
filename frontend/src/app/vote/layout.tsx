"use client";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["voter", "candidate"]}>
      {children}
    </ProtectedRoute>
  );
}
