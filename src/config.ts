/** Settings read once at start-up; a missing secret stops the server rather than sending unsigned links. */
export interface Config {
  /** Signs confirmation links. */
  newsletterSecret: string;
  /** Where confirmation links point, e.g. https://demo.example/newsletter/confirm */
  confirmUrlBase: string;
  /** How long a confirmation link stays valid. */
  confirmTtlHours: number;
  /** Sign-up attempts allowed per IP address per hour. */
  signupsPerHour: number;
}

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const missing = ["NEWSLETTER_SECRET", "CONFIRM_URL_BASE"].filter((name) => !env[name]);
  if (missing.length > 0) throw new Error(`Missing env vars: ${missing.join(", ")}`);
  return {
    newsletterSecret: env.NEWSLETTER_SECRET!,
    confirmUrlBase: env.CONFIRM_URL_BASE!,
    confirmTtlHours: Number(env.CONFIRM_TTL_HOURS ?? 48),
    signupsPerHour: Number(env.SIGNUPS_PER_HOUR ?? 5),
  };
}
