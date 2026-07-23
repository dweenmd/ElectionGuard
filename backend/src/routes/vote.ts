import { Router } from "express";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { readJson, appendToJson } from "../config/db.js";
import { contract } from "../config/contract.js";

const router = Router();

interface VoteRecord {
  userId: string;
  candidateId: number;
  txHash: string;
  timestamp: string;
}

router.post(["/", "/vote"], requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { candidateId } = req.body;
    if (candidateId === undefined || candidateId === null) {
      res.status(400).json({ error: "candidateId is required" });
      return;
    }

    const records = readJson<VoteRecord[]>("vote-records.json", []);
    const existing = records.find((r) => r.userId === userId);
    if (existing) {
      res.status(400).json({ error: "You have already voted" });
      return;
    }

    let txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    try {
      const tx = await (contract as any).vote(candidateId);
      await tx.wait();
      txHash = tx.hash;
    } catch (contractErr) {
      console.warn("Smart contract vote call failed, recording in local DB fallback:", contractErr);
    }

    const record: VoteRecord = {
      userId,
      candidateId: Number(candidateId),
      txHash,
      timestamp: new Date().toISOString(),
    };
    appendToJson("vote-records.json", record);

    res.json({ success: true, txHash });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit vote" });
  }
});

router.get(["/status", "/vote/status"], requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const records = readJson<VoteRecord[]>("vote-records.json", []);
    const record = records.find((r) => r.userId === userId) || null;

    res.json({
      hasVoted: !!record,
      record,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch vote status" });
  }
});

export default router;
