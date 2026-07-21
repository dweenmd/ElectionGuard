"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import { getCandidateById } from "@/lib/mockCandidates";

export default function CampaignPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  // logged-in candidate-এর নিজের রেকর্ড mockCandidates.ts থেকে -- আগে এই পুরো টেক্সট এখানে
  // আলাদাভাবে হার্ডকোড ছিল, voter dashboard/profile page-এর সাথে সিঙ্ক থাকতো না।
  const myCandidate = user ? getCandidateById(user.id) : undefined;

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-outline-variant pb-6 gap-4">
            <div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Campaign Management</h1>
              <p className="text-body-lg text-on-surface-variant">আপনার নির্বাচনী ইশতেহার এবং প্রচারণার আপডেট পরিচালনা করুন।</p>
            </div>
            <div className="flex gap-3">
              {user && (
                <Link href={`/candidates/${user.id}`} className="px-4 py-3 border border-outline-variant text-on-surface rounded-lg font-bold flex items-center gap-2 hover:bg-surface-container-lowest transition-colors">
                  <span className="material-symbols-outlined">visibility</span>
                  পাবলিক প্রোফাইল দেখুন
                </Link>
              )}
              <Link href="/feed" className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined">add_box</span>
                নতুন পোস্ট
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Manifesto Editor */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6">
                <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
                  <h2 className="text-headline-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    নির্বাচনী ইশতেহার (Manifesto)
                  </h2>
                  <button className="text-primary text-label-md font-bold hover:underline">Edit</button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-label-md text-on-surface mb-2 font-bold">সংক্ষিপ্ত ইশতেহার (Dashboard Preview)</label>
                    <textarea 
                      className="w-full bg-surface-container-lowest border border-outline rounded-lg p-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      defaultValue={myCandidate ? t(`${myCandidate.translationKey}.quote` as any) : ""}
                    />
                    <p className="text-caption text-on-surface-variant mt-1">This text appears on the Voter Dashboard.</p>
                  </div>
                  
                  <div>
                    <label className="block text-label-md text-on-surface mb-2 font-bold">বিস্তারিত ইশতেহার</label>
                    <textarea 
                      className="w-full bg-surface-container-lowest border border-outline rounded-lg p-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary h-48"
                      defaultValue={myCandidate?.manifestoFull ?? ""}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-primary text-on-primary rounded font-bold hover:bg-primary/90 transition-colors">Save Changes</button>
                  </div>
                </div>
              </div>

              {/* Campaign Posts/Events */}
              <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6">
                <h2 className="text-headline-md text-on-surface mb-4 border-b border-outline-variant pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">event</span>
                  প্রচারণা ও ইভেন্ট
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex gap-4 items-start">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg text-center min-w-[70px]">
                      <div className="text-caption font-bold uppercase">Nov</div>
                      <div className="text-headline-md font-bold">12</div>
                    </div>
                    <div>
                      <h3 className="text-body-lg font-bold text-on-surface">ধানমন্ডি ৩২ নাম্বারে জনসভা</h3>
                      <p className="text-body-md text-on-surface-variant line-clamp-2 mt-1">আগামীকাল বিকাল ৩ টায় ধানমন্ডি ৩২ নাম্বারে এক বিশাল জনসভার আয়োজন করা হয়েছে। সবাইকে উপস্থিত থাকার আহ্বান জানাচ্ছি।</p>
                      <div className="mt-2 text-caption text-secondary">Published: 2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex gap-4 items-start">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg text-center min-w-[70px]">
                      <div className="text-caption font-bold uppercase">Nov</div>
                      <div className="text-headline-md font-bold">10</div>
                    </div>
                    <div>
                      <h3 className="text-body-lg font-bold text-on-surface">কলাবাগান এলাকায় গণসংযোগ</h3>
                      <p className="text-body-md text-on-surface-variant line-clamp-2 mt-1">আজ সারাদিন কলাবাগান এলাকার সাধারণ মানুষের সাথে গণসংযোগ করেছি। তাদের অভাব অভিযোগ শুনেছি।</p>
                      <div className="mt-2 text-caption text-secondary">Published: 2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Stats */}
            <div className="flex flex-col gap-6">
              <div className="bg-surface rounded-xl shadow-card border border-outline-variant p-6">
                <h3 className="text-body-lg font-bold text-on-surface mb-4">Campaign Reach</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-caption text-on-surface-variant mb-1">
                      <span>Voters Reached</span>
                      <span>45,000 / 1,20,000</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-caption text-on-surface-variant mb-1">
                      <span>Manifesto Views</span>
                      <span>12,450</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary-container/50 rounded-xl p-6 border border-secondary/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-secondary text-2xl">campaign</span>
                  <h3 className="text-label-md font-bold text-on-surface">EC Guidelines</h3>
                </div>
                <p className="text-caption text-on-surface-variant">
                  Ensure all campaign posts comply with the Election Commission's Digital Campaign Guidelines 2026. Hate speech or false promises may result in candidacy cancellation.
                </p>
                <Link href="#" className="text-primary text-caption font-bold hover:underline mt-2 inline-block">Read Full Guidelines</Link>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
