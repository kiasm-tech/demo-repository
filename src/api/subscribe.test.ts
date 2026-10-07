import { describe, expect, it } from "vitest";
import type { Config } from "../config";
import type { Mail } from "../mail/confirmation";
import { MemorySubscriberStore } from "../subscribers/store";
import { newsletterHandlers } from "./subscribe";

const config: Config = { newsletterSecret: "s3cret", confirmUrlBase: "https://demo.example/newsletter/confirm", confirmTtlHours: 48, signupsPerHour: 2 };

function setUp(start = new Date("2026-10-06T10:00:00Z")) {
  let clock = start;
  const sent: Mail[] = [];
  const store = new MemorySubscriberStore();
  const handlers = newsletterHandlers(config, store, { send: async (mail) => void sent.push(mail) }, () => clock);
  const tokenIn = (mail: Mail) => decodeURIComponent(mail.text.match(/token=(\S+)/)![1]!);
  return { ...handlers, store, sent, tokenIn, advance: (hours: number) => (clock = new Date(clock.getTime() + hours * 3_600_000)) };
}

describe("newsletter sign-up", () => {
  it("stores a new address as pending and mails a confirmation link", async () => {
    const { subscribe, store, sent } = setUp();
    expect((await subscribe({ email: " Ada@Example.com ", ip: "1.1.1.1" })).status).toBe(202);
    expect(await store.find("ada@example.com")).toMatchObject({ status: "pending", confirmedAt: null });
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe("ada@example.com");
  });

  it("confirms the address from the link", async () => {
    const { subscribe, confirm, store, sent, tokenIn } = setUp();
    await subscribe({ email: "ada@example.com", ip: "1.1.1.1" });
    expect((await confirm(tokenIn(sent[0]!))).status).toBe(200);
    expect(await store.find("ada@example.com")).toMatchObject({ status: "confirmed" });
  });

  it("refuses an expired or tampered link", async () => {
    const { subscribe, confirm, sent, tokenIn, advance } = setUp();
    await subscribe({ email: "ada@example.com", ip: "1.1.1.1" });
    const token = tokenIn(sent[0]!);
    expect((await confirm(`${token}x`)).status).toBe(400);
    advance(49);
    expect((await confirm(token)).status).toBe(400);
  });

  it("answers the same for an address that is already confirmed, without mailing it", async () => {
    const { subscribe, confirm, sent, tokenIn } = setUp();
    await subscribe({ email: "ada@example.com", ip: "1.1.1.1" });
    await confirm(tokenIn(sent[0]!));
    expect((await subscribe({ email: "ada@example.com", ip: "2.2.2.2" })).status).toBe(202);
    expect(sent).toHaveLength(1);
  });

  it("rejects an invalid address", async () => {
    const { subscribe } = setUp();
    expect((await subscribe({ email: "not-an-email", ip: "1.1.1.1" })).status).toBe(400);
  });

  it("limits sign-ups per IP address per hour", async () => {
    const { subscribe, advance } = setUp();
    await subscribe({ email: "a@example.com", ip: "1.1.1.1" });
    await subscribe({ email: "b@example.com", ip: "1.1.1.1" });
    expect((await subscribe({ email: "c@example.com", ip: "1.1.1.1" })).status).toBe(429);
    expect((await subscribe({ email: "c@example.com", ip: "2.2.2.2" })).status).toBe(202);
    advance(1);
    expect((await subscribe({ email: "c@example.com", ip: "1.1.1.1" })).status).toBe(202);
  });
});
