/**
 * One-time data migration: ports the sample data that used to live in
 * backend/src/data/*.json and in various route files' hardcoded fallback
 * arrays into the real Postgres database.
 *
 * Run with: npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { encrypt, hmacIndex } from "../src/lib/crypto.js";
import { appendAuditLog } from "../src/lib/auditChain.js";

const prisma = new PrismaClient();

const USERS = [
  { id: "ADM-1001", nid: "1000000001", name: "Mohammad Tariqul Islam", role: "admin", constituencyId: "ALL", constituencyName: "All Constituencies" },
  { id: "CND-001", nid: "2000000001", name: "Dr. Shafiqur Rahman", role: "candidate", party: "Green Wave Party", constituencyId: "dhaka-10", constituencyName: "Dhaka-10" },
  { id: "CND-002", nid: "2000000002", name: "Begum Rowshan Ara", role: "candidate", party: "Sunrise Alliance", constituencyId: "chittagong-01", constituencyName: "Chittagong-01" },
  { id: "CND-003", nid: "2000000003", name: "Engineer Tanvir Ahmed", role: "candidate", party: "River Forum", constituencyId: "sylhet-01", constituencyName: "Sylhet-01" },
  { id: "VTR-1001", nid: "1982374011", name: "Mahmudul Hasan", role: "voter", constituencyId: "dhaka-10", constituencyName: "Dhaka-10" },
  { id: "VTR-1002", nid: "1982374012", name: "Nusrat Jahan", role: "voter", constituencyId: "dhaka-10", constituencyName: "Dhaka-10" },
  { id: "VTR-1003", nid: "1982374013", name: "Kamrul Ahsan", role: "voter", constituencyId: "chittagong-01", constituencyName: "Chittagong-01" },
  { id: "VTR-1004", nid: "1982374014", name: "Farhana Yasmin", role: "voter", constituencyId: "chittagong-01", constituencyName: "Chittagong-01" },
  { id: "VTR-1005", nid: "1982374015", name: "Rafiqul Islam", role: "voter", constituencyId: "sylhet-01", constituencyName: "Sylhet-01" },
  { id: "VTR-1006", nid: "1982374016", name: "Sabina Yeasmin", role: "voter", constituencyId: "sylhet-01", constituencyName: "Sylhet-01" },
] as const;

const CANDIDATE_META = [
  { id: 1, manifesto: "Eco-friendly policies and clean energy transitions.", constituencyName: "Dhaka-10" },
  { id: 2, manifesto: "Economic revitalization and job creation for youth.", constituencyName: "Chittagong-01" },
  { id: 3, manifesto: "Water management and agricultural development.", constituencyName: "Sylhet-01" },
];

const FEED_POSTS = [
  { id: "post-1", type: "ec_notice", author: "Election Commission", content: "Voting will begin on August 15, 2026 at 8:00 AM. All registered voters must bring valid NID.", constituencyId: "ALL", likes: 245, createdAt: new Date("2026-08-10T10:00:00Z") },
  { id: "post-2", type: "campaign", author: "Green Wave Party", content: "Our commitment to sustainable development continues. Vote for change!", constituencyId: "dhaka-10", likes: 89, createdAt: new Date("2026-08-12T14:30:00Z") },
  { id: "post-3", type: "ec_notice", author: "Election Commission", content: "Polling centers open list has been published. Check your assigned center.", constituencyId: "ALL", likes: 178, createdAt: new Date("2026-08-13T09:15:00Z") },
];

const GRIEVANCES = [
  { id: "GRV-001", voterId: "V789", voterName: "Rahim Uddin", category: "Polling Center Issue", description: "Long queue at Dhaka-10 center", status: "reviewing", createdAt: new Date("2026-08-15T09:30:00Z") },
];

const POLLING_CENTERS = [
  { id: "PC-001", name: "Dhaka City College Center", address: "Dhanmondi, Dhaka", constituencyId: "dhaka-10", constituencyName: "Dhaka-10", lat: 23.7392, lng: 90.3809, capacity: 5000, status: "active" },
  { id: "PC-002", name: "Motijheel Govt. Primary School", address: "Motijheel, Dhaka", constituencyId: "dhaka-10", constituencyName: "Dhaka-10", lat: 23.733, lng: 90.417, capacity: 3500, status: "active" },
  { id: "PC-003", name: "Chittagong Collegiate School", address: "Kotwali, Chittagong", constituencyId: "chittagong-01", constituencyName: "Chittagong-01", lat: 22.3365, lng: 91.8326, capacity: 4200, status: "active" },
  { id: "PC-004", name: "Sylhet MC College Center", address: "Tilagarh, Sylhet", constituencyId: "sylhet-01", constituencyName: "Sylhet-01", lat: 24.8949, lng: 91.8687, capacity: 3800, status: "active" },
  { id: "PC-005", name: "Rajshahi University Center", address: "Rajshahi Sadar", constituencyId: "rajshahi-02", constituencyName: "Rajshahi-02", lat: 24.3746, lng: 88.634, capacity: 4500, status: "active" },
];

const TURNOUT = [
  { constituencyId: "dhaka-10", constituencyName: "Dhaka-10", registered: 125000, voted: 98750 },
  { constituencyId: "chittagong-01", constituencyName: "Chittagong-01", registered: 98000, voted: 76440 },
  { constituencyId: "sylhet-01", constituencyName: "Sylhet-01", registered: 67000, voted: 46230 },
];

async function main() {
  console.log("Seeding users...");
  for (const u of USERS) {
    const nidHash = hmacIndex(u.nid);
    await prisma.user.upsert({
      where: { nidHash },
      update: {},
      create: {
        id: u.id,
        nidHash,
        nidEncrypted: encrypt(u.nid),
        name: u.name,
        role: u.role as any,
        party: "party" in u ? (u as any).party : undefined,
        constituencyId: u.constituencyId,
        constituencyName: u.constituencyName,
      },
    });
  }

  console.log("Seeding candidate metadata...");
  for (const m of CANDIDATE_META) {
    await prisma.candidateMeta.upsert({ where: { id: m.id }, update: {}, create: m });
  }

  console.log("Seeding feed posts...");
  for (const p of FEED_POSTS) {
    await prisma.feedPost.upsert({ where: { id: p.id }, update: {}, create: p });
  }

  console.log("Seeding grievances...");
  for (const g of GRIEVANCES) {
    await prisma.grievance.upsert({ where: { id: g.id }, update: {}, create: g });
  }

  console.log("Seeding polling centers...");
  for (const c of POLLING_CENTERS) {
    await prisma.pollingCenter.upsert({ where: { id: c.id }, update: {}, create: c as any });
  }

  console.log("Seeding turnout data...");
  for (const t of TURNOUT) {
    await prisma.turnoutConstituency.upsert({ where: { constituencyId: t.constituencyId }, update: {}, create: t });
  }

  console.log("Seeding election status...");
  await prisma.electionStatus.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, status: "NotStarted", stateIndex: 0 },
  });

  console.log("Seeding audit log genesis entry...");
  const existingAudit = await prisma.auditLog.count();
  if (existingAudit === 0) {
    await appendAuditLog("System", "Database Initialized", "ElectionGuard migrated from JSON files to PostgreSQL");
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
