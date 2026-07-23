"use client";
import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import BlockchainStatusWidget from "@/components/admin/BlockchainStatusWidget";
import AnalyticsVisualizer from "@/components/admin/AnalyticsVisualizer";
import AddVoterModal from "@/components/admin/AddVoterModal";
import EmergencyFreezeModal from "@/components/admin/EmergencyFreezeModal";
import { useTranslation } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { useAuditLog } from "@/context/AuditLogContext";
import toast from "react-hot-toast";
import { downloadCsv } from "@/lib/csvExport";

interface VoterRecord {
  id: string;
  name: string;
  nameEn: string;
  nid: string;
  nidEn: string;
  constituency: string;
  status: "verified" | "pending" | "flagged";
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { isElectionStarted } = useAuth();
  const { logAction, entries } = useAuditLog();

  // Interactive States
  const [isAddVoterOpen, setIsAddVoterOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  // Voter Table States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending" | "flagged">("all");

  const [votersList, setVotersList] = useState<VoterRecord[]>([
    { id: "VOT-101", name: "রহিম উদ্দিন", nameEn: "Rahim Uddin", nid: "১৯৮২০০০০০০০", nidEn: "19820000000", constituency: "Dhaka-10", status: "verified" },
    { id: "VOT-102", name: "ফাতেমা বেগম", nameEn: "Fatema Begum", nid: "১৯৯০৩০০০০০০", nidEn: "19903000000", constituency: "Chittagong-01", status: "pending" },
    { id: "VOT-103", name: "কাজী সজল", nameEn: "Kazi Sajal", nid: "১৯৯৫৫০২০১০১", nidEn: "19955020101", constituency: "Sylhet-01", status: "verified" },
    { id: "VOT-104", name: "নুসরাত জাহান", nameEn: "Nusrat Jahan", nid: "১৯৮৮৭০৩০৪০৫", nidEn: "19887030405", constituency: "Dhaka-11", status: "flagged" },
  ]);

  const handlePublishResults = () => {
    logAction("Results Published", "Election results published to public portal");
    toast.success(t('admin.resultsPublished'));
  };

  const handleExportAuditLog = () => {
    downloadCsv(
      "audit-log.csv",
      ["ID", "Actor", "Action", "Details", "Date"],
      entries.map((e) => [e.id, e.actor, e.action, e.details, e.createdAt])
    );
    logAction("Exported Audit Log", "CSV report generated");
    toast.success(t('admin.exportSuccess'));
  };

  const handleExportVoterListPdf = () => {
    toast("PDF export feature is ready for integration with backend PDF service.", { icon: "🚧" });
  };

  const handleAddVoter = (newVoterData: { name: string; nameEn: string; nid: string; nidEn: string; constituency: string; status: "verified" | "pending" }) => {
    const newRecord: VoterRecord = {
      id: `VOT-${100 + votersList.length + 1}`,
      ...newVoterData,
    };
    setVotersList((prev) => [newRecord, ...prev]);
    logAction("New Voter Registered", `${newVoterData.nameEn} (NID: ${newVoterData.nidEn}) registered under ${newVoterData.constituency}`);
  };

  const handleToggleVoterStatus = (voterId: string) => {
    setVotersList((prev) =>
      prev.map((v) => {
        if (v.id === voterId) {
          const nextStatus: "verified" | "pending" | "flagged" = v.status === "verified" ? "pending" : "verified";
          logAction("Voter Status Updated", `${v.nameEn} (${v.id}) changed to ${nextStatus}`);
          toast.success(`Status updated for ${v.nameEn} to ${nextStatus}`);
          return { ...v, status: nextStatus };
        }
        return v;
      })
    );
  };

  const handleToggleFreeze = (reason: string) => {
    setIsFrozen((prev) => !prev);
    logAction(
      isFrozen ? "Emergency Freeze Revoked" : "Emergency Freeze Activated",
      reason || "Administrative intervention"
    );
  };

  // Filtered Voters
  const filteredVoters = votersList.filter((v) => {
    const matchesSearch =
      v.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.includes(searchQuery) ||
      v.nidEn.includes(searchQuery) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden w-full bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />

        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
          {/* Header Title Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-headline-lg-mobile md:text-display-sm text-on-background font-bold mb-1">
                {t('admin.title')}
              </h1>
              <p className="text-body-lg text-on-surface-variant">
                {t('admin.subtitle')} — Zero-Knowledge Cryptographic Voting Control
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFreezeModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-label-md font-bold transition-all shadow-sm ${
                  isFrozen
                    ? "bg-error text-on-error hover:bg-error/90 animate-pulse"
                    : "bg-surface-container-high border border-outline-variant hover:border-error/50 text-error"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isFrozen ? "pause_circle" : "security_update_warning"}
                </span>
                {isFrozen ? "SYSTEM FROZEN" : "Emergency Freeze"}
              </button>
            </div>
          </div>

          {/* Election Status Banner & Link */}
          <Link
            href="/admin/election-control"
            className={`flex items-center justify-between gap-4 rounded-xl border-2 p-4 md:p-5 transition-all hover:shadow-card ${
              isElectionStarted
                ? "bg-success/10 border-success/30"
                : "bg-surface-container-lowest border-outline-variant hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-2xl ${isElectionStarted ? "text-success" : "text-on-surface-variant"}`}>
                {isElectionStarted ? "lock_open" : "lock"}
              </span>
              <div>
                <p className={`text-label-md font-bold ${isElectionStarted ? "text-success" : "text-on-surface"}`}>
                  {isElectionStarted ? t('electionControl.statusActive') : t('electionControl.statusInactive')}
                </p>
                <p className="text-caption text-on-surface-variant">{t('common.electionControl')} — Manage polling dates and on-chain voting states</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold text-label-md">
              <span>Control Portal</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </div>
          </Link>

          {/* SECTION 1: Blockchain Live Smart Contract Status Widget */}
          <BlockchainStatusWidget />

          {/* SECTION 2: Top 3 Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Total Registered Voters */}
            <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 relative flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-2xl">group</span>
                </div>
                <div className="bg-primary/10 text-primary text-label-sm font-bold px-2.5 py-1 rounded-full border border-primary/20">
                  +2.8% this week
                </div>
              </div>
              <div>
                <p className="text-body-md text-on-surface-variant mb-1">{t('admin.totalVoters')}</p>
                <h2 className="text-display-sm font-bold text-on-surface tracking-tight">45,67,890</h2>
                <p className="text-caption text-on-surface-variant mt-1">100% NID Verified Database</p>
              </div>
            </div>

            {/* Card 2: Active Elections */}
            <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 relative flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-2xl">how_to_vote</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-variant text-on-surface-variant text-label-sm px-2.5 py-1 rounded-full border border-outline-variant">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  {t('admin.encrypted')}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-body-md text-on-surface-variant mb-1">{t('admin.activeElections')}</p>
                <h2 className="text-display-sm font-bold text-on-surface">3 Active</h2>
              </div>
              <button
                onClick={handlePublishResults}
                className="w-full bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container transition-colors py-2.5 rounded-lg text-label-md font-bold flex justify-center items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">publish</span>
                {t('admin.publishResults')}
              </button>
            </div>

            {/* Card 3: Security & System Health */}
            <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 relative flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-2xl">security</span>
                </div>
                <div className="bg-success/10 text-success text-label-sm font-bold px-2.5 py-1 rounded-full border border-success/20">
                  {t('admin.secure')}
                </div>
              </div>
              <div>
                <p className="text-body-md text-on-surface-variant mb-1">{t('admin.systemHealth')}</p>
                <h2 className="text-display-sm font-bold text-on-surface">99.9%</h2>
                <p className="text-body-md font-bold text-success flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  Zero Security Threats Detected
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Real-Time Analytics & Turnout Visualizers */}
          <AnalyticsVisualizer />

          {/* SECTION 4: Interactive Voter Management & Export Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voter Management Module (2 Cols) */}
            <div className="lg:col-span-2 bg-surface rounded-xl shadow-card border border-outline-variant p-6">
              {/* Header Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-outline-variant/60 pb-4">
                <div>
                  <h2 className="text-headline-md font-bold text-on-surface">{t('admin.voterManagement')}</h2>
                  <p className="text-caption text-on-surface-variant">Filter, verify, and register official voters</p>
                </div>
                <button
                  onClick={() => setIsAddVoterOpen(true)}
                  className="bg-primary text-on-primary hover:bg-primary/90 transition-all shadow-sm px-4 py-2 rounded-lg text-label-md font-bold flex items-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  {t('admin.addVoter')}
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by Name or NID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant p-1 rounded-lg w-full sm:w-auto">
                  {(["all", "verified", "pending", "flagged"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1 rounded-md text-label-sm font-bold capitalize transition-all ${
                        statusFilter === filter
                          ? "bg-primary text-on-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voters Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-outline-variant bg-surface-container-lowest">
                    <tr>
                      <th className="text-left py-3 px-3 text-label-md text-on-surface-variant font-medium">Voter Name</th>
                      <th className="text-left py-3 px-3 text-label-md text-on-surface-variant font-medium">NID Number</th>
                      <th className="text-left py-3 px-3 text-label-md text-on-surface-variant font-medium">Constituency</th>
                      <th className="text-left py-3 px-3 text-label-md text-on-surface-variant font-medium">Status</th>
                      <th className="text-right py-3 px-3 text-label-md text-on-surface-variant font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVoters.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-on-surface-variant text-body-md">
                          No voter records found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredVoters.map((voter) => (
                        <tr
                          key={voter.id}
                          className="border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-lowest/50 transition-colors"
                        >
                          <td className="py-3.5 px-3">
                            <div>
                              <p className="text-body-md font-bold text-on-surface">
                                {t('admin.title') === "Admin Dashboard" ? voter.nameEn : voter.name}
                              </p>
                              <p className="text-caption font-mono text-on-surface-variant">{voter.id}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-body-md font-mono text-on-surface-variant">
                            {voter.nidEn}
                          </td>
                          <td className="py-3.5 px-3 text-body-md text-on-surface font-medium">
                            {voter.constituency}
                          </td>
                          <td className="py-3.5 px-3">
                            {voter.status === "verified" && (
                              <span className="inline-flex items-center gap-1 bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full text-label-sm font-bold">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified
                              </span>
                            )}
                            {voter.status === "pending" && (
                              <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full text-label-sm font-bold">
                                <span className="material-symbols-outlined text-[14px]">warning</span> Pending
                              </span>
                            )}
                            {voter.status === "flagged" && (
                              <span className="inline-flex items-center gap-1 bg-error/10 text-error border border-error/30 px-2.5 py-1 rounded-full text-label-sm font-bold">
                                <span className="material-symbols-outlined text-[14px]">flag</span> Flagged
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => handleToggleVoterStatus(voter.id)}
                              className="text-label-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 transition-colors"
                            >
                              {voter.status === "verified" ? "Unverify" : "Verify"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Reports & Security Integrity Card */}
            <div className="space-y-6">
              {/* Export Reports Card */}
              <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-headline-md font-bold text-on-surface mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">download</span>
                    {t('admin.exportReports')}
                  </h2>
                  <p className="text-body-md text-on-surface-variant mb-6">
                    {t('admin.exportDesc')}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleExportVoterListPdf}
                    className="w-full flex items-center justify-between p-3.5 border border-outline-variant rounded-xl hover:bg-surface-container-lowest hover:border-primary/40 transition-all font-bold text-on-surface"
                  >
                    <span className="text-label-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-error">picture_as_pdf</span>
                      {t('admin.voterListPdf')}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant">download</span>
                  </button>

                  <button
                    onClick={handleExportAuditLog}
                    className="w-full flex items-center justify-between p-3.5 border border-outline-variant rounded-xl hover:bg-surface-container-lowest hover:border-primary/40 transition-all font-bold text-on-surface"
                  >
                    <span className="text-label-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-success">csv</span>
                      {t('admin.auditLogCsv')}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant">download</span>
                  </button>
                </div>
              </div>

              {/* Fraud Prevention & Security Health */}
              <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6">
                <h3 className="text-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-success text-[22px]">gavel</span>
                  Fraud Prevention Engine
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/40">
                    <span className="text-label-md text-on-surface">Double Voting Rate</span>
                    <span className="text-label-md font-bold text-success">0.00% (Blocked)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/40">
                    <span className="text-label-md text-on-surface">ZK Proof Verifications</span>
                    <span className="text-label-md font-bold text-primary font-mono">100% Passed</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/40">
                    <span className="text-label-md text-on-surface">Biometric Hash Matching</span>
                    <span className="text-label-md font-bold text-on-surface font-mono">SHA-256 Valid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Create Election & Live Audit Log Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Election Form */}
            <div className="lg:col-span-2 bg-surface rounded-xl shadow-card border border-outline-variant p-6">
              <h2 className="text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">add_box</span>
                {t('admin.createElection')}
              </h2>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Election draft created!"); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-body-md text-on-surface-variant font-medium">{t('admin.electionName')}</label>
                    <input
                      type="text"
                      placeholder={t('admin.electionNamePlaceholder')}
                      className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary transition-colors text-body-md text-on-surface"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-body-md text-on-surface-variant font-medium">{t('admin.date')}</label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary transition-colors text-body-md text-on-surface"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-body-md text-on-surface-variant font-medium">{t('admin.positions')}</label>
                  <textarea
                    placeholder={t('admin.positionsPlaceholder')}
                    rows={3}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary transition-colors resize-none text-body-md text-on-surface"
                  ></textarea>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_task</span>
                    {t('admin.createElection')}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Audit Log Feed */}
            <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-headline-md font-bold text-on-surface mb-6 flex items-center justify-between">
                  <span>{t('admin.auditLogs')}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping" />
                </h2>

                <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto pr-1">
                  {entries.length === 0 ? (
                    <p className="text-caption text-on-surface-variant">No audit logs recorded yet.</p>
                  ) : (
                    entries.slice(0, 5).map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/50 flex flex-col gap-1"
                      >
                        <div className="flex justify-between items-center text-caption font-bold text-on-surface-variant">
                          <span className="text-primary font-mono">{entry.action}</span>
                          <span className="font-mono text-[11px]">{entry.createdAt}</span>
                        </div>
                        <p className="text-body-sm text-on-surface">{entry.details}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                href="/admin/audit-log"
                className="mt-4 pt-3 border-t border-outline-variant/50 text-center text-label-md font-bold text-primary hover:underline block"
              >
                View Complete Audit History →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Modals */}
      <AddVoterModal
        isOpen={isAddVoterOpen}
        onClose={() => setIsAddVoterOpen(false)}
        onAddVoter={handleAddVoter}
      />

      <EmergencyFreezeModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        isCurrentlyFrozen={isFrozen}
        onToggleFreeze={handleToggleFreeze}
      />
    </div>
  );
}