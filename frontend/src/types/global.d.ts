// MetaMask (এবং অন্য EIP-1193 compatible wallet) window.ethereum ইনজেক্ট করে,
// কিন্তু এর জন্য কোনো official global type declaration নেই -- তাই TypeScript এটা চেনে না।
// এই ফাইলটা শুধু সেই gap পূরণ করছে, Web3Context.tsx-এর প্রতিটা window.ethereum ব্যবহার
// এতদিন type error দিচ্ছিল।
export {};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}
