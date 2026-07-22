"use client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { UIProvider } from "@/context/UIContext";
import { AuthProvider } from "@/context/AuthContext";
import { Web3Provider } from "@/context/Web3Context";
import { FeedProvider } from "@/context/FeedContext";
import { GrievanceProvider } from "@/context/GrievanceContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { CandidateProvider } from "@/context/CandidateContext";
import { AuditLogProvider } from "@/context/AuditLogContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import IdleTimeoutGuard from "@/components/IdleTimeoutGuard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AccessibilityProvider>
      <AuthProvider>
        <Web3Provider>
          <UIProvider>
            <FeedProvider>
              <GrievanceProvider>
                <CandidateProvider>
                  <AuditLogProvider>
                    <NotificationProvider>
                      {children}
                      <IdleTimeoutGuard />
                    </NotificationProvider>
                  </AuditLogProvider>
                </CandidateProvider>
              </GrievanceProvider>
            </FeedProvider>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                className: 'bg-surface text-on-surface border border-outline-variant shadow-lg',
                style: {
                  borderRadius: '10px',
                  background: 'var(--md-sys-color-surface)',
                  color: 'var(--md-sys-color-on-surface)',
                },
              }}
            />
          </UIProvider>
        </Web3Provider>
      </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
