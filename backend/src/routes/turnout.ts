import { Router } from "express";
import type { Request, Response } from "express";
import { contractReadOnly, getElectionStateName } from "../config/contract.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const DEFAULT_CANDIDATES = [
  { id: 1, name: "Dr. Shafiqur Rahman", party: "Green Wave Party", voteCount: 54200 },
  { id: 2, name: "Begum Rowshan Ara", party: "Sunrise Alliance", voteCount: 48150 },
  { id: 3, name: "Engineer Tanvir Ahmed", party: "River Forum", voteCount: 40153 },
];

const handleTurnout = async (_req: Request, res: Response) => {
  try {
    const voteCount = await prisma.voteRecord.count();
    let totalRegistered = 1020400;
    let totalVoted = 142503 + voteCount;

    try {
      const totalRegisteredRaw = await (contractReadOnly as any).totalRegisteredVoters();
      const totalVotesCastRaw = await (contractReadOnly as any).totalVotesCast();
      if (Number(totalRegisteredRaw) > 0) {
        totalRegistered = Number(totalRegisteredRaw);
        totalVoted = Number(totalVotesCastRaw);
      }
    } catch (_err) {
      // Contract offline fallback
    }

    const turnoutPercentage = totalRegistered > 0 ? Math.round((totalVoted / totalRegistered) * 100) : 0;
    const constituencies = await prisma.turnoutConstituency.findMany();

    res.json({ totalRegistered, totalVoted, turnoutPercentage, constituencies });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch turnout data" });
  }
};

const handleResults = async (_req: Request, res: Response) => {
  try {
    const statusRow = await prisma.electionStatus.findUnique({ where: { id: 1 } });
    let electionState = statusRow?.status || "Ongoing";
    let candidatesRaw: any[] = [];

    try {
      candidatesRaw = await (contractReadOnly as any).getAllCandidates();
      const stateRaw = await (contractReadOnly as any).state();
      electionState = getElectionStateName(Number(stateRaw));
    } catch (_err) {
      // Contract offline fallback
    }

    const baseCandidates = candidatesRaw.length > 0
      ? candidatesRaw.map((c: any) => ({
          id: Number(c.id ?? c[0]),
          name: c.name ?? c[1],
          party: c.party ?? c[2],
          voteCount: Number(c.voteCount ?? c[3]),
        }))
      : DEFAULT_CANDIDATES;

    const candidates = await Promise.all(
      baseCandidates.map(async (c) => {
        const votesFromDb = await prisma.voteRecord.count({ where: { candidateId: c.id } });
        return { ...c, voteCount: c.voteCount + votesFromDb };
      })
    );

    res.json({ electionState, candidates });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch election results" });
  }
};

router.get(["/turnout", "/api/turnout"], handleTurnout);
router.get(["/results", "/api/results"], handleResults);

router.get("/", (req: Request, res: Response) => {
  if (req.baseUrl.endsWith("/results")) {
    return handleResults(req, res);
  }
  return handleTurnout(req, res);
});

export default router;
