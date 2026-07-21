"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useTranslation } from "@/context/UIContext";
import { useState } from "react";

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  
  // State for Voter List tab
  const voters = [
    { name: "রহিম উদ্দিন", nameEn: "Rahim Uddin", nid: "১৯৮২০০০০০০০", nidEn: "19820000000", status: "verified" },
    { name: "ফাতেমা বেগম", nameEn: "Fatema Begum", nid: "১৯৯০৩০০০০০০", nidEn: "19903000000", status: "pending" }
  ];

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        
        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
          
          <div>
            <h1 className="text-headline-lg-mobile md:text-display-sm text-on-background font-bold mb-2">
              {t('admin.title')}
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              {t('admin.subtitle')}
            </p>
          </div>

          {/* 3 Main Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Total Voters */}
            <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 relative flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">group</span>
                </div>
                <div className="bg-primary/10 text-primary text-label-sm font-bold px-2 py-1 rounded">
                  +2.8%
                </div>
              </div>
              <div>
                <p className="text-body-md text-on-surface-variant mb-2">{t('admin.totalVoters')}</p>
                <h2 className="text-display-sm font-bold text-on-surface tracking-tight">45,67,890</h2>
              </div>
            </div>

            {/* Card 2: Active Elections */}
            <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 relative flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">how_to_vote</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-variant text-on-surface-variant text-label-sm px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  {t('admin.encrypted')}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-body-md text-on-surface-variant mb-2">{t('admin.activeElections')}</p>
                <h2 className="text-display-sm font-bold text-on-surface">3</h2>
              </div>
              <button className="w-full bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container transition-colors py-2 rounded-lg text-label-md font-bold flex justify-center items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">publish</span>
                {t('admin.publishResults')}
              </button>
            </div>

            {/* Card 3: System Health */}
            <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 relative flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">security</span>
                </div>
                <div className="bg-primary-container text-on-primary-container text-label-sm px-2 py-1 rounded">
                  {t('admin.secure')}
                </div>
              </div>
              <div>
                <p className="text-body-md text-on-surface-variant mb-2">{t('admin.systemHealth')}</p>
                <h2 className="text-display-sm font-bold text-on-surface">99.9%</h2>
                <p className="text-headline-md font-bold text-on-surface">{t('admin.uptime')}</p>
              </div>
            </div>

          </div>

          {/* Middle Section: Voter Management & Export */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Voter Management */}
            <div className="lg:col-span-2 bg-surface rounded-xl shadow-card border border-outline-variant p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-headline-md font-bold text-on-surface">{t('admin.voterManagement')}</h2>
                <button className="bg-on-surface text-surface hover:bg-on-surface/90 transition-colors px-4 py-2 rounded-lg text-label-md font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  {t('admin.addVoter')}
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-outline-variant">
                    <tr>
                      <th className="text-left py-3 px-2 text-body-md text-on-surface-variant font-medium">{t('admin.name')}</th>
                      <th className="text-left py-3 px-2 text-body-md text-on-surface-variant font-medium">{t('admin.nidNumber')}</th>
                      <th className="text-left py-3 px-2 text-body-md text-on-surface-variant font-medium">{t('admin.status')}</th>
                      <th className="text-left py-3 px-2 text-body-md text-on-surface-variant font-medium">{t('admin.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voters.map((voter, idx) => (
                      <tr key={idx} className="border-b border-outline-variant/30 last:border-0 hover:bg-surface-variant/20 transition-colors">
                        <td className="py-4 px-2 text-body-md text-on-surface">{t('admin.title') === "Admin Dashboard" ? voter.nameEn : voter.name}</td>
                        <td className="py-4 px-2 text-body-md text-on-surface-variant">{t('admin.title') === "Admin Dashboard" ? voter.nidEn : voter.nid}</td>
                        <td className="py-4 px-2">
                          {voter.status === 'verified' ? (
                            <span className="inline-flex items-center gap-1 bg-primary-container text-on-primary-container px-2 py-1 rounded text-label-sm">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> {t('admin.verified')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-label-sm">
                              <span className="material-symbols-outlined text-[14px]">warning</span> {t('admin.pending')}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-2">
                          <button className="text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Reports */}
            <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 flex flex-col">
              <h2 className="text-headline-md font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px]">download</span>
                {t('admin.exportReports')}
              </h2>
              <p className="text-body-md text-on-surface-variant mb-6">
                {t('admin.exportDesc')}
              </p>
              
              <div className="flex flex-col gap-3 mt-auto">
                <button className="w-full flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors">
                  <span className="text-label-md font-bold text-on-surface">{t('admin.voterListPdf')}</span>
                  <span className="material-symbols-outlined text-on-surface-variant">picture_as_pdf</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors">
                  <span className="text-label-md font-bold text-on-surface">{t('admin.auditLogCsv')}</span>
                  <span className="material-symbols-outlined text-on-surface-variant">csv</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Section: Create Election & Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Election */}
            <div className="lg:col-span-2 bg-surface rounded-xl shadow-card border border-outline-variant p-6">
              <h2 className="text-headline-md font-bold text-on-surface mb-6">{t('admin.createElection')}</h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-body-md text-on-surface-variant">{t('admin.electionName')}</label>
                    <input type="text" placeholder={t('admin.electionNamePlaceholder')} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-body-md text-on-surface-variant">{t('admin.date')}</label>
                    <div className="relative">
                      <input type="text" placeholder="mm/dd/yyyy" className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary transition-colors" />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">calendar_today</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-body-md text-on-surface-variant">{t('admin.positions')}</label>
                  <textarea placeholder={t('admin.positionsPlaceholder')} rows={3} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button type="button" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors">
                    {t('admin.createElection')}
                  </button>
                </div>
              </form>
            </div>

            {/* Audit Logs */}
            <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6">
              <h2 className="text-headline-md font-bold text-on-surface mb-6 flex items-center justify-between">
                {t('admin.auditLogs')}
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
              </h2>
              
              <div className="flex flex-col gap-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-outline-variant/50 ml-2">
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-[3px] border-surface bg-primary-container -translate-x-[12px]"></div>
                  <p className="text-caption font-bold text-on-surface-variant mb-1">{t('admin.auditLog1Time')}</p>
                  <p className="text-body-md text-on-surface bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50">
                    {t('admin.auditLog1Desc')}
                  </p>
                </div>
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-[3px] border-surface bg-secondary-container -translate-x-[12px]"></div>
                  <p className="text-caption font-bold text-on-surface-variant mb-1">{t('admin.auditLog2Time')}</p>
                  <p className="text-body-md text-on-surface bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50">
                    {t('admin.auditLog2Desc')}
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}