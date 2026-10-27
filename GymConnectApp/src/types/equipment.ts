
export const EQUIPMENT_STATUSES = [
  'Available',
  'Occupied',
  'AvailableSoon',
  'Maintenance',
] as const;

export type EquipmentStatus =
  (typeof EQUIPMENT_STATUSES)[number];

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'FullBody',
] as const;

export type MuscleGroup =
  (typeof MUSCLE_GROUPS)[number];

// Position of equipment in its branch's gym floor.
export type EquipmentFloorPlacement = {
  // The first row is 1.
  row: number;

  // Valid columns: 1 to 4.
  column: number;

  // Number of columns occupied by the equipment.
  // Valid range: 1 to 4. Defaults to 1.
  columnSpan?: number;

  // Number of rows occupied by the equipment.
  // Valid range: 1 to 6. Defaults to 1.
  rowSpan?: number;
};

// Shared equipment model used by Admin and Member.
export type Equipment = {
  id: string;
  branchId: string;
  name: string;
  zone: string;
  station: string;
  muscleGroup: MuscleGroup;
  units: number;
  status: EquipmentStatus;
  occupiedBy?: string;
  occupiedAt?: string;
  estimatedFreeAt?: string;
  imageUrl?: string;
  floorPlacement?: EquipmentFloorPlacement;
};
