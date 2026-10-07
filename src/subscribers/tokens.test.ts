import { describe, expect, it } from "vitest";
import { createToken, verifyToken } from "./tokens";

const now = new Date("2026-10-06T10:00:00Z");
const later = new Date("2026-10-08T10:00:00Z");

describe("confirmation tokens", () => {
  it("round-trip the email until they expire", () => {
    const token = createToken("Ada@Example.com", "s3cret", later);
    expect(verifyToken(token, "s3cret", now)).toBe("ada@example.com");
    expect(verifyToken(token, "s3cret", later)).toBeNull();
  });

  it("reject another secret and malformed input", () => {
    const token = createToken("ada@example.com", "s3cret", later);
    expect(verifyToken(token, "other", now)).toBeNull();
    expect(verifyToken("garbage", "s3cret", now)).toBeNull();
    expect(verifyToken("", "s3cret", now)).toBeNull();
  });
});
