"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

export default function UploadPage() {
  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar role="voter" />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">ডকুমেন্ট আপলোড</h1>
            <p className="text-body-lg text-on-surface-variant">KYC যাচাইয়ের জন্য আপনার প্রয়োজনীয় ডকুমেন্ট আপলোড করুন।</p>
          </div>

          <div className="space-y-6">
            {/* NID Upload */}
            <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant">
              <h3 className="text-headline-md text-on-background text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">badge</span>
                জাতীয় পরিচয়পত্র (NID)
              </h3>
              <div className="border border-dashed border-outline-variant rounded-lg p-8 flex flex-col items-center justify-center text-center gap-3 hover:bg-surface-container transition-colors cursor-pointer group bg-surface-container-lowest">
                <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">cloud_upload</span>
                <span className="text-body-md text-on-surface group-hover:text-primary transition-colors">ক্লিক করুন বা ফাইল টেনে আনুন</span>
                <span className="text-caption text-outline">JPG, PNG, PDF — সর্বোচ্চ 5MB</span>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-surface rounded-xl p-6 shadow-card border border-outline-variant">
              <h3 className="text-headline-md text-on-background text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_camera</span>
                পাসপোর্ট সাইজ ছবি
              </h3>
              <div className="border border-dashed border-outline-variant rounded-lg p-8 flex flex-col items-center justify-center text-center gap-3 hover:bg-surface-container transition-colors cursor-pointer group bg-surface-container-lowest">
                <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">cloud_upload</span>
                <span className="text-body-md text-on-surface group-hover:text-primary transition-colors">ক্লিক করুন বা ফাইল টেনে আনুন</span>
                <span className="text-caption text-outline">JPG, PNG — সর্বোচ্চ 2MB</span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/voter" className="border border-outline text-primary text-label-md px-6 py-3 rounded-lg hover:bg-surface-container transition-colors">
                বাতিল
              </Link>
              <button className="bg-primary text-on-primary text-label-md px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                ডকুমেন্ট জমা দিন
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}