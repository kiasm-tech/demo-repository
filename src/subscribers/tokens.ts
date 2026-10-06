import { createHmac, timingSafeEqual } from "node:crypto";

/** A confirmation token: the email and an expiry, signed so it can't be forged or extended. */
export function createToken(email: string, secret: string, expiresAt: Date): string {
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), exp: expiresAt.getTime() })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/** The email a token confirms, or null when it is forged, malformed or expired. */
export function verifyToken(token: string, secret: string, now = new Date()): string | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email: string; exp: number };
    return exp > now.getTime() ? email : null;
  } catch {
    return null;
  }
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
