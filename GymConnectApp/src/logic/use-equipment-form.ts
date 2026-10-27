
import { useEffect, useState } from 'react';

import {
  commonZones,
  validateEquipment,
  withStatus,
} from '@/logic/equipment';

import { getBranches } from '@/services/branch-service';

import {
  getEquipment,
  listEquipment,
  saveEquipment,
} from '@/services/equipment-service';

import type { Branch } from '@/types/branch';

import type {
  Equipment,
  EquipmentFloorPlacement,
  EquipmentStatus,
  MuscleGroup,
} from '@/types/equipment';

// Admin Equipment Management ViewModel.
// Handles adding, editing, validation and floor positions.

const FLOOR_COLUMNS = 4;
const MAX_FLOOR_ROWS = 24;
const MAX_ROW_SPAN = 6;

// Check whether two floor rectangles overlap.
function positionsOverlap(
  a: EquipmentFloorPlacement,
  b: EquipmentFloorPlacement
): boolean {
  const aRowSpan = a.rowSpan ?? 1;
  const aColumnSpan = a.columnSpan ?? 1;

  const bRowSpan = b.rowSpan ?? 1;
  const bColumnSpan = b.columnSpan ?? 1;

  const rowsOverlap =
    a.row < b.row + bRowSpan &&
    a.row + aRowSpan > b.row;

  const columnsOverlap =
    a.column < b.column + bColumnSpan &&
    a.column + aColumnSpan > b.column;

  return rowsOverlap && columnsOverlap;
}

// Validate the position against our four-column floor.
function isValidFloorPlacement(
  position: EquipmentFloorPlacement
): boolean {
  const rowSpan = position.rowSpan ?? 1;
  const columnSpan = position.columnSpan ?? 1;

  return (
    Number.isInteger(position.row) &&
    Number.isInteger(position.column) &&
    Number.isInteger(rowSpan) &&
    Number.isInteger(columnSpan) &&
    position.row >= 1 &&
    position.column >= 1 &&
    rowSpan >= 1 &&
    columnSpan >= 1 &&
    rowSpan <= MAX_ROW_SPAN &&
    position.row + rowSpan - 1 <= MAX_FLOOR_ROWS &&
    position.column + columnSpan - 1 <= FLOOR_COLUMNS
  );
}

