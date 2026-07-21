// এই ফাইলের shape গুলো ইচ্ছাকৃতভাবে এমনভাবে বানানো হয়েছে যাতে backend আসলে
// শুধু data-source বদলাতে হবে (mock context -> API fetch), UI/component
// কোনোটাই বদলাতে হবে না।

export type PostType = "EC_NOTICE" | "CANDIDATE_POST";
export type PostStatus = "PUBLISHED" | "REMOVED";
export type CommentStatus = "VISIBLE" | "HIDDEN";

export interface FeedAuthor {
  id: string;
  name: string;
  role: "admin" | "candidate" | "voter";
  party?: string;
  constituencyName?: string;
}

export interface FeedComment {
  id: string;
  postId: string;
  author: FeedAuthor;
  body: string;
  createdAt: string; // ISO string
  status: CommentStatus;
  reportCount: number;
}

export interface FeedPost {
  id: string;
  type: PostType;
  author: FeedAuthor;
  // EC_NOTICE হলে constituencyId থাকবে না (সবার জন্য visible)।
  // CANDIDATE_POST হলে অবশ্যই থাকবে -- server-side filtering এইটার উপর ভিত্তি করেই হয়।
  constituencyId?: string;
  constituencyName?: string;
  title: string;
  body: string;
  pinned: boolean;
  status: PostStatus;
  createdAt: string;
  likedBy: string[]; // user ids -- demo purpose; backend হলে আলাদা table
  reportCount: number;
}

// নতুন পোস্ট বানানোর জন্য input shape -- server-এ session থেকে author/constituency
// বসবে, client থেকে কখনো নেয়া হবে না।
export interface NewPostInput {
  title: string;
  body: string;
  pinned?: boolean;
}

export interface NewCommentInput {
  postId: string;
  body: string;
}
