import { Router } from "express";
import type { Request, Response } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { readJson, writeJson } from "../config/db.js";
import { RP_NAME, RP_ID, ORIGIN } from "../config/webauthn.js";

const router = Router();

interface StoredCredential {
  nid: string;
  credentialID: string; // base64url string
  publicKey: string; // base64 encoded public key bytes
  counter: number;
  transports?: AuthenticatorTransportFuture[];
  createdAt: string;
}

const CREDS_FILE = "webauthn-credentials.json";

// Pending challenges, keyed by NID. In-memory is fine for a single-process
// demo server; for a multi-instance deployment this should live in Redis/DB.
const challengeStore = new Map<string, string>();

function getCredentialsForNid(nid: string): StoredCredential[] {
  return readJson<StoredCredential[]>(CREDS_FILE, []).filter((c) => c.nid === nid);
}

/**
 * Step 1 of registering a real device biometric (fingerprint / Face ID / Windows Hello)
 * as the voter's "fingerprint sensor" for this NID.
 */
router.post("/register-options", async (req: Request, res: Response) => {
  try {
    const { nid, name } = req.body as { nid?: string; name?: string };
    if (!nid) {
      res.status(400).json({ error: "nid is required" });
      return;
    }

    const existingCreds = getCredentialsForNid(nid);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: nid,
      userDisplayName: name || nid,
      attestationType: "none",
      authenticatorSelection: {
        // "platform" = the device's own sensor (fingerprint reader, Face ID,
        // Windows Hello) rather than a roaming USB security key.
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      excludeCredentials: existingCreds.map((c) => ({
        id: c.credentialID,
        transports: c.transports,
      })),
    });

    challengeStore.set(nid, options.challenge);
    res.json(options);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate registration options" });
  }
});

/**
 * Step 2: browser sends back the signed credential from the real sensor scan.
 * We verify the cryptographic signature and, only if valid, store the credential.
 */
router.post("/register-verify", async (req: Request, res: Response) => {
  try {
    const { nid, credential } = req.body as { nid?: string; credential?: RegistrationResponseJSON };
    if (!nid || !credential) {
      res.status(400).json({ error: "nid and credential are required" });
      return;
    }

    const expectedChallenge = challengeStore.get(nid);
    if (!expectedChallenge) {
      res.status(400).json({ error: "কোনো pending registration challenge পাওয়া যায়নি। আবার শুরু করুন।" });
      return;
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      res.status(400).json({ error: "বায়োমেট্রিক ভেরিফিকেশন ব্যর্থ হয়েছে।" });
      return;
    }

    const { credential: cred } = verification.registrationInfo;

    const all = readJson<StoredCredential[]>(CREDS_FILE, []);
    all.unshift({
      nid,
      credentialID: cred.id,
      publicKey: Buffer.from(cred.publicKey).toString("base64"),
      counter: cred.counter,
      transports: cred.transports,
      createdAt: new Date().toISOString(),
    });
    writeJson(CREDS_FILE, all);

    challengeStore.delete(nid);
    res.json({ verified: true, credentialId: cred.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration verification failed" });
  }
});

/**
 * Used later at login/voting time to prove "same finger, same person" again,
 * without ever handling raw fingerprint image data server-side.
 */
router.post("/login-options", async (req: Request, res: Response) => {
  try {
    const { nid } = req.body as { nid?: string };
    if (!nid) {
      res.status(400).json({ error: "nid is required" });
      return;
    }

    const existingCreds = getCredentialsForNid(nid);
    if (existingCreds.length === 0) {
      res.status(404).json({ error: "এই NID এর জন্য কোনো বায়োমেট্রিক ডিভাইস নিবন্ধিত নেই।" });
      return;
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "required",
      allowCredentials: existingCreds.map((c) => ({
        id: c.credentialID,
        transports: c.transports,
      })),
    });

    challengeStore.set(nid, options.challenge);
    res.json(options);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate authentication options" });
  }
});

router.post("/login-verify", async (req: Request, res: Response) => {
  try {
    const { nid, credential } = req.body as { nid?: string; credential?: AuthenticationResponseJSON };
    if (!nid || !credential) {
      res.status(400).json({ error: "nid and credential are required" });
      return;
    }

    const expectedChallenge = challengeStore.get(nid);
    if (!expectedChallenge) {
      res.status(400).json({ error: "কোনো pending authentication challenge পাওয়া যায়নি।" });
      return;
    }

    const all = readJson<StoredCredential[]>(CREDS_FILE, []);
    const stored = all.find((c) => c.nid === nid && c.credentialID === credential.id);
    if (!stored) {
      res.status(400).json({ error: "এই NID এর জন্য অজানা ক্রিডেনশিয়াল।" });
      return;
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: stored.credentialID,
        publicKey: new Uint8Array(Buffer.from(stored.publicKey, "base64")),
        counter: stored.counter,
        transports: stored.transports,
      },
    });

    if (!verification.verified) {
      res.status(400).json({ error: "বায়োমেট্রিক প্রমাণীকরণ ব্যর্থ হয়েছে।" });
      return;
    }

    stored.counter = verification.authenticationInfo.newCounter;
    writeJson(CREDS_FILE, all);

    challengeStore.delete(nid);
    res.json({ verified: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Authentication verification failed" });
  }
});

export default router;
