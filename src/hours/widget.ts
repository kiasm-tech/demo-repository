import { SHOP_HOURS, type Schedule } from "./schedule.js";
import { openingStatus, statusLabel } from "./status.js";

/** Shows the shop's status in `el` and refreshes it every minute; returns a function that stops it. */
export function mountOpeningHours(el: HTMLElement, schedule: Schedule = SHOP_HOURS, clock = () => new Date()): () => void {
  const render = () => {
    const status = openingStatus(clock(), schedule);
    el.textContent = statusLabel(status);
    el.dataset.open = String(status.open);
  };
  render();
  const timer = setInterval(render, 60_000);
  return () => clearInterval(timer);
}
