
import type { Equipment } from '@/types/equipment';

export type EquipmentUsageAction =
  | 'start'
  | 'almostFinished'
  | 'continue'
  | 'finish';

// Identify which actions the current member is allowed
// to perform on a specific machine.
export function getAllowedEquipmentActions(
  equipment: Equipment,
  memberId: string | null | undefined
): EquipmentUsageAction[] {
  // A signed-in member identity is required.
  if (!memberId) {
    return [];
  }

  // Admin controls equipment under maintenance.
  if (equipment.status === 'Maintenance') {
    return [];
  }

  // Any member may claim an available machine.
  if (equipment.status === 'Available') {
    return ['start'];
  }

  // A machine already in use can only be changed
  // by the member who claimed it.
  if (equipment.occupiedBy !== memberId) {
    return [];
  }

  // The current user owns this occupied machine.
  if (equipment.status === 'Occupied') {
    return ['almostFinished', 'finish'];
  }

  // The current user owns this almost-free machine.
  if (equipment.status === 'AvailableSoon') {
    return ['continue', 'finish'];
  }

  return [];
}

// Calculate the updated machine state.
//
// IMPORTANT:
// This function does not save anything.
// Persistence will be connected to the shared service
// in the next step.
export function applyEquipmentUsageAction(
  equipment: Equipment,
  memberId: string,
  action: EquipmentUsageAction,
  now: Date = new Date()
): Equipment {
  const allowed = getAllowedEquipmentActions(
    equipment,
    memberId
  );

  if (!allowed.includes(action)) {
    throw new Error(
      'You cannot change the status of this machine.'
    );
  }

  switch (action) {
    case 'start':
      return {
        ...equipment,
        status: 'Occupied',
        occupiedBy: memberId,
        occupiedAt: now.toISOString(),
        estimatedFreeAt: undefined,
      };

    case 'almostFinished':
      return {
        ...equipment,
        status: 'AvailableSoon',
        estimatedFreeAt: undefined,
      };

    case 'continue':
      return {
        ...equipment,
        status: 'Occupied',
        estimatedFreeAt: undefined,
      };

    case 'finish':
      return {
        ...equipment,
        status: 'Available',
        occupiedBy: undefined,
        occupiedAt: undefined,
        estimatedFreeAt: undefined,
      };
  }
}