export function useEquipmentForm(
  id?: string,
  branchId?: string
) {
  const [item, setItem] = useState<Equipment | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchIds, setBranchIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the branches and existing equipment.
  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    Promise.all([
      getBranches(),
      id
        ? getEquipment(id)
        : Promise.resolve(undefined),
    ])
      .then(([list, existing]) => {
        if (!active) return;

        setBranches(list);

        if (id && !existing) {
          setError('This equipment no longer exists.');
          return;
        }

        const branch =
          list.find((b) => b.id === branchId) ??
          list[0];

        if (!branch) {
          setError('No branches are available.');
          return;
        }

        setBranchIds([
          existing?.branchId ?? branch.id,
        ]);

        setItem(
          existing ?? {
            id: `eq-${Date.now()}`,
            branchId: branch.id,
            name: '',
            zone: branch.zones[0] ?? '',
            station: '',
            muscleGroup: 'Chest',
            units: 1,
            status: 'Available',
          }
        );
      })
      .catch(() => {
        if (active) {
          setError('Could not load the equipment.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, branchId]);

  // Update one equipment record in form state.
  const edit = (
    change: (equipment: Equipment) => Equipment
  ) => {
    setItem((current) =>
      current ? change(current) : current
    );
  };

  // Maintain valid branch ordering and zones.
  const chooseBranches = (ids: string[]) => {
    if (ids.length === 0) return;

    const ordered = branches
      .map((branch) => branch.id)
      .filter((id) => ids.includes(id));

    const zones = commonZones(branches, ordered);

    setBranchIds(ordered);

    edit((equipment) => ({
      ...equipment,
      branchId: ordered[0],
      zone: zones.includes(equipment.zone)
        ? equipment.zone
        : zones[0] ?? '',
    }));
  };

  // NEW: Turn floor positioning on or off.
  // Turning it off removes the optional placement.
  const setFloorPlacementEnabled = (enabled: boolean) => {
    edit((equipment) => ({
      ...equipment,
      floorPlacement: enabled
        ? equipment.floorPlacement ?? {
            row: 1,
            column: 1,
            rowSpan: 1,
            columnSpan: 1,
          }
        : undefined,
    }));
  };

  // NEW: Update a numerical floor-position field.
  // Keep positions within our supported floor dimensions.
  const setFloorPlacementField = (
    field: keyof EquipmentFloorPlacement,
    value: number
  ) => {
    if (!Number.isFinite(value)) return;

    edit((equipment) => {
      if (!equipment.floorPlacement) {
        return equipment;
      }

      const current = equipment.floorPlacement;

      const next: EquipmentFloorPlacement = {
        ...current,
        [field]: Math.trunc(value),
      };

      const rowSpan = Math.max(
        1,
        Math.min(MAX_ROW_SPAN, next.rowSpan ?? 1)
      );

      const columnSpan = Math.max(
        1,
        Math.min(FLOOR_COLUMNS, next.columnSpan ?? 1)
      );

      next.rowSpan = rowSpan;
      next.columnSpan = columnSpan;

      // Keep the starting coordinates inside the floor.
      next.row = Math.max(
        1,
        Math.min(MAX_FLOOR_ROWS - rowSpan + 1, next.row)
      );

      next.column = Math.max(
        1,
        Math.min(FLOOR_COLUMNS - columnSpan + 1, next.column)
      );

      return {
        ...equipment,
        floorPlacement: next,
      };
    });
  };

  const errors = item
    ? validateEquipment(item)
    : {};

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

    // Existing equipment editing.
    setName: (name: string) =>
      edit((equipment) => ({
        ...equipment,
        name,
      })),

    setStation: (station: string) =>
      edit((equipment) => ({
        ...equipment,
        station,
      })),

    setZone: (zone: string) =>
      edit((equipment) => ({
        ...equipment,
        zone,
      })),

    // Existing branch-selection behavior.
    toggleBranch: (toggled: string) =>
      chooseBranches(
        !id && branchIds.includes(toggled)
          ? branchIds.filter(
              (branch) => branch !== toggled
            )
          : id
            ? [toggled]
            : [...branchIds, toggled]
      ),

    toggleAllBranches: () =>
      chooseBranches(
        branchIds.length === branches.length
          ? [branches[0].id]
          : branches.map((branch) => branch.id)
      ),

    setMuscleGroup: (muscleGroup: MuscleGroup) =>
      edit((equipment) => ({
        ...equipment,
        muscleGroup,
      })),

    setStatus: (status: EquipmentStatus) =>
      edit((equipment) =>
        withStatus(equipment, status, new Date())
      ),

    // NEW: Floor-positioning actions for the Admin UI.
    setFloorPlacementEnabled,
    setFloorPlacementField,

    // Save equipment and its optional floor position.
    save: async (): Promise<boolean> => {
      setShowErrors(true);
      setError(null);

      if (!item || Object.keys(errors).length > 0) {
        return false;
      }

      if (branchIds.length === 0) {
        setError('Choose at least one branch.');
        return false;
      }

      const placement = item.floorPlacement;

      // Validate floor dimensions.
      if (
        placement &&
        !isValidFloorPlacement(placement)
      ) {
        setError(
          'Invalid floor position. Check the row, column and tile size.'
        );
        return false;
      }

      setSaving(true);

      try {
        // Determine which branch records will be saved.
        const targetBranches = id
          ? [item.branchId]
          : branchIds;

        // NEW: Check all branch layouts BEFORE saving.
        // This avoids partially saving a multi-branch form
        // if a placement conflicts with existing equipment.
        if (placement) {
          for (const targetBranchId of targetBranches) {
            const existingEquipment =
              await listEquipment(targetBranchId);

            const targetEquipmentId = id
              ? item.id
              : `${item.id}-${targetBranchId}`;

            const conflict = existingEquipment.find(
              (other) =>
                other.id !== targetEquipmentId &&
                other.floorPlacement !== undefined &&
                positionsOverlap(
                  placement,
                  other.floorPlacement
                )
            );

            if (conflict) {
              const branch = branches.find(
                (b) => b.id === targetBranchId
              );

              setError(
                `Floor position overlaps with ${conflict.name} at ${branch?.name ?? 'the selected branch'}.`
              );

              return false;
            }
          }
        }

        const clean = {
          ...item,
          name: item.name.trim(),
          station: item.station.trim(),
        };

        // Preserve existing sequential multi-branch saving.
        for (const targetBranchId of targetBranches) {
          await saveEquipment(
            id
              ? clean
              : {
                  ...clean,
                  id: `${item.id}-${targetBranchId}`,
                  branchId: targetBranchId,
                }
          );
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
