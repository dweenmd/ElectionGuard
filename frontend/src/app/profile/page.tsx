"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { getLoginHistory, LoginHistoryEntry } from "@/lib/loginHistory";
import { useTranslation } from "@/context/UIContext";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getLoginHistory());
  }, []);
  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">

          {/* Page Header */}
          <div className="mb-8">
            <h3 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Personal Information</h3>
            <p className="text-body-md text-on-surface-variant">Manage your demographic details and civic identity securely.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Banner */}
            <div className="col-span-1 lg:col-span-3 bg-surface-container-lowest rounded-xl shadow-card p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface bg-surface-variant flex-shrink-0 relative flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                <button className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full shadow-sm hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-headline-md text-on-surface mb-1">Anisur Rahman</h4>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="text-body-md text-on-surface-variant">Voter ID: 1982374012</span>
                  <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-caption font-semibold">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified
                  </span>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <button className="w-full md:w-auto bg-primary text-on-primary px-6 py-3 rounded text-label-md hover:opacity-90 transition-opacity">
                  View Digital ID Card
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="col-span-1 lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-card p-6">
              <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
                <h5 className="text-body-lg font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">badge</span> Details
                </h5>
                <button className="text-primary text-label-md hover:underline">Edit All</button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">Full Name (Bangla)</label>
                    <div className="bg-surface p-3 rounded border border-outline-variant text-body-md text-on-surface">আনিসুর রহমান</div>
                  </div>
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">Full Name (English)</label>
                    <div className="bg-surface p-3 rounded border border-outline-variant text-body-md text-on-surface">Anisur Rahman</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">Date of Birth</label>
                    <div className="bg-surface p-3 rounded border border-outline-variant text-body-md text-on-surface">12 Oct 1985</div>
                  </div>
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-1">NID Number</label>
                    <div className="bg-surface p-3 rounded border border-outline-variant text-body-md text-on-surface">8374920183</div>
                  </div>
                </div>
                <div>
                  <label className="block text-caption text-on-surface-variant mb-1">Registered Address</label>
                  <div className="bg-surface p-3 rounded border border-outline-variant text-body-md text-on-surface">
                    45 Banani Road, Block C<br/>
                    Dhaka 1213, Bangladesh
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Cards */}
            <div className="col-span-1 flex flex-col gap-6">
              {/* Security */}
              <div className="bg-surface-container-lowest rounded-xl shadow-card p-6">
                <h5 className="text-body-lg font-semibold text-on-surface flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">security</span> Security
                </h5>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-surface-container">
                    <div>
                      <p className="text-label-md text-on-surface">Two-Factor Auth</p>
                      <p className="text-caption text-secondary">Enabled via SMS</p>
                    </div>
                    <button className="text-primary hover:bg-surface-variant p-2 rounded-full transition-colors">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-surface-container">
                    <div>
                      <p className="text-label-md text-on-surface">Password</p>
                      <p className="text-caption text-on-surface-variant">Last changed 30 days ago</p>
                    </div>
                    <button className="text-primary hover:bg-surface-variant p-2 rounded-full transition-colors">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Login Activity */}
              <div className="bg-surface-container-lowest rounded-xl shadow-card p-6">
                <h5 className="text-body-lg font-semibold text-on-surface flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">history</span> {t('profilePage.loginActivity')}
                </h5>
                {history.length === 0 && (
                  <p className="text-caption text-on-surface-variant">{t('profilePage.noLoginHistory')}</p>
                )}
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={i} className="flex justify-between items-center text-caption">
                      <span className="text-on-surface">{h.device}</span>
                      <span className="text-on-surface-variant">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-surface-container-lowest rounded-xl shadow-card p-6">
                <h5 className="text-body-lg font-semibold text-on-surface flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">notifications</span> Alerts
                </h5>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-label-md text-on-surface">Email Notifications</span>
                    <div className="w-10 h-6 bg-primary rounded-full relative">
                      <div className="absolute left-5 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-label-md text-on-surface">SMS Alerts</span>
                    <div className="w-10 h-6 bg-primary rounded-full relative">
                      <div className="absolute left-5 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-label-md text-on-surface">Postal Mail</span>
                    <div className="w-10 h-6 bg-surface-variant border border-outline-variant rounded-full relative">
                      <div className="absolute left-1 top-1 bg-white border border-outline-variant w-4 h-4 rounded-full transition"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="w-full mt-auto py-8 px-4 md:px-10 bg-surface border-t border-outline-variant">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-caption text-on-surface-variant">© 2026 ElectionGuard. Secure Election Management Systems.</span>
            <div className="flex gap-4">
              <Link href="#" className="text-caption text-on-surface-variant hover:text-primary underline">Privacy</Link>
              <Link href="#" className="text-caption text-on-surface-variant hover:text-primary underline">Terms</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}