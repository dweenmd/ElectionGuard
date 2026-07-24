import { Router } from "express";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get(["/", "/feed"], async (req: Request, res: Response) => {
  try {
    const { constituencyId } = req.query;

    const where =
      constituencyId && constituencyId !== "ALL"
        ? { OR: [{ constituencyId: String(constituencyId) }, { constituencyId: "ALL" }] }
        : {};

    const posts = await prisma.feedPost.findMany({ where, orderBy: { createdAt: "desc" } });

    res.json({ posts });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch feed" });
  }
});

router.post(["/", "/feed"], requireAuth, async (req: AuthRequest, res: Response) => {
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

    const newPost = await prisma.feedPost.create({
      data: {
        id: "post-" + Date.now(),
        type: type || "general",
        author: user.name,
        content,
        constituencyId: user.constituencyId,
        likes: 0,
      },
    });

    res.json({ success: true, post: newPost });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create feed post" });
  }
});

export default router;
