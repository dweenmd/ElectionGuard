import { Candidate } from "@/types/candidate";

// TODO(backend): এই array পরে /api/candidates থেকে আসবে।
export const mockCandidates: Candidate[] = [
  {
    id: "C001",
    translationKey: "candidatesData.c1",
    icon: "person",
    constituencyId: "dhaka-10",
    constituencyName: "Dhaka-10",
    docStatusKey: "verified",
    nominationStatusKey: "accepted",
    voteCount: 52340,
    manifestoFull:
      "১. দুর্নীতিমুক্ত ডিজিটাল সেবা নিশ্চিত করা।\n২. যুবসমাজের জন্য আইটি খাতে ১০,০০০ নতুন কর্মসংস্থান।\n৩. ঢাকা-১০ আসনের প্রতিটি ওয়ার্ডে ফ্রি ওয়াইফাই জোন।\n৪. স্বাস্থ্যসেবার মান উন্নয়ন এবং নতুন ২ টি হাসপাতাল নির্মাণ।",
  },
  {
    id: "C002",
    translationKey: "candidatesData.c2",
    icon: "person_4",
    constituencyId: "dhaka-10",
    constituencyName: "Dhaka-10",
    docStatusKey: "pending",
    nominationStatusKey: "underReview",
    voteCount: 18760,
    manifestoFull:
      "১. ঢাকা-১০ আসনের প্রতিটি পার্ক ও খালি জায়গায় বৃক্ষরোপণ কর্মসূচি।\n২. প্লাস্টিক দূষণ রোধে ওয়ার্ডভিত্তিক রিসাইক্লিং কেন্দ্র স্থাপন।\n৩. মেয়েদের স্কুলে বিনামূল্যে সাইকেল বিতরণ কর্মসূচি চালু।",
  },
  {
    id: "C003",
    translationKey: "candidatesData.c3",
    icon: "person_3",
    constituencyId: "dhaka-10",
    constituencyName: "Dhaka-10",
    docStatusKey: "verified",
    nominationStatusKey: "accepted",
    voteCount: 41200,
    manifestoFull:
      "১. এলাকার প্রতিটি খেলার মাঠ পুনরুদ্ধার ও সংরক্ষণ।\n২. ছোট ব্যবসায়ীদের জন্য সহজ শর্তে ক্ষুদ্রঋণের ব্যবস্থা।\n৩. যানজট নিরসনে নতুন ট্রাফিক ব্যবস্থাপনা পরিকল্পনা।",
  },
  {
    id: "C004",
    translationKey: "candidatesData.c4",
    icon: "person_2",
    constituencyId: "dhaka-5",
    constituencyName: "Dhaka-5",
    docStatusKey: "rejected",
    nominationStatusKey: "rejected",
    voteCount: 0,
    manifestoFull:
      "১. ঢাকা-৫ আসনে গণপরিবহন ব্যবস্থার আধুনিকীকরণ।\n২. স্থানীয় বাজারগুলোতে মূল্য নিয়ন্ত্রণ মনিটরিং কমিটি গঠন।",
  },
];

export function getCandidateById(id: string): Candidate | undefined {
  return mockCandidates.find((c) => c.id === id);
}

export function getCandidatesByConstituency(constituencyId: string): Candidate[] {
  return mockCandidates.filter((c) => c.constituencyId === constituencyId);
}
