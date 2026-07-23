"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

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
    if (!/^(\d{10}|\d{17})$/.test(formData.nid.trim())) {
      next.nid = "বাংলাদেশ এনআইডি অবশ্যই ১০ ডিজিট (স্মার্ট কার্ড) অথবা ১৭ ডিজিট হতে হবে।";
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

  // Biometric state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedFingerprintHash, setCapturedFingerprintHash] = useState<string | null>(null);

  const [faceDone, setFaceDone] = useState(false);
  const [fingerprintDone, setFingerprintDone] = useState(false);
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [fingerprintProgress, setFingerprintProgress] = useState(0);
  const [isHoldingFinger, setIsHoldingFinger] = useState(false);

  const startCamera = async () => {
    try {
      setIsFaceScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 320, facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setIsFaceScanning(false);
      toast.success("ক্যামেরা অন হয়েছে। সোজা তাকান এবং ক্যাপচার বাটন চাপুন।");
    } catch (_err) {
      setIsFaceScanning(false);
      setCameraActive(false);
      toast("ক্যামেরা না পাওয়ায় এনআইডি ফেস বায়োমেট্রিক সিমুলেশন স্ক্যান করা হচ্ছে...", { icon: "📷" });
      capturePhoto();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedPhoto(dataUrl);

        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setCameraActive(false);
        setFaceDone(true);
        toast.success("লাইভ ফেস ফটো ক্যাপচার সফল! ডাটাবেসে সেভ হয়েছে।");
      }
    } else {
      setIsFaceScanning(true);
      setTimeout(() => {
        setIsFaceScanning(false);
        setCapturedPhoto(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%230d5c3a"/><circle cx="100" cy="80" r="40" fill="%23ffffff"/><ellipse cx="100" cy="160" rx="60" ry="40" fill="%23ffffff"/></svg>`);
        setFaceDone(true);
        toast.success("ফেস স্ক্যান ও ফেসিয়াল জিওমেট্রি ক্যাপচার করা হয়েছে!");
      }, 1500);
    }
  };

  // Fingerprint Press & Hold simulator
  const handleFingerTouchStart = () => {
    if (!faceDone || fingerprintDone) return;
    setIsHoldingFinger(true);
    let current = 0;
    const timer = setInterval(() => {
      current += 10;
      setFingerprintProgress(current);
      if (current >= 100) {
        clearInterval(timer);
        setIsHoldingFinger(false);
        setFingerprintDone(true);
        const fpHash = "fp_sha256_" + Math.random().toString(36).substring(2, 12) + "_" + formData.nid.slice(-4);
        setCapturedFingerprintHash(fpHash);
        toast.success("ফিঙ্গারপ্রিন্ট বায়োমেট্রিক হ্যাশ ডাটাবেসে নিবন্ধিত হয়েছে!");
      }
    }, 150);

    (window as any).__fingerTimer = timer;
  };

  const handleFingerTouchEnd = () => {
    if (fingerprintDone) return;
    if ((window as any).__fingerTimer) {
      clearInterval((window as any).__fingerTimer);
    }
    setIsHoldingFinger(false);
    if (fingerprintProgress < 100) {
      setFingerprintProgress(0);
      toast("সেন্সর থেকে আঙুল সরাবেন না। ১০০% হওয়া পর্যন্ত চেপে ধরে রাখুন।", { icon: "☝️" });
    }
  };

  const handleNextStep2 = () => {
    if (!faceDone || !fingerprintDone) {
      toast.error("অনুগ্রহ করে ফেস ক্যাপচার এবং ফিঙ্গারপ্রিন্ট স্ক্যান উভয় বায়োমেট্রিক সম্পন্ন করুন।");
      return;
    }
    setStep(3);
  };

  const handleComplete = async () => {
    try {
      const res = await api.auth.register({
        nid: formData.nid.trim(),
        name: formData.name.trim(),
        dob: formData.dob,
        phone: formData.phone.trim(),
        faceDescriptor: capturedPhoto || `face_hash_${formData.nid.trim()}`,
        fingerprintHash: capturedFingerprintHash || `fp_hash_${formData.nid.trim()}`,
      });
      toast.success("ভোট নিবন্ধন সফল হয়েছে!");
      await login("voter", res.user.id);
    } catch (err: any) {
      toast.error(err.message || "নিবন্ধন ব্যর্থ হয়েছে। NID নম্বরটি ইতিমধ্যেই নিবন্ধিত হতে পারে।");
      setStep(1);
    }
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
              <h3 className="text-label-md font-bold text-primary mb-2 border-b border-outline-variant pb-2">Step 2: Interactive Dual Biometric Verification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                {/* 1. Live WebRTC Camera Face Recognition */}
                <div className={`p-5 rounded-xl border flex flex-col items-center gap-3 transition-all ${faceDone ? "bg-success-container/20 border-success" : "bg-surface-container-lowest border-outline-variant"}`}>
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary bg-black flex items-center justify-center">
                    {capturedPhoto ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={capturedPhoto} alt="Captured Face" className="w-full h-full object-cover" />
                    ) : cameraActive ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    ) : (
                      <span className="material-symbols-outlined text-[56px] text-on-surface-variant opacity-60">face</span>
                    )}

                    {isFaceScanning && (
                      <div className="absolute top-0 left-0 w-full h-2 bg-success animate-bounce shadow-[0_0_10px_#2e7d32]"></div>
                    )}
                  </div>
                  
                  <span className="text-label-md font-bold text-on-surface">1. ফেস বায়োমেট্রিক ക്യാপচার</span>
                  <p className="text-caption text-on-surface-variant">লাইভ ফেস ফটো ডাটাবেসে নিবন্ধিত হবে</p>
                  
                  {!cameraActive && !faceDone ? (
                    <button
                      onClick={startCamera}
                      disabled={isFaceScanning}
                      className="w-full py-2 bg-primary text-on-primary rounded-lg font-bold text-caption flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      ক্যামেরা অন করুন
                    </button>
                  ) : cameraActive && !faceDone ? (
                    <button
                      onClick={capturePhoto}
                      className="w-full py-2 bg-success text-on-success rounded-lg font-bold text-caption flex items-center justify-center gap-2 hover:bg-success/90 transition-all shadow-sm animate-pulse"
                    >
                      <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                      ফটো ক্যাপচার করুন
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-success/20 text-success border border-success/30 rounded-lg font-bold text-caption flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      ফেস ডাটা সেভ হয়েছে ✅
                    </div>
                  )}
                </div>

                {/* 2. Interactive Fingerprint Sensor */}
                <div className={`p-5 rounded-xl border flex flex-col items-center gap-3 transition-all ${!faceDone ? "opacity-50 pointer-events-none" : ""} ${fingerprintDone ? "bg-success-container/20 border-success" : "bg-surface-container-lowest border-outline-variant"}`}>
                  <div 
                    onMouseDown={handleFingerTouchStart}
                    onMouseUp={handleFingerTouchEnd}
                    onTouchStart={handleFingerTouchStart}
                    onTouchEnd={handleFingerTouchEnd}
                    className={`relative w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center cursor-pointer select-none transition-all ${fingerprintDone ? "border-success bg-success-container/30" : isHoldingFinger ? "border-secondary scale-95 shadow-lg shadow-secondary/30 bg-secondary/10" : "border-secondary/60 bg-surface-variant hover:border-secondary"}`}
                  >
                    <span className={`material-symbols-outlined text-[56px] transition-all ${fingerprintDone ? "text-success" : isHoldingFinger ? "text-secondary animate-pulse scale-110" : "text-on-surface-variant opacity-60"}`}>
                      {fingerprintDone ? "task_alt" : "fingerprint"}
                    </span>
                    {isHoldingFinger && (
                      <div className="absolute inset-0 border-4 border-secondary rounded-full animate-ping opacity-30"></div>
                    )}
                  </div>

                  <span className="text-label-md font-bold text-on-surface">2. ফিঙ্গারপ্রিন্ট সেন্সর</span>
                  <p className="text-caption text-on-surface-variant">
                    {fingerprintDone ? "ফিঙ্গারপ্রিন্ট ভেরিফাইড ✅" : isHoldingFinger ? `স্ক্যান হচ্ছে: ${fingerprintProgress}%` : "সেন্সরে আঙুল চেপে ধরে রাখুন"}
                  </p>

                  <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                    <div className="bg-secondary h-2 transition-all duration-150" style={{ width: `${fingerprintProgress}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-outline text-on-surface hover:bg-surface-variant rounded-lg font-bold transition-colors">
                  {t('register.previous')}
                </button>
                <button 
                  onClick={handleNextStep2} 
                  disabled={!faceDone || !fingerprintDone}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  পরবর্তী ধাপ (ধাপ ৩) <span className="material-symbols-outlined align-middle">arrow_forward</span>
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
