"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "@/locales/en";
import { bn } from "@/locales/bn";

const translations = { en, bn };
type NestedKeyOf<ObjectType extends object> = 
{[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
: `${Key}`
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof en>;

interface UIContextType {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  language: "bn" | "en";
  setLanguage: (lang: "bn" | "en") => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // localStorage থেকে ভাষা লোড করা হচ্ছে, না থাকলে 'bn' ডিফল্ট
  const [language, setLanguageState] = useState<"bn" | "en">("bn");

  useEffect(() => {
    const saved = localStorage.getItem("eg_language") as "bn" | "en" | null;
    if (saved === "en" || saved === "bn") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: "bn" | "en") => {
    setLanguageState(lang);
    localStorage.setItem("eg_language", lang);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <UIContext.Provider value={{ isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, language, setLanguage }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}

export function useTranslation() {
  const { language } = useUI();
  
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
  
  return { t, language };
}
