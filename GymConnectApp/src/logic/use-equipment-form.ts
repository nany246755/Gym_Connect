import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';

import { commonZones, equipmentImage, validateEquipment, withStatus } from '@/logic/equipment';
import { getBranches } from '@/services/branch-service';
import { getEquipment, saveEquipment } from '@/services/equipment-service';
import type { Branch } from '@/types/branch';
import type { Equipment, EquipmentStatus, MuscleGroup } from '@/types/equipment';

// ViewModel for Admin Equipment Management — add / edit form (FR-10). No `id` means "add".
// Adding can target several branches at once: each one gets its own copy (equipment lives inside a
// branch, with its own status). Editing always changes one branch's machine.
export function useEquipmentForm(id?: string, branchId?: string) {
  const [item, setItem] = useState<Equipment | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getBranches(), id ? getEquipment(id) : Promise.resolve(undefined)])
      .then(([list, existing]) => {
        setBranches(list);
        if (id && !existing) return setError('This equipment no longer exists.');
        const branch = list.find((b) => b.id === branchId) ?? list[0];
        setBranchIds([existing?.branchId ?? branch.id]);
        setItem(
          existing ?? {
            id: `eq-${Date.now()}`,
            branchId: branch.id,
            name: '',
            zone: branch.zones[0],
            station: '',
            muscleGroup: 'Chest',
            units: 1,
            status: 'Available',
          },
        );
      })
      .catch(() => setError('Could not load the equipment.'))
      .finally(() => setLoading(false));
  }, [id, branchId]);

  const edit = (change: (e: Equipment) => Equipment) => setItem((e) => (e ? change(e) : e));

  // Keeps branch order stable and the zone valid: if a ticked branch lacks the zone, use the first shared one.
  const chooseBranches = (ids: string[]) => {
    if (ids.length === 0) return;
    const ordered = branches.map((b) => b.id).filter((b) => ids.includes(b));
    const zones = commonZones(branches, ordered);
    setBranchIds(ordered);
    edit((e) => ({ ...e, branchId: ordered[0], zone: zones.includes(e.zone) ? e.zone : zones[0] }));
  };
  const errors = item ? validateEquipment(item) : {};

  return {
    data: {
      item,
      branches,
      branchIds,
      zones: commonZones(branches, branchIds),
      // What the photo box shows: the admin's photo, else the bundled one for this name, else nothing.
      image: item ? equipmentImage(item) : undefined,
      hasOwnPhoto: !!item?.imageUrl,
      isNew: !id,
      saving,
      errors: showErrors ? errors : {},
    },
    loading,
    error,
    setName: (name: string) => edit((e) => ({ ...e, name })),
    setStation: (station: string) => edit((e) => ({ ...e, station })),
    setZone: (zone: string) => edit((e) => ({ ...e, zone })),
    // Add: tick / untick a branch (at least one stays). Edit: switch to that branch.
    toggleBranch: (toggled: string) =>
      chooseBranches(
        !id && branchIds.includes(toggled)
          ? branchIds.filter((b) => b !== toggled)
          : id
            ? [toggled]
            : [...branchIds, toggled],
      ),
    // Add only: every branch, or back to just the first one when all are already ticked.
    toggleAllBranches: () =>
      chooseBranches(branchIds.length === branches.length ? [branches[0].id] : branches.map((b) => b.id)),
    setMuscleGroup: (muscleGroup: MuscleGroup) => edit((e) => ({ ...e, muscleGroup })),
    setStatus: (status: EquipmentStatus) => edit((e) => withStatus(e, status, new Date())),
    // shortcut: keeps the photo's on-device address, so it only shows on this phone. With Firebase,
    // the service uploads it to Storage on save and stores the download URL instead.
    pickPhoto: async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        const imageUrl = result.assets[0].uri;
        edit((e) => ({ ...e, imageUrl }));
      }
    },
    // Back to the bundled photo for this machine type, or the icon.
    removePhoto: () => edit((e) => ({ ...e, imageUrl: undefined })),
    // Resolves true when saved, so the screen can go back.
    save: async (): Promise<boolean> => {
      setShowErrors(true);
      if (!item || Object.keys(errors).length > 0) return false;
      setSaving(true);
      try {
        const clean = { ...item, name: item.name.trim(), station: item.station.trim() };
        // One at a time: each save reads and rewrites the stored list.
        for (const b of id ? [item.branchId] : branchIds) {
          await saveEquipment(id ? clean : { ...clean, id: `${item.id}-${b}`, branchId: b });
        }
        return true;
      } catch {
        setError('Could not save. Try again.');
        return false;
      } finally {
        setSaving(false);
      }
    },
  };
}
