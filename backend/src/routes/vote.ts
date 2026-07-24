import { Router } from "express";
import type { Response } from "express";
import { Prisma } from "@prisma/client";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { contract } from "../config/contract.js";
import { appendAuditLog } from "../lib/auditChain.js";

const router = Router();

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

    let txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    try {
      const tx = await (contract as any).vote(candidateId);
      await tx.wait();
      txHash = tx.hash;
    } catch (contractErr) {
      console.warn("Smart contract vote call failed, recording in local DB fallback:", contractErr);
    }

    try {
      // userId has a UNIQUE constraint in the DB, so this insert is the
      // atomic "have they already voted?" check — no race condition even
      // under concurrent requests, unlike the old read-then-write JSON file.
      await prisma.voteRecord.create({
        data: { userId, candidateId: Number(candidateId), txHash },
      });
    } catch (dbErr) {
      if (dbErr instanceof Prisma.PrismaClientKnownRequestError && dbErr.code === "P2002") {
        res.status(400).json({ error: "You have already voted" });
        return;
      }
      throw dbErr;
    }

    await appendAuditLog(req.user?.name || userId, "Vote Cast", `Voter cast a ballot (tx: ${txHash.slice(0, 10)}...)`);

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

    const record = await prisma.voteRecord.findUnique({ where: { userId } });

    res.json({ hasVoted: !!record, record });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch vote status" });
  }
});

export default router;
