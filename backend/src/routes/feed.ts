import { Router } from "express";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { readJson, writeJson } from "../config/db.js";

const router = Router();

interface FeedPost {
  id: string;
  type: string;
  author: string;
  content: string;
  constituencyId: string;
  likes: number;
  createdAt: string;
}

const defaultPosts: FeedPost[] = [
  {
    id: "post-1",
    type: "ec_notice",
    author: "Election Commission",
    content: "Voting will begin on August 15, 2026 at 8:00 AM. All registered voters must bring valid NID.",
    constituencyId: "ALL",
    likes: 245,
    createdAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "post-2",
    type: "campaign",
    author: "Green Wave Party",
    content: "Our commitment to sustainable development continues. Vote for change!",
    constituencyId: "dhaka-10",
    likes: 89,
    createdAt: "2026-08-12T14:30:00Z",
  },
  {
    id: "post-3",
    type: "ec_notice",
    author: "Election Commission",
    content: "Polling centers open list has been published. Check your assigned center.",
    constituencyId: "ALL",
    likes: 178,
    createdAt: "2026-08-13T09:15:00Z",
  },
];

router.get(["/", "/feed"], (req: Request, res: Response) => {
  try {
    const { constituencyId } = req.query;
    const posts = readJson<FeedPost[]>("feed.json", defaultPosts);

    const filtered =
      constituencyId && constituencyId !== "ALL"
        ? posts.filter((p) => p.constituencyId === constituencyId || p.constituencyId === "ALL")
        : posts;

    res.json({ posts: filtered });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch feed" });
  }
});

router.post(["/", "/feed"], requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { content, type } = req.body;
    if (!content) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const newPost: FeedPost = {
      id: "post-" + Date.now(),
      type: type || "general",
      author: user.name,
      content,
      constituencyId: user.constituencyId,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    const posts = readJson<FeedPost[]>("feed.json", defaultPosts);
    posts.unshift(newPost);
    writeJson("feed.json", posts);

    res.json({ success: true, post: newPost });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create feed post" });
  }
});

export default router;
