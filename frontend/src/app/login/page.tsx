"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/UIContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [role, setRole] = useState<"voter" | "candidate" | "admin">("voter");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin" || role === "voter" || role === "candidate") {
      login(role);
    }
  };

  const handleForgot = (e: React.MouseEvent) => {
    e.preventDefault();
    toast("Forgot password functionality will be added when backend SMS/Email services are integrated.", { icon: "🚧" });
  };

  return (
    <div className="min-h-screen bg-surface-container flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
      <div className="absolute inset-0 bg-primary/5 backdrop-blur-[2px]"></div>
      
      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center gap-2 text-on-surface hover:text-primary transition-colors bg-surface/50 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant/50 shadow-sm hover:shadow">
        <span className="material-symbols-outlined text-xl">arrow_back</span>
        <span className="font-medium text-sm">{t('common.backToHome')}</span>
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 text-primary mb-6 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-4xl">how_to_vote</span>
          <span className="text-headline-lg font-bold tracking-tight">ElectionGuard</span>
        </Link>
        <h2 className="text-center text-headline-md text-on-surface">
          {t('login.title')}
        </h2>
        <p className="mt-2 text-center text-body-md text-on-surface-variant">
          {t('login.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface py-8 px-4 shadow-card border border-outline-variant sm:rounded-xl sm:px-10">
          
          {/* Role Tabs */}
          <div className="flex p-1 bg-surface-container-low rounded-lg mb-8">
            <button
              onClick={() => setRole("voter")}
              className={`flex-1 py-2 text-label-md font-bold rounded-md transition-colors ${role === "voter" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Voter
            </button>
            <button
              onClick={() => setRole("candidate")}
              className={`flex-1 py-2 text-label-md font-bold rounded-md transition-colors ${role === "candidate" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Candidate
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex-1 py-2 text-label-md font-bold rounded-md transition-colors ${role === "admin" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Admin
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nid" className="block text-label-md font-medium text-on-surface mb-2">
                {t('login.nid')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">badge</span>
                </div>
                <input
                  id="nid"
                  name="nid"
                  type="text"
                  required
                  className="block w-full pl-10 bg-surface-container-lowest border border-outline rounded-lg py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                  placeholder="e.g. 1982374012"
                  defaultValue="1982374012"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-label-md font-medium text-on-surface mb-2">
                {t('login.password')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 bg-surface-container-lowest border border-outline rounded-lg py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                  defaultValue="password123"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-outline rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-body-md text-on-surface-variant">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" onClick={handleForgot} className="font-bold text-primary hover:text-primary/80 transition-colors">
                  {t('login.forgotPassword')}
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-label-md font-bold text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                {t('login.signIn')}
              </button>
            </div>
            
            <div className="mt-4 text-center space-y-4">
              <p className="text-xs text-on-surface-variant bg-surface-variant/30 p-2 rounded border border-outline-variant/30">
                Demo Accounts: Any ID/Password will log you in based on the selected role tab.
              </p>
              <Link href="/register" className="block text-sm font-bold text-primary hover:underline">
                {t('login.newVoter')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
