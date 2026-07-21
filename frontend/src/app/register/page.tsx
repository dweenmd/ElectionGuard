"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nid: "",
    name: "",
    dob: "",
    phone: "",
    address: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!/^\d{10,17}$/.test(formData.nid.trim())) {
      next.nid = t('register.errorNid');
    }
    if (formData.name.trim().length < 3) {
      next.name = t('register.errorName');
    }
    if (!formData.dob) {
      next.dob = t('register.errorDob');
    } else {
      const age = (Date.now() - new Date(formData.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) next.dob = t('register.errorAge');
      if (new Date(formData.dob) > new Date()) next.dob = t('register.errorDobFuture');
    }
    if (!/^01[3-9]\d{8}$/.test(formData.phone.trim())) {
      next.phone = t('register.errorPhone');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleFaceScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setStep(3);
      toast.success("Face matched with NID photo successfully!");
    }, 2500);
  };

  const handleComplete = () => {
    toast.success("Voter registration complete! Logging in...");
    login("voter");
  };

  return (
    <div className="min-h-screen bg-surface-container flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
      <div className="absolute inset-0 bg-primary/5 backdrop-blur-[2px]"></div>
      
      {/* Back Button */}
      <Link href="/login" className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center gap-2 text-on-surface hover:text-primary transition-colors bg-surface/50 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant/50 shadow-sm hover:shadow">
        <span className="material-symbols-outlined text-xl">arrow_back</span>
        <span className="font-medium text-sm">লগইন পেজে ফিরুন</span>
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-2 text-primary mb-6">
          <span className="material-symbols-outlined text-4xl">how_to_vote</span>
          <span className="text-headline-lg font-bold tracking-tight">ElectionGuard</span>
        </div>
        <h2 className="text-center text-headline-md text-on-surface">
          {t('register.title')}
        </h2>
        <p className="mt-2 text-center text-body-md text-on-surface-variant">
          {t('register.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-surface py-8 px-6 shadow-card border border-outline-variant sm:rounded-xl sm:px-10">
          
          {/* Progress Bar */}
          <div className="mb-8 flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-surface-variant -z-10 -translate-y-1/2"></div>
            <div className="absolute left-0 top-1/2 h-1 bg-primary -z-10 -translate-y-1/2 transition-all" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>2</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>3</div>
          </div>

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5 animate-fade-in">
              <h3 className="text-label-md font-bold text-primary mb-4 border-b border-outline-variant pb-2">{t('register.step1')}</h3>
              
              <div>
                <label className="block text-label-md font-medium text-on-surface mb-1">{t('login.nid')}</label>
                <input required name="nid" value={formData.nid} onChange={handleChange} type="text" aria-invalid={!!errors.nid} className={`w-full bg-surface-container-lowest border rounded-lg py-2 px-3 text-body-md focus:outline-none focus:ring-2 ${errors.nid ? "border-error focus:ring-error" : "border-outline focus:ring-primary"}`} placeholder="e.g. 1982374012" />
                {errors.nid && <p className="text-caption text-error mt-1">{errors.nid}</p>}
              </div>
              
              <div>
                <label className="block text-label-md font-medium text-on-surface mb-1">{t('register.fullName')}</label>
                <input required name="name" value={formData.name} onChange={handleChange} type="text" aria-invalid={!!errors.name} className={`w-full bg-surface-container-lowest border rounded-lg py-2 px-3 text-body-md focus:outline-none focus:ring-2 ${errors.name ? "border-error focus:ring-error" : "border-outline focus:ring-primary"}`} placeholder="ইলেকশন কমিশনের ডাটাবেজ অনুযায়ী" />
                {errors.name && <p className="text-caption text-error mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-medium text-on-surface mb-1">{t('register.dob')}</label>
                  <input required name="dob" value={formData.dob} onChange={handleChange} type="date" aria-invalid={!!errors.dob} className={`w-full bg-surface-container-lowest border rounded-lg py-2 px-3 text-body-md focus:outline-none focus:ring-2 ${errors.dob ? "border-error focus:ring-error" : "border-outline focus:ring-primary"}`} />
                  {errors.dob && <p className="text-caption text-error mt-1">{errors.dob}</p>}
                </div>
                <div>
                  <label className="block text-label-md font-medium text-on-surface mb-1">{t('register.phone')}</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" aria-invalid={!!errors.phone} className={`w-full bg-surface-container-lowest border rounded-lg py-2 px-3 text-body-md focus:outline-none focus:ring-2 ${errors.phone ? "border-error focus:ring-error" : "border-outline focus:ring-primary"}`} placeholder="017XXXXXXXX" />
                  {errors.phone && <p className="text-caption text-error mt-1">{errors.phone}</p>}
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors mt-6">
                {t('register.next')}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center animate-fade-in">
              <h3 className="text-label-md font-bold text-primary mb-2 border-b border-outline-variant pb-2">Step 2: Biometric Verification</h3>
              
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[60px] text-on-surface-variant opacity-50">face</span>
                  {isScanning && (
                    <div className="absolute top-0 left-0 w-full h-2 bg-success animate-bounce shadow-[0_0_10px_#2e7d32]"></div>
                  )}
                </div>
                
                <p className="text-body-md text-on-surface-variant">ক্যামেরার দিকে তাকিয়ে ফেস রিকগনিশন সম্পূর্ণ করুন। এটি আপনার NID এর ছবির সাথে মিলানো হবে।</p>
                
                <button 
                  onClick={handleFaceScan}
                  disabled={isScanning}
                  className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                >
                  {isScanning ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">photo_camera</span>}
                  {isScanning ? "Scanning..." : "Start Face Scan"}
                </button>
              </div>

              <div className="pt-4 flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-outline text-on-surface hover:bg-surface-variant rounded-lg font-bold transition-colors">
                  {t('register.previous')}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-fade-in">
              <span className="material-symbols-outlined text-[80px] text-success">check_circle</span>
              <h3 className="text-headline-md text-success font-bold">Verification Successful</h3>
              <p className="text-body-md text-on-surface-variant">আপনার এনআইডি এবং ফেস রিকগনিশন সফলভাবে ভেরিফাই করা হয়েছে। আপনার অ্যাকাউন্ট এখন সম্পূর্ণ সুরক্ষিত।</p>
              
              <button 
                onClick={handleComplete}
                className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors mt-6 flex justify-center items-center gap-2"
              >
                Go to Voter Dashboard <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
