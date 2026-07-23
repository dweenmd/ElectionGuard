"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface AddVoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVoter: (voter: { name: string; nameEn: string; nid: string; nidEn: string; constituency: string; status: "verified" | "pending" }) => void;
}

export default function AddVoterModal({ isOpen, onClose, onAddVoter }: AddVoterModalProps) {
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [nid, setNid] = useState("");
  const [constituency, setConstituency] = useState("Dhaka-10");
  const [status, setStatus] = useState<"verified" | "pending">("pending");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim() || !nid.trim()) {
      toast.error("Please fill in voter name and NID number.");
      return;
    }

    if (nid.length < 10) {
      toast.error("NID number must be at least 10 digits.");
      return;
    }

    onAddVoter({
      name: nameBn || nameEn,
      nameEn: nameEn,
      nid: nid,
      nidEn: nid,
      constituency,
      status,
    });

    toast.success(`Voter ${nameEn} added successfully!`);
    setNameEn("");
    setNameBn("");
    setNid("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/60 flex justify-between items-center bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <div>
              <h3 className="text-title-lg font-bold text-on-surface">Add New Voter</h3>
              <p className="text-caption text-on-surface-variant">Register a new voter into ElectionGuard system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-medium text-on-surface">Full Name (English) *</label>
              <input
                type="text"
                placeholder="e.g. Tanvir Ahmed"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary text-body-md text-on-surface transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-medium text-on-surface">Full Name (Bangla)</label>
              <input
                type="text"
                placeholder="যেমন: তানভীর আহমেদ"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary text-body-md text-on-surface transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-medium text-on-surface">National ID (NID) Number *</label>
            <input
              type="text"
              placeholder="e.g. 199510203040"
              value={nid}
              onChange={(e) => setNid(e.target.value)}
              className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary text-body-md font-mono text-on-surface transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-medium text-on-surface">Constituency</label>
              <select
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary text-body-md text-on-surface transition-colors"
              >
                <option value="Dhaka-10">Dhaka-10</option>
                <option value="Dhaka-11">Dhaka-11</option>
                <option value="Chittagong-01">Chittagong-01</option>
                <option value="Sylhet-01">Sylhet-01</option>
                <option value="Rajshahi-02">Rajshahi-02</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-medium text-on-surface">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "verified" | "pending")}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-primary text-body-md text-on-surface transition-colors"
              >
                <option value="pending">Pending Verification</option>
                <option value="verified">Verified (Approved)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-outline-variant/50 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-outline-variant text-label-md font-bold text-on-surface hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Register Voter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
