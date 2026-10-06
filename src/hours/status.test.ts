import { describe, expect, it } from "vitest";
import { SHOP_HOURS } from "./schedule.js";
import { localTime, openingStatus, statusLabel } from "./status.js";

// Copenhagen is UTC+2 until 25 October 2026, then UTC+1.
const at = (iso: string) => openingStatus(new Date(iso), SHOP_HOURS);

describe("openingStatus", () => {
  it("is open during a shift, with its closing time", () => {
    expect(at("2026-10-05T08:00:00Z")).toEqual({ open: true, closesAt: "17:30" }); // Mon 10:00
  });

  it("opens on the minute and closes on the minute", () => {
    expect(at("2026-10-05T07:00:00Z").open).toBe(true); // Mon 09:00
    expect(at("2026-10-05T15:30:00Z")).toEqual({ open: false, opensAt: { when: "tomorrow", time: "09:00" } }); // Mon 17:30
  });

  it("says when it opens later the same day", () => {
    expect(at("2026-10-05T06:30:00Z")).toEqual({ open: false, opensAt: { when: "today", time: "09:00" } }); // Mon 08:30
    expect(at("2026-10-07T10:30:00Z")).toEqual({ open: false, opensAt: { when: "today", time: "13:00" } }); // Wed lunch
  });

  it("skips the days it is closed", () => {
    expect(at("2026-10-10T13:00:00Z")).toEqual({ open: false, opensAt: { when: "mon", time: "09:00" } }); // Sat 15:00
    expect(at("2026-12-24T09:00:00Z")).toEqual({ open: false, opensAt: { when: "mon", time: "09:00" } }); // Christmas Eve
  });

  it("uses the shop's date, not UTC's", () => {
    // Monday 22:30 in UTC is already Tuesday 00:30 in Copenhagen.
    expect(localTime(new Date("2026-10-05T22:30:00Z"), "Europe/Copenhagen")).toEqual({ date: "2026-10-06", weekday: "tue", minutes: 30 });
    expect(at("2026-10-05T22:30:00Z")).toEqual({ open: false, opensAt: { when: "today", time: "09:00" } });
  });

  it("keeps counting days across the clock change", () => {
    // Saturday 24 October 23:30, the night the clocks go back: next opening is Monday.
    expect(at("2026-10-24T21:30:00Z")).toEqual({ open: false, opensAt: { when: "mon", time: "09:00" } });
    expect(at("2026-10-26T08:00:00Z")).toEqual({ open: true, closesAt: "17:30" }); // Mon 09:00 CET
  });
});

describe("statusLabel", () => {
  it("reads naturally", () => {
    expect(statusLabel({ open: true, closesAt: "17:30" })).toBe("Open now · closes at 17:30");
    expect(statusLabel({ open: false, opensAt: { when: "tomorrow", time: "09:00" } })).toBe("Closed · opens tomorrow at 09:00");
    expect(statusLabel({ open: false, opensAt: { when: "mon", time: "09:00" } })).toBe("Closed · opens Monday at 09:00");
    expect(statusLabel({ open: false, opensAt: null })).toBe("Closed");
  });
});
