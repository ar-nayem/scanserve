// SIMPLE password-gate for the owner dashboard. This is NOT real
// authentication — there's one shared password (env var ADMIN_PASSWORD), no
// user accounts, no expiry, no rate limiting on login attempts.
//
// TODO(before real restaurants / real money): replace this with Supabase
// Auth or NextAuth so each restaurant owner has their own account, sessions
// expire, and login attempts are rate-limited.

import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "scanserve_admin";

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "changeme123";
}

// The cookie stores a hash of the password rather than the password itself,
// so it isn't sitting in plaintext in the browser's cookie jar.
function expectedCookieValue(): string {
  return crypto.createHash("sha256").update(getAdminPassword()).digest("hex");
}

export function checkPassword(candidate: string): boolean {
  return candidate === getAdminPassword();
}

export function getSessionCookieValue(): string {
  return expectedCookieValue();
}

export function isValidSessionCookie(value: string | undefined): boolean {
  if (!value) return false;
  return value === expectedCookieValue();
}
