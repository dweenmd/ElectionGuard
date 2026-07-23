import { Router } from "express";
import type { Request, Response } from "express";
import { readJson, appendToJson } from "../config/db.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import type { AuthRequest, AuthPayload } from "../middleware/auth.js";

const router = Router();

const NID_REGEX = /^(\d{10}|\d{17})$/;

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

    const trimmedNid = nid.trim();
    if (trimmedNid && !NID_REGEX.test(trimmedNid)) {
      res.status(400).json({ error: "Invalid NID format. Bangladesh NID must be either 10 digits (Smart NID) or 17 digits." });
      return;
    }

    const users = readJson<UserRecord[]>("users.json", []);
    const foundUser = users.find((u) => u.nid === trimmedNid);

    if (!foundUser) {
      res.status(401).json({ error: "Unauthorized: Invalid National ID number or account not registered in database." });
      return;
    }

    if (foundUser.role && foundUser.role !== role) {
      res.status(403).json({ error: `Unauthorized: NID ${nid} is registered as ${foundUser.role.toUpperCase()}, not ${role.toUpperCase()}.` });
      return;
    }

    const user = {
      id: foundUser.id || foundUser.userId || `V-${trimmedNid.slice(-4)}`,
      name: foundUser.name || `User ${trimmedNid.slice(-4)}`,
      role: foundUser.role || role,
      constituencyId: foundUser.constituencyId || "dhaka-10",
      constituencyName: foundUser.constituencyName || "Dhaka-10",
    };

    const payload: AuthPayload = {
      userId: user.id,
      name: user.name,
      role: user.role,
      constituencyId: user.constituencyId,
      constituencyName: user.constituencyName,
    };

    const token = signToken(payload);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        constituencyId: user.constituencyId,
        constituencyName: user.constituencyName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

router.post("/register", (req: Request, res: Response) => {
  try {
    const { nid = "", name = "", constituencyId = "dhaka-10", faceDescriptor = "", fingerprintHash = "" } = req.body as {
      nid?: string;
      name?: string;
      constituencyId?: string;
      faceDescriptor?: string;
      fingerprintHash?: string;
    };

    const trimmedNid = nid.trim();
    if (!NID_REGEX.test(trimmedNid)) {
      res.status(400).json({ error: "Invalid NID format. Bangladesh NID must be either 10 digits (Smart NID) or 17 digits." });
      return;
    }

    const users = readJson<UserRecord[]>("users.json", []);
    const existing = users.find((u) => u.nid === trimmedNid);
    if (existing) {
      res.status(400).json({ error: `NID ${trimmedNid} is already registered in ElectionGuard database. Please login.` });
      return;
    }

    const newUser: UserRecord = {
      id: "VTR-" + trimmedNid.slice(-4),
      nid: trimmedNid,
      name: name.trim() || `Voter ${trimmedNid.slice(-4)}`,
      role: "voter",
      constituencyId,
      constituencyName: constituencyId === "chittagong-01" ? "Chittagong-01" : constituencyId === "sylhet-01" ? "Sylhet-01" : "Dhaka-10",
      faceDescriptor: faceDescriptor || `face_hash_${trimmedNid}`,
      fingerprintHash: fingerprintHash || `fp_hash_${trimmedNid}`,
    };

    appendToJson("users.json", newUser);

    const payload: AuthPayload = {
      userId: newUser.id!,
      name: newUser.name!,
      role: "voter",
      constituencyId: newUser.constituencyId!,
      constituencyName: newUser.constituencyName!,
    };

    const token = signToken(payload);

    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        role: "voter",
        constituencyId: newUser.constituencyId,
        constituencyName: newUser.constituencyName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

router.get("/verify", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
