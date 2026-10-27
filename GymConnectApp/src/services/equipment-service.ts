import { mockEquipment } from '@/data/mock-equipment';
import type { Equipment } from '@/types/equipment';

// shortcut: UI phase has no database or storage, so equipment lives in memory, starting from the
// mock data. Admin edits last until the app closes. When Firebase is added, these become
// reads/writes on branches/{branchId}/equipment.
let equipment: Equipment[] = [...mockEquipment];

export async function listEquipment(branchId: string): Promise<Equipment[]> {
  return equipment.filter((e) => e.branchId === branchId);
}

export async function getEquipment(id: string): Promise<Equipment | undefined> {
  return equipment.find((e) => e.id === id);
}

// Adds new equipment or replaces the one with the same id.
export async function saveEquipment(item: Equipment): Promise<void> {
  const i = equipment.findIndex((e) => e.id === item.id);
  equipment = i === -1 ? [...equipment, item] : equipment.map((e) => (e.id === item.id ? item : e));
}

export async function removeEquipment(id: string): Promise<void> {
  equipment = equipment.filter((e) => e.id !== id);
}
