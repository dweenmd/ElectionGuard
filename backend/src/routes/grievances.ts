import { Router } from "express";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { readJson, writeJson } from "../config/db.js";

const router = Router();

interface Grievance {
  id: string;
  voterId: string;
  voterName: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
}

const defaultGrievances: Grievance[] = [
  {
    id: "GRV-001",
    voterId: "V789",
    voterName: "Rahim Uddin",
    category: "Polling Center Issue",
    description: "Long queue at Dhaka-10 center",
    status: "open",
    createdAt: "2026-08-15T09:30:00Z",
  },
];

router.get(["/", "/grievances"], requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const grievances = readJson<Grievance[]>("grievances.json", defaultGrievances);

    const result =
      user.role === "admin"
        ? grievances
        : grievances.filter((g) => g.voterId === user.userId);

    res.json({ grievances: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch grievances" });
  }
});

router.post(["/", "/grievances"], requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { category, description } = req.body;
    if (!category || !description) {
      res.status(400).json({ error: "Category and description are required" });
      return;
    }

    const newGrievance: Grievance = {
      id: "GRV-" + Date.now(),
      voterId: user.userId,
      voterName: user.name,
      category,
      description,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    const grievances = readJson<Grievance[]>("grievances.json", defaultGrievances);
    grievances.unshift(newGrievance);
    writeJson("grievances.json", grievances);

    res.json({ success: true, grievance: newGrievance });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit grievance" });
  }
});

router.patch(["/:id", "/grievances/:id"], requireAuth, requireRole("admin"), (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }

    const grievances = readJson<Grievance[]>("grievances.json", defaultGrievances);
    const grievance = grievances.find((g) => g.id === id);

    if (!grievance) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    grievance.status = status;
    writeJson("grievances.json", grievances);

    res.json({ success: true, grievance });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update grievance" });
  }
});

export default router;
