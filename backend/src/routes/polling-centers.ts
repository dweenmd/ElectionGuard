import { Router } from "express";
import { readJson, writeJson } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

interface PollingCenter {
  id: string;
  name: string;
  address: string;
  constituencyId: string;
  constituencyName: string;
  lat: number;
  lng: number;
  capacity: number;
  status: "active" | "inactive";
}

const defaultCenters: PollingCenter[] = [
  { id: "PC-001", name: "Dhaka City College Center", address: "Dhanmondi, Dhaka", constituencyId: "dhaka-10", constituencyName: "Dhaka-10", lat: 23.7392, lng: 90.3809, capacity: 5000, status: "active" },
  { id: "PC-002", name: "Motijheel Govt. Primary School", address: "Motijheel, Dhaka", constituencyId: "dhaka-10", constituencyName: "Dhaka-10", lat: 23.7330, lng: 90.4170, capacity: 3500, status: "active" },
  { id: "PC-003", name: "Chittagong Collegiate School", address: "Kotwali, Chittagong", constituencyId: "chittagong-01", constituencyName: "Chittagong-01", lat: 22.3365, lng: 91.8326, capacity: 4200, status: "active" },
  { id: "PC-004", name: "Sylhet MC College Center", address: "Tilagarh, Sylhet", constituencyId: "sylhet-01", constituencyName: "Sylhet-01", lat: 24.8949, lng: 91.8687, capacity: 3800, status: "active" },
  { id: "PC-005", name: "Rajshahi University Center", address: "Rajshahi Sadar", constituencyId: "rajshahi-02", constituencyName: "Rajshahi-02", lat: 24.3746, lng: 88.6340, capacity: 4500, status: "active" },
];

// GET /api/polling-centers
router.get("/", (req, res) => {
  try {
    const centers = readJson<PollingCenter[]>("polling-centers.json", defaultCenters);
    const { constituencyId } = req.query;

    const filtered = constituencyId && constituencyId !== "ALL"
      ? centers.filter((c) => c.constituencyId === constituencyId)
      : centers;

    res.json({ pollingCenters: filtered });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch polling centers" });
  }
});

export default router;
