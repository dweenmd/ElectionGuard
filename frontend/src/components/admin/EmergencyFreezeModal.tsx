"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface EmergencyFreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCurrentlyFrozen: boolean;
  onToggleFreeze: (reason: string) => void;
}

export default function EmergencyFreezeModal({
  isOpen,
  onClose,
  isCurrentlyFrozen,
  onToggleFreeze,
}: EmergencyFreezeModalProps) {
  const [reason, setReason] = useState("");
  const [confirmationText, setConfirmationText] = useState("");

  if (!isOpen) return null;

  const requiredConfirmText = isCurrentlyFrozen ? "UNFREEZE" : "FREEZE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmationText.trim() !== requiredConfirmText) {
      toast.error(`Please type "${requiredConfirmText}" to confirm.`);
      return;
    }

    if (!isCurrentlyFrozen && !reason.trim()) {
      toast.error("Please specify a reason for emergency freezing.");
      return;
    }

    onToggleFreeze(reason || "Administrative intervention");
    toast.success(
      isCurrentlyFrozen
        ? "Election voting resumed successfully."
        : "Emergency Freeze Protocol activated! Voting paused.",
      { duration: 4000 }
    );
    setReason("");
    setConfirmationText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl border border-error/30 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
        {/* Header */}
        <div className={`p-6 border-b border-outline-variant/60 flex justify-between items-center ${isCurrentlyFrozen ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrentlyFrozen ? "bg-success text-on-success" : "bg-error text-on-error"}`}>
              <span className="material-symbols-outlined text-[22px]">
                {isCurrentlyFrozen ? "lock_open" : "lock_reset"}
              </span>
            </div>
            <div>
              <h3 className="text-title-lg font-bold text-on-surface">
                {isCurrentlyFrozen ? "Resume Election Voting" : "Emergency Freeze Protocol"}
              </h3>
              <p className="text-caption text-on-surface-variant">
                {isCurrentlyFrozen
                  ? "Re-enable voting transactions on the blockchain"
                  : "Halt all on-chain vote submissions immediately"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-4 mx-6 mt-6 bg-error/5 border border-error/20 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
            warning
          </span>
          <p className="text-body-sm text-on-surface-variant">
            {isCurrentlyFrozen
              ? "Unfreezing will allow voters across all centers to cast ballots again."
              : "Freezing will temporarily reject all incoming transactions from Metamask and smart contract function calls until unfrozen by an authorized Admin."}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isCurrentlyFrozen && (
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-medium text-on-surface">Reason for Emergency Freeze *</label>
              <textarea
                rows={3}
                placeholder="e.g. Investigating network latency or suspicious polling center reports"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-error text-body-md text-on-surface transition-colors resize-none"
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-medium text-on-surface">
              Type <strong className="font-mono text-error">{requiredConfirmText}</strong> to confirm *
            </label>
            <input
              type="text"
              placeholder={requiredConfirmText}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-none focus:border-error text-body-md font-mono text-on-surface transition-colors"
              required
            />
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
              className={`px-6 py-2.5 rounded-lg font-bold text-label-md transition-colors shadow-sm flex items-center gap-2 ${
                isCurrentlyFrozen
                  ? "bg-success text-on-success hover:bg-success/90"
                  : "bg-error text-on-error hover:bg-error/90"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isCurrentlyFrozen ? "play_arrow" : "pause_circle"}
              </span>
              {isCurrentlyFrozen ? "Confirm Unfreeze" : "Confirm Emergency Freeze"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
