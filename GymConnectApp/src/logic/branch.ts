import type { Branch } from '@/types/branch';

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Is the branch open at `now`? A closing time at or before the opening time ("00:00") means
// it closes after midnight, so 06:00–00:00 is open until midnight.
export function isOpenNow(branch: Pick<Branch, 'opensAt' | 'closesAt'>, now: Date): boolean {
  const current = now.getHours() * 60 + now.getMinutes();
  const opens = toMinutes(branch.opensAt);
  const closes = toMinutes(branch.closesAt);
  if (closes > opens) return current >= opens && current < closes;
  return current >= opens || current < closes;
}
