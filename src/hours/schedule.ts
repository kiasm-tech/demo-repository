export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Wall-clock times in the shop's time zone, "HH:MM". `closes` is exclusive. */
export interface Shift {
  opens: string;
  closes: string;
}

export interface Schedule {
  timeZone: string;
  week: Record<Weekday, Shift[]>;
  /** Local dates ("YYYY-MM-DD") the shop stays closed all day. */
  closedDates: string[];
}

export const SHOP_HOURS: Schedule = {
  timeZone: "Europe/Copenhagen",
  week: {
    mon: [{ opens: "09:00", closes: "17:30" }],
    tue: [{ opens: "09:00", closes: "17:30" }],
    // Stock-taking over lunch on Wednesdays.
    wed: [
      { opens: "09:00", closes: "12:00" },
      { opens: "13:00", closes: "17:30" },
    ],
    thu: [{ opens: "09:00", closes: "17:30" }],
    fri: [{ opens: "09:00", closes: "17:30" }],
    sat: [{ opens: "10:00", closes: "14:00" }],
    sun: [],
  },
  closedDates: ["2026-12-24", "2026-12-25", "2026-12-26", "2026-12-31", "2027-01-01"],
};
