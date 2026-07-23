import { Router } from "express";
import { readJson, writeJson } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  details: string;
  createdAt: string;
}

// GET /api/audit-logs
router.get("/", requireAuth, (req: AuthRequest, res) => {
  try {
    const entries = readJson<AuditEntry[]>("audit.json", []);
    res.json({ entries });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch audit logs" });
  }
});

// POST /api/audit-logs
router.post("/", requireAuth, (req: AuthRequest, res) => {
  try {
    const { action, details } = req.body as { action?: string; details?: string };
    if (!action) {
      res.status(400).json({ error: "Action is required" });
      return;
    }

    const entry: AuditEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actor: req.user?.name || "Unknown",
      action,
      details: details || "",
      createdAt: new Date().toISOString(),
    };

    const existing = readJson<AuditEntry[]>("audit.json", []);
    existing.unshift(entry);
    // Keep max 500 entries
    writeJson("audit.json", existing.slice(0, 500));

    res.json({ success: true, entry });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to log action" });
  }
});

export default router;
