import type { User } from '@/types/user';

// Pure helpers for the Member Profile screen.

export const SCHEDULE_STEP_MIN = 30;
const LAST_SLOT_MIN = 23 * 60 + 30;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (total: number) =>
  `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

// Moves a "HH:mm" time by whole steps, staying within the same day.
export function shiftTime(hhmm: string, deltaMin: number): string {
  return fromMinutes(Math.min(LAST_SLOT_MIN, Math.max(0, toMinutes(hhmm) + deltaMin)));
}

// "18:30" -> "6:30 PM"
export function formatTime(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// Every half-hour start/end option, 5:00 AM to 11:30 PM.
export const SCHEDULE_SLOTS = Array.from({ length: (LAST_SLOT_MIN - 5 * 60) / SCHEDULE_STEP_MIN + 1 }, (_, i) =>
  fromMinutes(5 * 60 + i * SCHEDULE_STEP_MIN),
);

// A session starts and ends on the same day: "To" must be strictly later than "From".
// No overnight wrap — 2:30 PM to 1:00 PM is invalid, not a 22h30m session.
export function isLaterTime(to: string, from: string): boolean {
  return toMinutes(to) > toMinutes(from);
}

// "18:00" to "20:00" -> "2h"; "18:00" to "19:30" -> "1h 30m"; invalid order -> "–"
export function sessionLength(from: string, to: string): string {
  if (!isLaterTime(to, from)) return '–';
  const total = toMinutes(to) - toMinutes(from);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ISO date -> "Oct 2026"
export function memberSince(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Adds or removes `item`, keeping the list in `order` (so days stay Mon..Sun).
export function toggleInOrder<T>(order: readonly T[], list: T[], item: T): T[] {
  const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  return order.filter((x) => next.includes(x));
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

export type ProfileErrors = Partial<Record<'fullName' | 'trainingStyles' | 'scheduleDays' | 'scheduleTime', string>>;

export function validateProfile(u: User): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = u.fullName.trim();
  if (!name) errors.fullName = 'Enter your name.';
  else if (name.length > 50) errors.fullName = 'Keep your name under 50 characters.';
  if (u.trainingStyles.length === 0) errors.trainingStyles = 'Pick at least one training style.';
  if (u.scheduleDays.length === 0) errors.scheduleDays = 'Pick at least one day.';
  if (!isLaterTime(u.scheduleTo, u.scheduleFrom)) errors.scheduleTime = 'Select a later end time.';
  return errors;
}
