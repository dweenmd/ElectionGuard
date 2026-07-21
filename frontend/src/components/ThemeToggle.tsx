"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10"></div>; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-all shadow-sm hover:shadow"
      title="Toggle Dark Mode"
    >
      <span className="material-symbols-outlined text-[24px]">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
      {/* Tooltip hint */}
      <span className="absolute -bottom-8 whitespace-nowrap bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded opacity-0 transition-opacity hover:opacity-100 pointer-events-none hidden md:block">
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}
