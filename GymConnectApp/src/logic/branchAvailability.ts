
/**
 * Determines whether a gym branch is open.
 *
 * Opening and closing times use 24-hour HH:mm format.
 * Example:
 * 06:00 = 6 AM
 * 22:00 = 10 PM
 * 00:00 = midnight
 */

const GYM_TIME_ZONE = 'Africa/Cairo';

// Convert HH:mm into minutes since midnight.
function toMinutes(time: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

// Get the current local time in Cairo.
function getCairoMinutes(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: GYM_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const hour = Number(
    parts.find((part) => part.type === 'hour')?.value
  );

  const minute = Number(
    parts.find((part) => part.type === 'minute')?.value
  );

  return hour * 60 + minute;
}

// Check whether the branch is currently open.
export function isBranchOpen(
  openingTime: string,
  closingTime: string,
  now: Date = new Date()
): boolean {
  const opening = toMinutes(openingTime);
  const closing = toMinutes(closingTime);
  const current = getCairoMinutes(now);

  // Equal times represent a 24-hour branch.
  if (opening === closing) {
    return true;
  }

  // Regular hours, e.g. 06:00 to 22:00.
  if (opening < closing) {
    return current >= opening && current < closing;
  }

  // Overnight hours, e.g. 18:00 to 02:00.
  return current >= opening || current < closing;
}
