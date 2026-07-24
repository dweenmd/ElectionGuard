import { Router } from "express";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get(["/", "/grievances"], requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const grievances = await prisma.grievance.findMany({
      where: user.role === "admin" ? {} : { voterId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ grievances });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch grievances" });
  }
});

router.post(["/", "/grievances"], requireAuth, async (req: AuthRequest, res: Response) => {
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

    const newGrievance = await prisma.grievance.create({
      data: {
        id: "GRV-" + Date.now(),
        voterId: user.userId,
        voterName: user.name,
        category,
        description,
        status: "open",
      },
    });

    res.json({ success: true, grievance: newGrievance });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit grievance" });
  }
});

router.patch(["/:id", "/grievances/:id"], requireAuth, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }

    const existing = await prisma.grievance.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Grievance not found" });
      return;
    }

    const grievance = await prisma.grievance.update({ where: { id }, data: { status } });

    res.json({ success: true, grievance });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update grievance" });
  }
});

export default router;
