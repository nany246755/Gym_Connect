import { formatTime } from '@/logic/profile';
import { WEEK_DAYS, type User } from '@/types/user';

// Pure helpers for the Member Dashboard.

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// "Good morning" until noon, "Good afternoon" until 5 PM, then "Good evening".
export function greeting(now: Date): string {
  const h = now.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

// "Wednesday is a training day · 6:00 PM – 8:00 PM", or the next training day on a rest day.
export function scheduleLine(user: Pick<User, 'scheduleDays' | 'scheduleFrom' | 'scheduleTo'>, now: Date): string {
  const today = (now.getDay() + 6) % 7; // Monday = 0
  const time = `${formatTime(user.scheduleFrom)} – ${formatTime(user.scheduleTo)}`;
  if (user.scheduleDays.includes(WEEK_DAYS[today])) return `${DAY_NAMES[today]} is a training day · ${time}`;
  for (let i = 1; i <= 7; i++) {
    const day = (today + i) % 7;
    if (user.scheduleDays.includes(WEEK_DAYS[day])) return `Rest day · next workout ${DAY_NAMES[day]}`;
  }
  return 'No training days set yet';
}

// "Just now", "2 min ago", "1 h ago"
export function timeAgo(iso: string, now: Date): string {
  const min = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  return `${Math.floor(min / 60)} h ago`;
}

// "6:12 PM" from an ISO date.
export function clockTime(iso: string): string {
  const d = new Date(iso);
  return formatTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
}
