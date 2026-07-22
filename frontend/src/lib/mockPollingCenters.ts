export interface PollingCenter {
  id: string;
  name: string;
  address: string;
  constituencyId: string;
  lat: number;
  lng: number;
  capacity: number;
}

export const mockPollingCenters: PollingCenter[] = [
  { id: "pc-1", name: "ধানমন্ডি সরকারি বালিকা উচ্চ বিদ্যালয়", address: "ধানমন্ডি ২৭, ঢাকা-১০", constituencyId: "dhaka-10", lat: 23.7461, lng: 90.3742, capacity: 1200 },
  { id: "pc-2", name: "কলাবাগান মাঠ কেন্দ্র", address: "কলাবাগান, ঢাকা-১০", constituencyId: "dhaka-10", lat: 23.7495, lng: 90.3838, capacity: 950 },
  { id: "pc-3", name: "জিগাতলা উচ্চ বিদ্যালয়", address: "জিগাতলা, ঢাকা-১০", constituencyId: "dhaka-10", lat: 23.7368, lng: 90.3782, capacity: 800 },
  { id: "pc-4", name: "মিরপুর ১০ কমিউনিটি সেন্টার", address: "মিরপুর ১০, ঢাকা-৫", constituencyId: "dhaka-5", lat: 23.8069, lng: 90.3687, capacity: 1100 },
];

export function getPollingCentersByConstituency(constituencyId: string): PollingCenter[] {
  return mockPollingCenters.filter((c) => c.constituencyId === constituencyId);
}
