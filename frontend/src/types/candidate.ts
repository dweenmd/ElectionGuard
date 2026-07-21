export type DocStatusKey = "verified" | "pending" | "rejected";
export type NominationStatusKey = "accepted" | "underReview" | "rejected";

export interface Candidate {
  id: string; // AuthContext-এর mock candidate user.id এর সাথে মিলবে যদি এটাই লগইন করা candidate হয়
  // display name/party/quote লোকেল ফাইলে (bn.ts/en.ts -> candidatesData) ভাষাভিত্তিক রাখা আছে,
  // এখানে শুধু সেই key-টা রাখা হচ্ছে যাতে ডুপ্লিকেট না হয়
  translationKey: string; // e.g. "candidatesData.c1"
  icon: string; // material symbol, avatar placeholder হিসেবে ব্যবহৃত
  constituencyId: string;
  constituencyName: string;
  docStatusKey: DocStatusKey;
  nominationStatusKey: NominationStatusKey;
  manifestoFull: string; // বিস্তারিত ইশতেহার (আপাতত বাংলায়, বিদ্যমান app-এর প্যাটার্ন অনুসরণ করে)
  voteCount: number; // TODO(backend): এটা আসবে on-chain vote tally থেকে, এখানে শুধু ডেমো সংখ্যা
}
