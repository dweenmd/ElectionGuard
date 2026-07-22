export interface LoginHistoryEntry {
  timestamp: string;
  device: string;
}

const KEY = "eg_login_history";

function detectDevice(): string {
  if (typeof navigator === "undefined") return "Unknown device";
  const ua = navigator.userAgent;
  const browser = /Edg/.test(ua) ? "Edge" : /Chrome/.test(ua) ? "Chrome" : /Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  return `${browser} on ${os}`;
}

export function recordLogin() {
  if (typeof window === "undefined") return;
  try {
    const existing: LoginHistoryEntry[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const entry: LoginHistoryEntry = { timestamp: new Date().toISOString(), device: detectDevice() };
    const updated = [entry, ...existing].slice(0, 10);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to record login history", e);
  }
}

export function getLoginHistory(): LoginHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    console.error("Failed to read login history", e);
    return [];
  }
}
