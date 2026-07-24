# ElectionGuard Backend — Real Database Setup

Ei backend ekhon fs-based JSON files (`src/data/*.json`) er বদলে আসল
**PostgreSQL** database use kore, **Prisma ORM** die connect kora. Niche step by
step setup guide dewa holo.

## 1. Postgres run koro

**Option A — Docker (সবচেয়ে সহজ):**
```bash
docker compose up -d
```
Eta local e Postgres 16 chalu korbe, port 5432 e, user/pass/db সব `electionguard`.

**Option B — Nijer install kora Postgres / cloud (Neon, Supabase, Railway):**
Just ekটা connection string sংগ্রহ koro, e.g.:
```
postgresql://user:pass@host:5432/dbname?sslmode=require
```

## 2. Environment variables

```bash
cp .env.example .env
```

Tারপর `.env` file e ei duita key generate kore বসাও (protyekta আলাদা, kokhono
share korba na):

```bash
openssl rand -base64 32   # -> ENCRYPTION_KEY
openssl rand -base64 32   # -> HMAC_KEY
openssl rand -base64 32   # -> JWT_SECRET
```

`DATABASE_URL` o update koro tomar Postgres connection string diye.

**⚠️ Important:** `ENCRYPTION_KEY` change korle purono encrypted NID/biometric
data ar decrypt kora jabe na. Eta production e generate kore ekটা secure
secrets manager (e.g. 1Password, AWS Secrets Manager) e রাখো — `.env` file
kokhono git e commit korba na (already `.gitignore` e ache).

## 3. Dependencies install

```bash
npm install
```

Eta `postinstall` hook e Prisma Client auto-generate kore dibe.

## 4. Database schema push + migration

```bash
npm run db:migrate
```

Eta prompt korbe migration er ekটা name dite (e.g. `init`), tারপর
`prisma/migrations/` e SQL migration file toiri kore Postgres e apply korbe.

## 5. Purono JSON data + demo data seed koro

```bash
npm run db:seed
```

Eta purono `src/data/*.json` er sample voters/admin/candidates, feed posts,
grievances, polling centers, turnout data — সবকিছু নতুন DB তে migrate kore
dibe, plus ekটা audit-log genesis entry create kore.

> Note: `webauthn-credentials.json` seed kora hoy nai, karon oi credential
> gula tomar age-er test browser/device er sathe cryptographically tied
> chilo — notun environment e kaj korbe na. Fingerprint/Face ID abar notun
> kore register korte hobe.

## 6. Server chalao

```bash
npm run dev
```

`http://localhost:5000/api/health` hit kore check koro.

---

## Ki ki change holo (summary)

| Age (JSON file) | Ekhon (Postgres via Prisma) |
|---|---|
| `src/config/db.ts` (readJson/writeJson) | `src/lib/prisma.ts` (Prisma Client singleton) |
| NID plaintext file e store | `nidHash` (HMAC-SHA256, lookup index) + `nidEncrypted` (AES-256-GCM, recoverable) |
| faceDescriptor/fingerprintHash plaintext | AES-256-GCM encrypted columns |
| Concurrent-vote race condition possible | `VoteRecord.userId` UNIQUE constraint → atomic, DB-level double-vote prevention |
| Audit log = plain array | Hash-chained audit log (`prevHash` + `hash` per entry) — tamper-evident, verify via `GET /api/audit-logs/verify` (admin only) |
| Raw string queries risk | Prisma always parameterizes queries → SQL injection prevented by design |
| No rate limiting | `express-rate-limit` on login/register (20/15min) + global API limit (300/min) |
| No security headers | `helmet()` middleware added |

## Next-phase ideas (out of scope for this pass, but worth knowing about)

- **Redis** for WebAuthn challenge storage + rate limiting state, so it
  survives server restarts and works across multiple backend instances.
- **On-chain audit anchoring**: `ElectionGuard.sol` doesn't currently have a
  function to store an admin-only `bytes32` hash. Adding
  `anchorAuditHash(bytes32 hash)` and periodically calling it with the
  latest `AuditLog.hash` would let anyone verify the DB hasn't been
  silently rewritten, even by someone with full DB access.
- **IPFS** for candidate photos/manifesto documents so they're not
  centrally hosted.
- **pgcrypto / SCRAM-SHA-256** at the Postgres level, on top of the
  application-level AES-256-GCM already in place, if hosting your own
  Postgres instance (managed providers like Neon/Supabase already use
  SCRAM-SHA-256 by default).
