import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM
const TAG_LENGTH = 16;

function loadKey(envVar: string): Buffer {
  const raw = process.env[envVar];
  if (!raw) {
    throw new Error(
      `${envVar} is not set. Generate one with: openssl rand -base64 32`
    );
  }
  // Accept either 32-byte hex (64 chars) or base64.
  const key = raw.length === 64 ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(`${envVar} must decode to exactly 32 bytes (AES-256 key)`);
  }
  return key;
}

/**
 * AES-256-GCM encrypt. Output = base64(iv || authTag || ciphertext).
 * Used for PII that must be recoverable (NID, biometric metadata) but should
 * never sit in the database as plaintext.
 */
export function encrypt(plaintext: string): string {
  const key = loadKey("ENCRYPTION_KEY");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decrypt(payload: string): string {
  const key = loadKey("ENCRYPTION_KEY");
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/**
 * Deterministic keyed hash used ONLY as a database index for exact-match
 * lookups (e.g. "does this NID already exist?"). Not reversible. Uses a
 * separate key from ENCRYPTION_KEY so that leaking one does not compromise
 * the other.
 */
export function hmacIndex(value: string): string {
  const secret = process.env["HMAC_KEY"];
  if (!secret) {
    throw new Error("HMAC_KEY is not set. Generate one with: openssl rand -base64 32");
  }
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
