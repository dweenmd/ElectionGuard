import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/polling-centers
router.get("/", async (req, res) => {
  try {
    const { constituencyId } = req.query;

    const centers = await prisma.pollingCenter.findMany({
      where: constituencyId && constituencyId !== "ALL" ? { constituencyId: String(constituencyId) } : {},
    });

    res.json({ pollingCenters: centers });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch polling centers" });
  }
});

export default router;
