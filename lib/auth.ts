// ============================================================================
//  SIMPLE ADMIN AUTH
// ----------------------------------------------------------------------------
//  A single password (env var ADMIN_PASSWORD) gates the /admin page.
//  On login we set an httpOnly cookie holding an HMAC token so the password
//  itself is never stored in the browser.
// ============================================================================

import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "dm_admin";

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sessionToken(): string {
  const pw = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_SECRET || pw || "dm-fallback-secret";
  return crypto.createHmac("sha256", secret).update("admin-session-v1").digest("hex");
}

export function verifyPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw) return false;
  const a = Buffer.from(String(input));
  const b = Buffer.from(pw);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isAuthed(): boolean {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return false;
  const expected = sessionToken();
  const a = Buffer.from(c);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function setAuthCookie(): void {
  cookies().set(COOKIE, sessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function clearAuthCookie(): void {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
