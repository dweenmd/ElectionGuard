// TODO(backend): এই status আসলে backend-এর GET/POST /api/election/status endpoint-এ যাবে।
// এখন client-side demo হিসেবে localStorage ব্যবহার হচ্ছে, কারণ আগে isElectionStarted শুধু
// React state-এ ছিল — admin চালু করলেও voter/candidate অন্য ট্যাবে বা refresh করার পর সেটা
// দেখতে পেত না, যার কারণে ভোট দেওয়া "যাচ্ছে না" বলে মনে হচ্ছিল।

const KEY = "eg_election_started";
export const ELECTION_STATUS_EVENT = "eg-election-status-changed";

export function getElectionStatus(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "true";
  } catch (e) {
    console.error("Failed to read election status", e);
    return false;
  }
}

export function setElectionStatus(started: boolean): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, started ? "true" : "false");
      // 'storage' event browser নিজে থেকেই অন্য ট্যাবে পাঠায়, কিন্তু একই ট্যাবে পাঠায় না —
      // তাই একই ট্যাবের অন্য কম্পোনেন্টকে জানানোর জন্য এই custom event dispatch করা হচ্ছে
      window.dispatchEvent(new CustomEvent(ELECTION_STATUS_EVENT, { detail: started }));
    }
  } catch (e) {
    console.error("Failed to save election status", e);
  }
}
