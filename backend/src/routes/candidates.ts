import { Router } from "express";
import type { Request, Response } from "express";
import { contract, contractReadOnly } from "../config/contract.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

const DEFAULT_CANDIDATES = [
  { id: 1, name: "Dr. Shafiqur Rahman", party: "Green Wave Party", voteCount: 54200, manifesto: "Eco-friendly policies and clean energy transitions.", constituencyName: "Dhaka-10" },
  { id: 2, name: "Begum Rowshan Ara", party: "Sunrise Alliance", voteCount: 48150, manifesto: "Economic revitalization and job creation for youth.", constituencyName: "Chittagong-01" },
  { id: 3, name: "Engineer Tanvir Ahmed", party: "River Forum", voteCount: 40153, manifesto: "Water management and agricultural development.", constituencyName: "Sylhet-01" },
];

router.get("/", async (_req: Request, res: Response) => {
  try {
    let rawCandidates: any[] = [];
    try {
      rawCandidates = await (contractReadOnly as any).getAllCandidates();
    } catch (_err) {
      // Contract call failed, fallback
    }

    const metaList = await prisma.candidateMeta.findMany();

    const baseList = rawCandidates && rawCandidates.length > 0
      ? rawCandidates.map((c: any) => ({
          id: Number(c.id ?? c[0]),
          name: c.name ?? c[1],
          party: c.party ?? c[2],
          voteCount: Number(c.voteCount ?? c[3]),
        }))
      : DEFAULT_CANDIDATES;

    const candidates = await Promise.all(
      baseList.map(async (c) => {
        const votesFromDb = await prisma.voteRecord.count({ where: { candidateId: c.id } });
        const meta = metaList.find((m) => m.id === c.id);
        return {
          ...c,
          voteCount: c.voteCount + votesFromDb,
          ...(meta
            ? { icon: meta.icon ?? undefined, manifesto: meta.manifesto ?? (c as any).manifesto, constituencyName: meta.constituencyName ?? (c as any).constituencyName, ...(typeof meta.extra === "object" && meta.extra ? meta.extra : {}) }
            : {}),
        };
      })
    );

    res.json({ candidates });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch candidates" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const candidateId = Number(req.params.id);
    if (isNaN(candidateId)) {
      res.status(400).json({ error: "Invalid candidate ID" });
      return;
    }

    let c: any = null;
    try {
      c = await (contractReadOnly as any).getCandidate(candidateId);
    } catch (_err) {
      // Fallback
    }

    const meta = await prisma.candidateMeta.findUnique({ where: { id: candidateId } });

    const baseCandidate = c
      ? {
          id: Number(c[0] ?? c.id),
          name: c[1] ?? c.name,
          party: c[2] ?? c.party,
          voteCount: Number(c[3] ?? c.voteCount),
        }
      : DEFAULT_CANDIDATES.find((dc) => dc.id === candidateId) || {
          id: candidateId,
          name: `Candidate #${candidateId}`,
          party: "IND",
          voteCount: 0,
        };

    const votesFromDb = await prisma.voteRecord.count({ where: { candidateId } });

    const candidate = {
      ...baseCandidate,
      voteCount: baseCandidate.voteCount + votesFromDb,
      ...(meta
        ? { icon: meta.icon ?? undefined, manifesto: meta.manifesto ?? (baseCandidate as any).manifesto, constituencyName: meta.constituencyName ?? (baseCandidate as any).constituencyName, ...(typeof meta.extra === "object" && meta.extra ? meta.extra : {}) }
        : {}),
    };

    res.json({ candidate });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch candidate" });
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, party } = req.body as { name?: string; party?: string };
      if (!name || !party) {
        res.status(400).json({ error: "Name and party are required" });
        return;
      }

      const tx = await (contract as any).addCandidate(name, party);
      await tx.wait();

      res.json({ success: true, txHash: tx.hash });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to add candidate" });
    }
  }
);

export default router;
