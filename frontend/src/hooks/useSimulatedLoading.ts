"use client";
import { useEffect, useState } from "react";

// TODO(backend): real API call বসলে এই hook-এর দরকার থাকবে না -- সেই সময় fetch/React Query-র
// নিজস্ব isLoading state ব্যবহার হবে। এখন mock data instant থাকায় loading state দেখা যায় না,
// তাই ছোট একটা delay simulate করা হচ্ছে যাতে skeleton UI আসলে useful থাকে।
export function useSimulatedLoading(delayMs: number = 500) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);
  return isLoading;
}
