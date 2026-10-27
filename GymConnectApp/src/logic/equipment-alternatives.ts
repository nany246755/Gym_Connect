
import type { Equipment } from '@/types/equipment';

// An alternative is an available machine
// that trains the same muscle group,
// in the same branch as the selected equipment.

export type EquipmentAlternative = {
  equipment: Equipment;
  reason: string;
};

// Find suitable available equipment alternatives.
//
// This function only reads equipment data.
// It does not modify the inventory or any status.
export function findEquipmentAlternatives(
  selectedEquipment: Equipment,
  branchEquipment: Equipment[],
  limit: number = 5
): EquipmentAlternative[] {
  // Return no results when an invalid limit is supplied.
  if (!Number.isFinite(limit) || limit <= 0) {
    return [];
  }

  const alternatives = branchEquipment.filter(
    (item) => {
      // Never recommend the same machine.
      if (item.id === selectedEquipment.id) {
        return false;
      }

      // Alternatives must exist at the same branch.
      if (
        item.branchId !== selectedEquipment.branchId
      ) {
        return false;
      }

      // Match the muscle group being trained.
      if (
        item.muscleGroup !==
        selectedEquipment.muscleGroup
      ) {
        return false;
      }

      // Only recommend currently available machines.
      // Occupied, AvailableSoon, and Maintenance
      // are not immediately available alternatives.
      if (item.status !== 'Available') {
        return false;
      }

      return true;
    }
  );

  // Keep results in a consistent order.
  alternatives.sort((a, b) => {
    const nameComparison = a.name.localeCompare(
      b.name
    );

    if (nameComparison !== 0) {
      return nameComparison;
    }

    return a.station.localeCompare(b.station);
  });

  // Return a limited number of matching machines.
  return alternatives
    .slice(0, Math.floor(limit))
    .map((equipment) => ({
      equipment,
      reason: 'Same muscle group · Available now',
    }));
}
