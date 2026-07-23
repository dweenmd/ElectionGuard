// WebAuthn "Relying Party" configuration.
//
// RP_ID must be the domain (no protocol, no port) that the frontend is served from.
// "localhost" works for local dev without HTTPS. In production this MUST be your
// real domain (e.g. "electionguard.gov.bd") and the site MUST be served over HTTPS,
// otherwise browsers will refuse to run WebAuthn at all.
//
// ORIGIN must be the exact scheme+host+port the frontend is loaded from.
export const RP_NAME = process.env["WEBAUTHN_RP_NAME"] || "ElectionGuard";
export const RP_ID = process.env["WEBAUTHN_RP_ID"] || "localhost";
export const ORIGIN = process.env["WEBAUTHN_ORIGIN"] || "http://localhost:3000";
