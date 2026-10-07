import type { Config } from "../config";
import { confirmationMail, type Mailer } from "../mail/confirmation";
import type { SubscriberStore } from "../subscribers/store";
import { createToken, verifyToken } from "../subscribers/tokens";
import { RateLimiter } from "./rate-limit";

export interface Reply {
  status: number;
  body: { message: string };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Newsletter sign-up with double opt-in: POST /newsletter/subscribe stores the
 * address as pending and mails a signed link; GET /newsletter/confirm?token=…
 * confirms it. Only confirmed addresses ever receive the newsletter.
 */
export function newsletterHandlers(config: Config, store: SubscriberStore, mailer: Mailer, now = () => new Date()) {
  const limiter = new RateLimiter(config.signupsPerHour, HOUR_MS);

  async function subscribe(input: { email?: unknown; ip: string }): Promise<Reply> {
    if (!limiter.allow(input.ip, now().getTime())) return { status: 429, body: { message: "Too many sign-ups from this address. Try again later." } };
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    if (!EMAIL.test(email)) return { status: 400, body: { message: "Enter a valid email address." } };

    const existing = await store.find(email);
    // Same answer either way, so the form can't be used to find out who is subscribed.
    const accepted: Reply = { status: 202, body: { message: "Check your inbox to confirm your subscription." } };
    if (existing?.status === "confirmed") return accepted;

    await store.save({ email, status: "pending", createdAt: existing?.createdAt ?? now(), confirmedAt: null });
    const expiresAt = new Date(now().getTime() + config.confirmTtlHours * HOUR_MS);
    const link = `${config.confirmUrlBase}?token=${encodeURIComponent(createToken(email, config.newsletterSecret, expiresAt))}`;
    await mailer.send(confirmationMail(email, link, config.confirmTtlHours));
    return accepted;
  }

  async function confirm(token: string): Promise<Reply> {
    const email = verifyToken(token, config.newsletterSecret, now());
    if (!email) return { status: 400, body: { message: "This link is invalid or has expired. Sign up again to get a new one." } };
    const subscriber = await store.find(email);
    if (!subscriber || subscriber.status === "unsubscribed") return { status: 404, body: { message: "There is no sign-up to confirm for this address." } };
    if (subscriber.status === "pending") await store.save({ ...subscriber, status: "confirmed", confirmedAt: now() });
    return { status: 200, body: { message: "You're subscribed. Thanks!" } };
  }

  return { subscribe, confirm };
}
