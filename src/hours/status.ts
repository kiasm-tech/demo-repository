import type { Schedule, Shift, Weekday } from "./schedule.js";

const DAY_NAMES: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** How far ahead to look for the next opening before giving up. */
const LOOKAHEAD_DAYS = 14;

export type OpeningStatus =
  | { open: true; closesAt: string }
  | { open: false; opensAt: { when: "today" | "tomorrow" | Weekday; time: string } | null };

interface LocalTime {
  date: string;
  weekday: Weekday;
  minutes: number;
}

/** The date, weekday and minute of the day that `now` is in `timeZone`. */
export function localTime(now: Date, timeZone: string): LocalTime {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday.toLowerCase() as Weekday,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

function shiftsOn(schedule: Schedule, day: LocalTime): Shift[] {
  return schedule.closedDates.includes(day.date) ? [] : schedule.week[day.weekday];
}

/** Whether the shop is open at `now`, and when it closes or next opens, in the shop's own time zone. */
export function openingStatus(now: Date, schedule: Schedule): OpeningStatus {
  const today = localTime(now, schedule.timeZone);
  const shifts = shiftsOn(schedule, today);

  const current = shifts.find((s) => toMinutes(s.opens) <= today.minutes && today.minutes < toMinutes(s.closes));
  if (current) return { open: true, closesAt: current.closes };

  const later = shifts.find((s) => toMinutes(s.opens) > today.minutes);
  if (later) return { open: false, opensAt: { when: "today", time: later.opens } };

  // Step from local midday so a daylight-saving change can't skip or repeat a date.
  const midday = now.getTime() + (12 * 60 - today.minutes) * 60_000;
  for (let ahead = 1; ahead <= LOOKAHEAD_DAYS; ahead++) {
    const day = localTime(new Date(midday + ahead * 86_400_000), schedule.timeZone);
    const first = shiftsOn(schedule, day)[0];
    if (first) return { open: false, opensAt: { when: ahead === 1 ? "tomorrow" : day.weekday, time: first.opens } };
  }
  return { open: false, opensAt: null };
}

export function statusLabel(status: OpeningStatus): string {
  if (status.open) return `Open now · closes at ${status.closesAt}`;
  if (!status.opensAt) return "Closed";
  const { when, time } = status.opensAt;
  const day = when === "today" || when === "tomorrow" ? when : DAY_NAMES[when];
  return `Closed · opens ${day} at ${time}`;
}
