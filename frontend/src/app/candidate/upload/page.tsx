"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslation } from "@/context/UIContext";

// এই পেজটি ক্যান্ডিডেটদের প্রয়োজনীয় ডকুমেন্টস (EC Rules অনুযায়ী) আপলোড করার জন্য তৈরি করা হয়েছে।
export default function CandidateUploadDocsPage() {
  const { t } = useTranslation();
  const [uploadStatus, setUploadStatus] = useState("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus("uploading");
    
    // ডেমো আপলোড প্রসেস - ২ সেকেন্ড পর success দেখাবে
    setTimeout(() => {
      setUploadStatus("success");
      toast.success(t('candidate.successMsg'));
    }, 2000);
  };

  return (
    <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('candidate.uploadDocsTitle')}</h1>
        <p className="text-body-lg text-on-surface-variant">{t('candidate.uploadDocsDesc2')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-card border border-outline-variant p-6 md:p-8 flex flex-col gap-8">
        
        {/* ১. মূল মনোনয়নপত্র ও পরিচয় */}
        <section className="flex flex-col gap-4">
          <h2 className="text-headline-md text-on-surface border-b border-outline-variant pb-2">{t('candidate.sec1')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* মনোনয়ন ফরম */}
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('candidate.nominationForm')}</label>
              <input type="file" required className="file-input border border-outline-variant rounded-lg p-2 text-body-md" accept=".pdf" />
              <p className="text-caption text-on-surface-variant">Max size: 5MB (.pdf)</p>
            </div>
            
            {/* NID */}
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('candidate.nidCopy')}</label>
              <input type="file" required className="file-input border border-outline-variant rounded-lg p-2 text-body-md" accept=".pdf,.jpg,.jpeg,.png" />
            </div>

            {/* ছবি */}
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('candidate.photo')}</label>
              <input type="file" required className="file-input border border-outline-variant rounded-lg p-2 text-body-md" accept=".jpg,.jpeg,.png" />
            </div>
          </div>
        </section>

        {/* ২. শিক্ষাগত ও দলীয় কাগজপত্র */}
        <section className="flex flex-col gap-4">
          <h2 className="text-headline-md text-on-surface border-b border-outline-variant pb-2">{t('candidate.sec2')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('candidate.education')}</label>
              <input type="file" required className="file-input border border-outline-variant rounded-lg p-2 text-body-md" accept=".pdf" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('candidate.partyCert')}</label>
              <input type="file" required className="file-input border border-outline-variant rounded-lg p-2 text-body-md" accept=".pdf" />
              <p className="text-caption text-on-surface-variant">{t('candidate.partyCertDesc')}</p>
            </div>
          </div>
        </section>

        {/* ৩. হলফনামা (Affidavit) */}
        <section className="flex flex-col gap-4">
          <h2 className="text-headline-md text-on-surface border-b border-outline-variant pb-2">{t('candidate.sec3')}</h2>
          <p className="text-caption text-error bg-error/10 p-2 rounded">{t('candidate.notaryRequired')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('candidate.caseInfo')}</label>
              <input type="file" required className="file-input border border-outline-variant rounded-lg p-2 text-body-md" accept=".pdf" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('candidate.wealthInfo')}</label>
              <input type="file" required className="file-input border border-outline-variant rounded-lg p-2 text-body-md" accept=".pdf" />
            </div>
          </div>
        </section>

        {/* ৪. আর্থিক ও ব্যাংকিং তথ্য */}
        <section className="flex flex-col gap-4">
          <h2 className="text-headline-md text-on-surface border-b border-outline-variant pb-2">{t('candidate.sec4')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('candidate.taxReturn')}</label>
              <input type="file" required className="file-input border border-outline-variant rounded-lg p-2 text-body-md" accept=".pdf" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('candidate.challan')}</label>
              <input type="file" required className="file-input border border-outline-variant rounded-lg p-2 text-body-md" accept=".pdf" />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-outline-variant">
          <Link href="/candidate" className="px-6 py-3 border border-outline text-on-surface-variant hover:text-on-surface rounded-lg font-bold transition-colors">
            {t('common.cancel')}
          </Link>
          <button 
            type="submit" 
            disabled={uploadStatus === "uploading"}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploadStatus === "uploading" ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                {t('common.uploading')}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">cloud_upload</span>
                {t('common.submit')}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
