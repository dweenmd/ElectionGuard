"use client";
import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useTranslation } from "@/context/UIContext";
import toast from "react-hot-toast";

type VerifyStep = "start" | "nid" | "fingerprint" | "face" | "success";

export default function VerifyPage() {
  const [step, setStep] = useState<VerifyStep>("start");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Mock handlers
  const handleNidCheck = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("fingerprint");
      toast.success(t('verify.toastNid'));
    }, 2000);
  };

  const handleFingerprint = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("face");
      toast.success(t('verify.toastFingerprint'));
    }, 2500);
  };

  const handleFaceRec = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      toast.success(t('verify.toastFace'));
    }, 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col w-full md:ml-64 h-screen overflow-y-auto">
        <TopNav />
        <div className="flex-1 p-4 md:p-10 max-w-4xl mx-auto w-full flex flex-col items-center">
          
          <div className="text-center mb-8">
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('verify.title')}</h1>
            <p className="text-body-lg text-on-surface-variant">{t('verify.subtitle')}</p>
          </div>

          <div className="w-full bg-surface rounded-xl shadow-card border border-outline-variant p-6 md:p-10 min-h-[400px] flex flex-col">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-10 relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-surface-variant -z-10 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" 
                style={{ 
                  width: step === 'start' ? '0%' : 
                         step === 'nid' ? '0%' : 
                         step === 'fingerprint' ? '33%' : 
                         step === 'face' ? '66%' : '100%' 
                }}></div>
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step !== 'start' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>1</div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step === 'fingerprint' || step === 'face' || step === 'success' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>2</div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step === 'face' || step === 'success' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>3</div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step === 'success' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>4</div>
            </div>

            {/* STEP 1: START */}
            {step === "start" && (
              <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in gap-6">
                <span className="material-symbols-outlined text-[80px] text-primary">security</span>
                <div>
                  <h3 className="text-headline-md text-on-surface mb-2">{t('verify.startVerify')}</h3>
                  <p className="text-body-md text-on-surface-variant max-w-md">{t('verify.startDesc')}</p>
                </div>
                <button onClick={() => setStep("nid")} className="mt-4 px-8 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
                  {t('verify.startVerify')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}

            {/* STEP 2: NID */}
            {step === "nid" && (
              <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in gap-6">
                <span className="material-symbols-outlined text-[60px] text-secondary">badge</span>
                <div>
                  <h3 className="text-headline-md text-on-surface mb-2">{t('verify.nidCheck')}</h3>
                  <p className="text-body-md text-on-surface-variant max-w-md">{t('verify.nidDesc')}</p>
                </div>
                
                <div className="w-full max-w-xs mt-4">
                  <input type="text" value="8374920183" readOnly className="w-full bg-surface-container-lowest border border-outline rounded-lg p-3 text-center text-headline-md text-on-surface mb-4" />
                  <button 
                    onClick={handleNidCheck} 
                    disabled={loading}
                    className="w-full px-8 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : t('verify.checkDb')}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: FINGERPRINT */}
            {step === "fingerprint" && (
              <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in gap-6">
                <div className="relative">
                  <span className={`material-symbols-outlined text-[100px] ${loading ? 'text-primary animate-pulse' : 'text-on-surface-variant'}`}>fingerprint</span>
                  {loading && <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>}
                </div>
                <div>
                  <h3 className="text-headline-md text-on-surface mb-2">{t('verify.fingerprint')}</h3>
                  <p className="text-body-md text-on-surface-variant max-w-md">{t('verify.fingerprintDesc')}</p>
                </div>
                
                <div className="flex gap-4 mt-2">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant">{t('verify.lThumb')}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant">{t('verify.lIndex')}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant">{t('verify.rThumb')}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant">{t('verify.rIndex')}</div>
                  </div>
                </div>

                <button 
                  onClick={handleFingerprint} 
                  disabled={loading}
                  className="mt-4 px-8 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : t('verify.startScan')}
                </button>
              </div>
            )}

            {/* STEP 4: FACE RECOGNITION */}
            {step === "face" && (
              <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in gap-6">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[80px] text-on-surface-variant opacity-50">face</span>
                  {loading && (
                    <div className="absolute top-0 left-0 w-full h-2 bg-success animate-bounce shadow-[0_0_10px_#2e7d32]"></div>
                  )}
                  {/* Mock camera view */}
                  <div className="absolute inset-0 border-8 border-transparent border-t-primary border-b-primary rounded-full animate-spin opacity-20"></div>
                </div>
                
                <div>
                  <h3 className="text-headline-md text-on-surface mb-2">{t('verify.face')}</h3>
                  <p className="text-body-md text-on-surface-variant max-w-md">{t('verify.faceDesc')}</p>
                </div>
                
                <button 
                  onClick={handleFaceRec} 
                  disabled={loading}
                  className="mt-4 px-8 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <><span className="material-symbols-outlined">photo_camera</span> {t('verify.scanFace')}</>}
                </button>
              </div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === "success" && (
              <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in gap-6">
                <span className="material-symbols-outlined text-[100px] text-success">verified</span>
                <div>
                  <h3 className="text-headline-md text-success mb-2 font-bold">{t('verify.success')}</h3>
                  <p className="text-body-md text-on-surface-variant max-w-md">{t('verify.successDesc')}</p>
                </div>
                <Link href="/vote" className="mt-4 px-8 py-3 bg-success text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                  {t('verify.goToBallot')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}