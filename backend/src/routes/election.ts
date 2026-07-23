import { Router } from "express";
import type { Request, Response } from "express";
import { contract, contractReadOnly, getElectionStateName } from "../config/contract.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/config", async (_req: Request, res: Response) => {
  try {
    const electionName = await (contractReadOnly as any).electionName();
    const contractAddress =
      typeof contractReadOnly.target === "string"
        ? contractReadOnly.target
        : process.env["CONTRACT_ADDRESS"] || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    res.json({
      electionName,
      startDate: "2026-08-15T08:00:00+06:00",
      endDate: "2026-08-15T16:00:00+06:00",
      chainId: 1337,
      contractAddress,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch election config" });
  }
});

router.get("/status", async (_req: Request, res: Response) => {
  try {
    const state = await (contractReadOnly as any).state();
    const stateIndex = Number(state);
    const status = getElectionStateName(stateIndex);

    res.json({
      status,
      stateIndex,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch election status" });
  }
});

router.post(
  ["/status"],
  requireAuth,
  requireRole("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { action } = req.body as { action?: "start" | "end" };
      if (action !== "start" && action !== "end") {
        res.status(400).json({ error: "Invalid action. Must be 'start' or 'end'." });
        return;
      }

      let tx;
      if (action === "start") {
        tx = await (contract as any).startElection();
        await tx.wait();
      } else {
        tx = await (contract as any).endElection();
        await tx.wait();
      }

      res.json({
        success: true,
        action,
        txHash: tx.hash,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to update election status" });
    }
  }
);

export default router;
