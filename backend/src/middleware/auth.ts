import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "electionguard-dev-secret-2026";

export interface AuthPayload {
  userId: string;
  name: string;
  role: "voter" | "candidate" | "admin";
  constituencyId: string;
  constituencyName: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

/**
 * Middleware: Require a valid JWT in the Authorization header.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  try {
    const token = header.slice(7);
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware factory: Require a specific role.
 */
export function requireRole(...roles: AuthPayload["role"][]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `Requires role: ${roles.join(" or ")}` });
      return;
    }
    next();
  };
}
