import { clamp } from "@/lib/utils";

function easeOut(value: number) {
  return 1 - (1 - value) ** 2;
}

export function getDayProgress(date: Date, now: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  if (now < dayStart) {
    return 0;
  }

  if (now > dayEnd) {
    return 1;
  }

  const elapsed = now.getTime() - dayStart.getTime();
  const fullDay = dayEnd.getTime() - dayStart.getTime();
  const raw = clamp(elapsed / fullDay);

  if (raw <= 0.25) {
    return 0.08 * (raw / 0.25) ** 1.8;
  }

  if (raw <= 0.5) {
    return 0.08 + 0.26 * easeOut((raw - 0.25) / 0.25);
  }

  if (raw <= 0.75) {
    return 0.34 + 0.46 * easeOut((raw - 0.5) / 0.25);
  }

  return 0.8 + 0.2 * easeOut((raw - 0.75) / 0.25);
}
