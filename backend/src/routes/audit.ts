import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { appendAuditLog, verifyAuditChain } from "../lib/auditChain.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/audit-logs
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const entries = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    res.json({ entries });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch audit logs" });
  }
});

// POST /api/audit-logs
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { action, details } = req.body as { action?: string; details?: string };
    if (!action) {
      res.status(400).json({ error: "Action is required" });
      return;
    }

    const entry = await appendAuditLog(req.user?.name || "Unknown", action, details || "");

    res.json({ success: true, entry });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to log action" });
  }
});

// GET /api/audit-logs/verify - admin-only tamper check of the hash chain
router.get("/verify", requireAuth, requireRole("admin"), async (_req: AuthRequest, res) => {
  try {
    const result = await verifyAuditChain();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to verify audit chain" });
  }
});

export default router;
