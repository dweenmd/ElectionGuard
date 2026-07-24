import { prisma } from "./prisma.js";
import { sha256 } from "./crypto.js";

const GENESIS_HASH = "0".repeat(64);

/**
 * Appends a new audit entry, chaining it to the previous entry's hash
 * (similar to a blockchain's block linking). If any past row is edited
 * directly in the database, recomputing the chain via verifyAuditChain()
 * will no longer match the stored hashes, exposing the tampering.
 *
 * For stronger guarantees, the latest hash returned here can periodically
 * be written to the ElectionGuard smart contract (e.g. a small
 * `anchorAuditHash(bytes32)` admin-only function) so that even a full
 * database compromise cannot rewrite history undetected. That contract
 * function isn't part of the current ElectionGuard.sol and would need to be
 * added + redeployed as a follow-up.
 */
export async function appendAuditLog(actor: string, action: string, details: string) {
  const last = await prisma.auditLog.findFirst({ orderBy: { createdAt: "desc" } });
  const prevHash = last?.hash ?? GENESIS_HASH;
  const createdAt = new Date();
  const id = `log-${createdAt.getTime()}-${Math.random().toString(36).slice(2, 7)}`;

  const hash = sha256(`${prevHash}|${id}|${actor}|${action}|${details}|${createdAt.toISOString()}`);

  return prisma.auditLog.create({
    data: { id, actor, action, details, prevHash, hash, createdAt },
  });
}

/** Recomputes the chain from genesis and reports the first broken link, if any. */
export async function verifyAuditChain(): Promise<{ valid: boolean; brokenAt?: string }> {
  const entries = await prisma.auditLog.findMany({ orderBy: { createdAt: "asc" } });
  let prevHash = GENESIS_HASH;
  for (const entry of entries) {
    const expected = sha256(
      `${prevHash}|${entry.id}|${entry.actor}|${entry.action}|${entry.details}|${entry.createdAt.toISOString()}`
    );
    if (expected !== entry.hash || entry.prevHash !== prevHash) {
      return { valid: false, brokenAt: entry.id };
    }
    prevHash = entry.hash;
  }
  return { valid: true };
}
