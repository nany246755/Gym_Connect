import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockEquipment } from '@/data/mock-equipment';
import type { Equipment } from '@/types/equipment';

// shortcut: mock data + admin edits saved on this device, because there is no database in the UI
// phase. When Firebase is added, these become reads/writes on branches/{branchId}/equipment.
const KEY = 'equipment';

async function loadAll(): Promise<Equipment[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Equipment[]) : mockEquipment;
}

async function saveAll(list: Equipment[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function listEquipment(branchId: string): Promise<Equipment[]> {
  return (await loadAll()).filter((e) => e.branchId === branchId);
}

export async function getEquipment(id: string): Promise<Equipment | undefined> {
  return (await loadAll()).find((e) => e.id === id);
}

// Adds new equipment or replaces the one with the same id.
export async function saveEquipment(item: Equipment): Promise<void> {
  const list = await loadAll();
  const i = list.findIndex((e) => e.id === item.id);
  await saveAll(i === -1 ? [...list, item] : list.map((e) => (e.id === item.id ? item : e)));
}

export async function removeEquipment(id: string): Promise<void> {
  await saveAll((await loadAll()).filter((e) => e.id !== id));
}
