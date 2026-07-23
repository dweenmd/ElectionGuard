// TODO(backend): এই vote record আসলে backend-এর POST /api/vote endpoint-এ যাবে এবং
// server-side এ userId ভিত্তিক "already voted" check হবে। এখানে শুধু client-side demo
// persistence রাখা হয়েছে যাতে refresh করলেও একজন ভোটার দ্বিতীয়বার ভোট দিতে না পারে।

export interface VoteRecord {
  candidateId: string;
  votedAt: string; // ISO timestamp
}

const KEY_PREFIX = "eg_vote_record_"; // + userId

export function getVoteRecord(userId: string): VoteRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(KEY_PREFIX + userId);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Failed to load vote record", e);
    return null;
  }
}

export function recordVote(userId: string, candidateId: string): VoteRecord {
  const record: VoteRecord = { candidateId, votedAt: new Date().toISOString() };
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(record));
    }
  } catch (e) {
    console.error("Failed to save vote record", e);
  }
  return record;
}
