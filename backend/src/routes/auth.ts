import { Router } from "express";
import type { Request, Response } from "express";
import { readJson } from "../config/db.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import type { AuthRequest, AuthPayload } from "../middleware/auth.js";

const router = Router();

interface UserRecord {
  nid?: string;
  id?: string;
  userId?: string;
  name?: string;
  constituencyId?: string;
  constituencyName?: string;
  role?: "voter" | "candidate" | "admin";
}

router.post("/login", (req: Request, res: Response) => {
  try {
    const { nid = "", role = "voter" } = req.body as {
      nid?: string;
      role?: "voter" | "candidate" | "admin";
    };

    const users = readJson<UserRecord[]>("users.json", []);
    const foundUser = users.find((u) => u.nid === nid);

    let user: {
      id: string;
      name: string;
      constituencyId: string;
      constituencyName: string;
    };

    if (foundUser) {
      user = {
        id: foundUser.id || foundUser.userId || `V-${nid.slice(-4)}`,
        name: foundUser.name || `User ${nid.slice(-4)}`,
        constituencyId: foundUser.constituencyId || "dhaka-10",
        constituencyName: foundUser.constituencyName || "Dhaka-10",
      };
    } else {
      const last4 = nid.length >= 4 ? nid.slice(-4) : "0000";
      if (role === "admin") {
        user = {
          id: "A123",
          name: "Election Officer",
          constituencyId: "ALL",
          constituencyName: "All Constituencies",
        };
      } else if (role === "candidate") {
        user = {
          id: "C001",
          name: "Anisur Rahman",
          constituencyId: "dhaka-10",
          constituencyName: "Dhaka-10",
        };
      } else {
        user = {
          id: "V-" + last4,
          name: "Voter " + last4,
          constituencyId: "dhaka-10",
          constituencyName: "Dhaka-10",
        };
      }
    }

    const payload: AuthPayload = {
      userId: user.id,
      name: user.name,
      role,
      constituencyId: user.constituencyId,
      constituencyName: user.constituencyName,
    };

    const token = signToken(payload);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role,
        constituencyId: user.constituencyId,
        constituencyName: user.constituencyName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

router.get("/verify", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
