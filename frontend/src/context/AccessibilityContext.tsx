"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type FontScale = 100 | 115 | 130;

interface AccessibilityContextType {
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);
const KEY = "eg_accessibility";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScale>(100);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fontScale) setFontScaleState(parsed.fontScale);
        if (parsed.highContrast) setHighContrast(parsed.highContrast);
      }
    } catch (e) {
      console.error("Failed to load accessibility settings", e);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("a11y-scale-115", "a11y-scale-130");
    if (fontScale === 115) html.classList.add("a11y-scale-115");
    if (fontScale === 130) html.classList.add("a11y-scale-130");
    html.classList.toggle("high-contrast", highContrast);
    localStorage.setItem(KEY, JSON.stringify({ fontScale, highContrast }));
  }, [fontScale, highContrast]);

  const setFontScale = (scale: FontScale) => setFontScaleState(scale);
  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  return (
    <AccessibilityContext.Provider value={{ fontScale, setFontScale, highContrast, toggleHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) throw new Error("useAccessibility must be used within an AccessibilityProvider");
  return context;
}
