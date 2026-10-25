// branches/{branchId}/equipment/{equipmentId} — see CLAUDE.md §6.
// `station` and `imageUrl` are additions for the admin UI — agree them with Member 1 (equipment screens).

export const EQUIPMENT_STATUSES = ['Available', 'Occupied', 'AvailableSoon', 'Maintenance'] as const;
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'FullBody'] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export type Equipment = {
  id: string;
  branchId: string; // parent branch (the subcollection it lives in)
  name: string;
  zone: string; // one of the branch's zones, e.g. "Strength"
  station: string; // e.g. "Rack 02"
  muscleGroup: MuscleGroup;
  units: number;
  status: EquipmentStatus;
  occupiedBy?: string; // users/{userId}
  occupiedAt?: string; // ISO date
  estimatedFreeAt?: string; // ISO date
  imageUrl?: string;
};
