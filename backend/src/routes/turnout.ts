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

const DEFAULT_CANDIDATES = [
  { id: 1, name: "Dr. Shafiqur Rahman", party: "Green Wave Party", voteCount: 54200 },
  { id: 2, name: "Begum Rowshan Ara", party: "Sunrise Alliance", voteCount: 48150 },
  { id: 3, name: "Engineer Tanvir Ahmed", party: "River Forum", voteCount: 40153 },
];

const handleTurnout = async (_req: Request, res: Response) => {
  try {
    const voteRecords = readJson<any[]>("vote-records.json", []);
    let totalRegistered = 1020400;
    let totalVoted = 142503 + voteRecords.length;

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
    const statusFile = readJson<{ status: string }>("election-status.json", { status: "Ongoing" });
    let electionState = statusFile.status;
    let candidatesRaw: any[] = [];

    try {
      candidatesRaw = await (contractReadOnly as any).getAllCandidates();
      const stateRaw = await (contractReadOnly as any).state();
      electionState = getElectionStateName(Number(stateRaw));
    } catch (_err) {
      // Contract offline fallback
    }

    const voteRecords = readJson<any[]>("vote-records.json", []);
    const baseCandidates = candidatesRaw.length > 0
      ? candidatesRaw.map((c: any) => ({
          id: Number(c.id ?? c[0]),
          name: c.name ?? c[1],
          party: c.party ?? c[2],
          voteCount: Number(c.voteCount ?? c[3]),
        }))
      : DEFAULT_CANDIDATES;

    const candidates: Candidate[] = baseCandidates.map((c) => {
      const votesFromDb = voteRecords.filter((r) => Number(r.candidateId) === Number(c.id)).length;
      return {
        ...c,
        voteCount: c.voteCount + votesFromDb,
      };
    });

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
