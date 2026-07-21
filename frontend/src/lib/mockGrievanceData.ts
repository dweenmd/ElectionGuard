import { Grievance } from "@/types/grievance";

export const seedGrievances: Grievance[] = [
  {
    id: "g-1",
    voterId: "V789",
    voterName: "রহিম উদ্দিন",
    constituencyId: "dhaka-10",
    constituencyName: "Dhaka-10",
    category: "TECHNICAL",
    description: "আমার ভোটার আইডি দিয়ে লগইন করতে গিয়ে বারবার OTP আসছে না।",
    status: "REVIEWING",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];
