import { Router } from "express";
import type { Request, Response } from "express";
import { contract, contractReadOnly } from "../config/contract.js";
import { readJson } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

interface CandidateMeta {
  id: number;
  icon?: string;
  manifesto?: string;
  constituencyName?: string;
  [key: string]: any;
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rawCandidates = await (contractReadOnly as any).getAllCandidates();
    const metaList = readJson<CandidateMeta[]>("candidates-meta.json", []);

    const candidates = rawCandidates.map((c: any) => {
      const id = Number(c.id ?? c[0]);
      const meta = metaList.find((m) => Number(m.id) === id);
      return {
        id,
        name: c.name ?? c[1],
        party: c.party ?? c[2],
        voteCount: Number(c.voteCount ?? c[3]),
        ...(meta || {}),
      };
    });

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

    const c = await (contractReadOnly as any).getCandidate(candidateId);
    const metaList = readJson<CandidateMeta[]>("candidates-meta.json", []);
    const meta = metaList.find((m) => Number(m.id) === candidateId);

    const candidate = {
      id: Number(c[0] ?? c.id),
      name: c[1] ?? c.name,
      party: c[2] ?? c.party,
      voteCount: Number(c[3] ?? c.voteCount),
      ...(meta || {}),
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
