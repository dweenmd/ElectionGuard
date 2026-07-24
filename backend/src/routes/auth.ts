import { Router } from "express";
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { encrypt, hmacIndex } from "../lib/crypto.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import type { AuthRequest, AuthPayload } from "../middleware/auth.js";

const router = Router();

const NID_REGEX = /^(\d{10}|\d{17})$/;

// Slows down brute-force NID guessing / Sybil-style account enumeration.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

router.post("/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const { nid = "", role = "voter" } = req.body as {
      nid?: string;
      role?: "voter" | "candidate" | "admin";
    };

    const trimmedNid = nid.trim();
    if (!trimmedNid || !NID_REGEX.test(trimmedNid)) {
      res.status(400).json({ error: "Invalid NID format. Bangladesh NID must be either 10 digits (Smart NID) or 17 digits." });
      return;
    }

    const nidHash = hmacIndex(trimmedNid);
    const foundUser = await prisma.user.findUnique({ where: { nidHash } });

    if (!foundUser) {
      res.status(401).json({ error: "Unauthorized: Invalid National ID number or account not registered in database." });
      return;
    }

    if (foundUser.role !== role) {
      res.status(403).json({ error: `Unauthorized: NID ${nid} is registered as ${foundUser.role.toUpperCase()}, not ${role.toUpperCase()}.` });
      return;
    }

    const payload: AuthPayload = {
      userId: foundUser.id,
      name: foundUser.name,
      role: foundUser.role,
      constituencyId: foundUser.constituencyId,
      constituencyName: foundUser.constituencyName,
    };

    const token = signToken(payload);

    res.json({
      token,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        role: foundUser.role,
        constituencyId: foundUser.constituencyId,
        constituencyName: foundUser.constituencyName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

router.post("/register", authLimiter, async (req: Request, res: Response) => {
  try {
    const {
      nid = "",
      name = "",
      constituencyId = "dhaka-10",
      faceDescriptor = "",
      fingerprintHash = "",
    } = req.body as {
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

    const nidHash = hmacIndex(trimmedNid);
    const existing = await prisma.user.findUnique({ where: { nidHash } });
    if (existing) {
      res.status(400).json({ error: `NID ${trimmedNid} is already registered in ElectionGuard database. Please login.` });
      return;
    }

    const constituencyName =
      constituencyId === "chittagong-01" ? "Chittagong-01" : constituencyId === "sylhet-01" ? "Sylhet-01" : "Dhaka-10";

    const newUser = await prisma.user.create({
      data: {
        id: "VTR-" + trimmedNid.slice(-4),
        nidHash,
        nidEncrypted: encrypt(trimmedNid),
        name: name.trim() || `Voter ${trimmedNid.slice(-4)}`,
        role: "voter",
        constituencyId,
        constituencyName,
        faceDescriptorEncrypted: encrypt(faceDescriptor || `face_hash_${trimmedNid}`),
        fingerprintHashEncrypted: encrypt(fingerprintHash || `fp_hash_${trimmedNid}`),
      },
    });

    const payload: AuthPayload = {
      userId: newUser.id,
      name: newUser.name,
      role: "voter",
      constituencyId: newUser.constituencyId,
      constituencyName: newUser.constituencyName,
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
