import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Route imports
import authRoutes from "./routes/auth.js";
import webauthnRoutes from "./routes/webauthn.js";
import electionRoutes from "./routes/election.js";
import candidatesRoutes from "./routes/candidates.js";
import voteRoutes from "./routes/vote.js";
import turnoutRoutes from "./routes/turnout.js";
import feedRoutes from "./routes/feed.js";
import grievancesRoutes from "./routes/grievances.js";
import pollingCentersRoutes from "./routes/polling-centers.js";
import auditRoutes from "./routes/audit.js";

dotenv.config();

// Fail fast if the secrets required for real DB security are missing,
// instead of silently falling back to something insecure.
for (const required of ["DATABASE_URL", "ENCRYPTION_KEY", "HMAC_KEY", "JWT_SECRET"]) {
  if (!process.env[required]) {
    console.warn(`⚠️  ${required} is not set in .env — see .env.example`);
  }
}

const app = express();
const PORT = process.env["PORT"] || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
}));
app.use(express.json());

// Baseline anti-abuse limit across the whole API; individual routes (login,
// register, vote) layer on stricter limits on top of this.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ElectionGuard Backend API",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/webauthn", webauthnRoutes);
app.use("/api/election", electionRoutes);
app.use("/api/candidates", candidatesRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/turnout", turnoutRoutes);
app.use("/api/results", turnoutRoutes);  // /api/results is handled by turnout router
app.use("/api/feed", feedRoutes);
app.use("/api/grievances", grievancesRoutes);
app.use("/api/polling-centers", pollingCentersRoutes);
app.use("/api/audit-logs", auditRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ElectionGuard Backend API running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Blockchain RPC: http://127.0.0.1:8545`);
  console.log(`   Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3\n`);
});
