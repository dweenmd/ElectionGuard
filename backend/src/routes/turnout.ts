import { Router } from "express";
import type { Request, Response } from "express";
import { contractReadOnly, getElectionStateName } from "../config/contract.js";
import { readJson } from "../config/db.js";

const router = Router();

interface ConstituencyTurnout {
  constituencyId: string;
  constituencyName: string;
  registered: number;
  voted: number;
}

interface Candidate {
  id: number;
  name: string;
  party: string;
  voteCount: number;
}

const defaultTurnoutData: ConstituencyTurnout[] = [
  { constituencyId: "dhaka-10", constituencyName: "Dhaka-10", registered: 125000, voted: 98750 },
  { constituencyId: "chittagong-01", constituencyName: "Chittagong-01", registered: 98000, voted: 76440 },
  { constituencyId: "sylhet-01", constituencyName: "Sylhet-01", registered: 67000, voted: 46230 },
];

const handleTurnout = async (_req: Request, res: Response) => {
  try {
    const totalRegisteredRaw = await (contractReadOnly as any).totalRegisteredVoters();
    const totalVotesCastRaw = await (contractReadOnly as any).totalVotesCast();

    const totalRegistered = Number(totalRegisteredRaw);
    const totalVoted = Number(totalVotesCastRaw);
    const turnoutPercentage = totalRegistered > 0 ? Math.round((totalVoted / totalRegistered) * 100) : 0;

    const constituencies = readJson<ConstituencyTurnout[]>("turnout-data.json", defaultTurnoutData);

    res.json({
      totalRegistered,
      totalVoted,
      turnoutPercentage,
      constituencies,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch turnout data" });
  }
};

const handleResults = async (_req: Request, res: Response) => {
  try {
    const candidatesRaw = await (contractReadOnly as any).getAllCandidates();
    const stateRaw = await (contractReadOnly as any).state();

    const candidates: Candidate[] = candidatesRaw.map((c: any) => ({
      id: Number(c.id),
      name: c.name,
      party: c.party,
      voteCount: Number(c.voteCount),
    }));

    const electionState = getElectionStateName(Number(stateRaw));

    res.json({
      electionState,
      candidates,
    });
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
