"use client";
import React from "react";
import { useTranslation } from "@/context/UIContext";

export default function AnalyticsVisualizer() {
  const { t } = useTranslation();

  const hourlyData = [
    { time: "08:00 AM", percentage: 12, votes: "5,48,000" },
    { time: "10:00 AM", percentage: 28, votes: "12,78,000" },
    { time: "12:00 PM", percentage: 46, votes: "21,01,000" },
    { time: "02:00 PM", percentage: 64, votes: "29,23,000" },
    { time: "04:00 PM (Current)", percentage: 78, votes: "35,62,954" },
  ];

  const candidateDistribution = [
    { name: "Green Wave Party (GWP)", code: "GWP", color: "bg-success", percentage: 42, votes: "14,96,440", icon: "eco" },
    { name: "Sunrise Alliance (SRA)", code: "SRA", color: "bg-primary", percentage: 38, votes: "13,53,922", icon: "wb_sunny" },
    { name: "River Forum (RF)", code: "RF", color: "bg-secondary", percentage: 20, votes: "7,12,592", icon: "water_drop" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Turnout Trend Widget */}
      <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">trending_up</span>
              Voter Turnout Hourly Trend
            </h3>
            <span className="bg-primary/10 text-primary text-label-sm font-bold px-2.5 py-1 rounded-full border border-primary/20">
              78% Turnout Rate
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant mb-6">
            Real-time hourly vote cast progression across 4,500 polling centers nationwide.
          </p>

          <div className="space-y-4">
            {hourlyData.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-label-md">
                  <span className="font-bold text-on-surface">{item.time}</span>
                  <span className="text-on-surface-variant font-mono">
                    {item.votes} votes ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-outline-variant/50 flex justify-between items-center text-caption text-on-surface-variant">
          <span>Source: Central Election Commission RPC Node</span>
          <span className="font-mono">Updated 1 min ago</span>
        </div>
      </div>

      {/* Candidate Vote Distribution Widget */}
      <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">pie_chart</span>
              Live Candidate Vote Share
            </h3>
            <span className="bg-secondary/10 text-secondary text-label-sm font-bold px-2.5 py-1 rounded-full border border-secondary/20">
              3 Candidates
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant mb-6">
            Current automated tallying calculation directly pulled from zero-knowledge encrypted ledger.
          </p>

          {/* Combined Visual Bar */}
          <div className="w-full h-4 rounded-full overflow-hidden flex mb-6 border border-outline-variant/40">
            {candidateDistribution.map((cand, idx) => (
              <div
                key={idx}
                className={`${cand.color} h-full transition-all duration-700`}
                style={{ width: `${cand.percentage}%` }}
                title={`${cand.name}: ${cand.percentage}%`}
              />
            ))}
          </div>

          <div className="space-y-4">
            {candidateDistribution.map((cand, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${cand.color} text-white flex items-center justify-center shadow-sm`}>
                    <span className="material-symbols-outlined text-[18px]">{cand.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">{cand.name}</h4>
                    <p className="text-caption text-on-surface-variant font-mono">{cand.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-title-sm font-bold text-on-surface font-mono">{cand.votes}</p>
                  <p className="text-caption font-bold text-primary">{cand.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-outline-variant/50 flex justify-between items-center text-caption text-on-surface-variant">
          <span>Audited by Cryptographic Verifier</span>
          <span className="text-success font-bold">100% Validated</span>
        </div>
      </div>
    </div>
  );
}
