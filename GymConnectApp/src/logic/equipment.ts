import type { Branch } from '@/types/branch';
import type { Equipment, EquipmentStatus, MuscleGroup } from '@/types/equipment';

// Pure helpers for the admin equipment screens.

export const STATUS_LABEL: Record<EquipmentStatus, string> = {
  Available: 'Available',
  Occupied: 'Occupied',
  AvailableSoon: 'Soon',
  Maintenance: 'Maintenance',
};

export const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  Chest: 'Chest',
  Back: 'Back',
  Legs: 'Legs',
  Shoulders: 'Shoulders',
  Arms: 'Arms',
  FullBody: 'Full body',
};

export type StatusFilter = EquipmentStatus | 'All';

// Status is member-reported, so an "Occupied" flag can be forgotten. After this long the admin
// is asked to check the station.
export const STUCK_AFTER_MIN = 90;

const minutesSince = (iso: string, now: Date) => Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);

export function isStuck(e: Equipment, now: Date): boolean {
  return e.status === 'Occupied' && !!e.occupiedAt && minutesSince(e.occupiedAt, now) >= STUCK_AFTER_MIN;
}

// "2h 18m", "25m"
export function occupiedFor(e: Equipment, now: Date): string {
  const total = e.occupiedAt ? Math.max(0, minutesSince(e.occupiedAt, now)) : 0;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function countByStatus(list: Equipment[]): Record<EquipmentStatus, number> {
  const counts: Record<EquipmentStatus, number> = { Available: 0, Occupied: 0, AvailableSoon: 0, Maintenance: 0 };
  for (const e of list) counts[e.status] += 1;
  return counts;
}

// Status filter plus a search over name, zone and station; stuck equipment first, then A–Z.
export function filterEquipment(list: Equipment[], status: StatusFilter, query: string, now: Date): Equipment[] {
  const q = query.trim().toLowerCase();
  return list
    .filter((e) => status === 'All' || e.status === status)
    .filter((e) => !q || `${e.name} ${e.zone} ${e.station}`.toLowerCase().includes(q))
    .sort((a, b) => Number(isStuck(b, now)) - Number(isStuck(a, now)) || a.name.localeCompare(b.name));
}

// Admin override: the station is free again.
export function resetToAvailable(e: Equipment): Equipment {
  return { ...e, status: 'Available', occupiedBy: undefined, occupiedAt: undefined, estimatedFreeAt: undefined };
}

// Admin sets a status by hand. Only Occupied/Soon keep (or start) an occupied time.
export function withStatus(e: Equipment, status: EquipmentStatus, now: Date): Equipment {
  if (status === 'Available' || status === 'Maintenance') return { ...resetToAvailable(e), status };
  return { ...e, status, occupiedAt: e.occupiedAt ?? now.toISOString() };
}

// Zones every selected branch has, in the first branch's order — adding to several branches can
// only use a zone that exists in all of them.
export function commonZones(branches: Pick<Branch, 'id' | 'zones'>[], branchIds: string[]): string[] {
  const picked = branchIds.map((id) => branches.find((b) => b.id === id)?.zones ?? []);
  return (picked[0] ?? []).filter((z) => picked.every((zones) => zones.includes(z)));
}

export type EquipmentErrors = Partial<Record<'name' | 'station', string>>;

export function validateEquipment(e: Pick<Equipment, 'name' | 'station'>): EquipmentErrors {
  const errors: EquipmentErrors = {};
  if (!e.name.trim()) errors.name = 'Enter the equipment name.';
  else if (e.name.trim().length > 40) errors.name = 'Keep the name under 40 characters.';
  if (!e.station.trim()) errors.station = 'Enter the station, e.g. Rack 02.';
  return errors;
}
