
import { useFocusEffect } from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { MUSCLE_LABEL } from '@/logic/equipment';
import { getBranches } from '@/services/branch-service';
import { listEquipment } from '@/services/equipment-service';
import type { Equipment } from '@/types/equipment';

// Represents one gym zone and its equipment.
export type EquipmentZone = {
  name: string;
  items: Equipment[];
};

// Preferred zone order in the Equipment Availability screen.
const ZONE_ORDER = [
  'Strength',
  'Cardio',
  'Free weights',
];

// NEW: Remember filters during the current app session.
// This survives unmounting and remounting the Equipment screen.
// It does not permanently save preferences to AsyncStorage.
type EquipmentFilters = {
  branchId: string | null;
  selectedZone: string;
  searchQuery: string;
};

let savedFilters: EquipmentFilters | null = null;

function getInitialFilters(
  branchId: string | null
): EquipmentFilters {
  if (
    branchId &&
    savedFilters?.branchId === branchId
  ) {
    return savedFilters;
  }

  return {
    branchId,
    selectedZone: 'All',
    searchQuery: '',
  };
}

export function useMemberEquipment(
  branchId: string | null
) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: Search and category are managed together.
  const [filters, setFilters] = useState<EquipmentFilters>(
    () => getInitialFilters(branchId)
  );

  // When a different branch becomes active, restore its
  // matching session state if it is the remembered branch.
  // Otherwise, reset both filters.
  useEffect(() => {
    const next = getInitialFilters(branchId);

    if (branchId) {
      savedFilters = next;
    }

    setFilters(next);
  }, [branchId]);

  // Prevent an old branch's filters from being displayed
  // during the render immediately after a branch change.
  const currentFilters =
    filters.branchId === branchId
      ? filters
      : getInitialFilters(branchId);

  const searchQuery = currentFilters.searchQuery;
  const selectedZone = currentFilters.selectedZone;

  // NEW: Remember search immediately when the user types.
  const setSearchQuery = useCallback(
    (value: string) => {
      const current = getInitialFilters(branchId);

      const next: EquipmentFilters = {
        ...current,
        searchQuery: value,
      };

      if (branchId) {
        savedFilters = next;
      }

      setFilters(next);
    },
    [branchId]
  );

  // NEW: Remember the selected equipment category.
  const setSelectedZone = useCallback(
    (value: string) => {
      const current = getInitialFilters(branchId);

      const next: EquipmentFilters = {
        ...current,
        selectedZone: value,
      };

      if (branchId) {
        savedFilters = next;
      }

      setFilters(next);
    },
    [branchId]
  );

  // Reload equipment whenever the screen gains focus.
  // This preserves the working refresh behavior from Step 9D.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (!branchId) {
        setEquipment([]);
        setBranchName('');
        setLoading(false);
        setError(null);

        return () => {
          active = false;
        };
      }

      setLoading(true);
      setError(null);

      Promise.all([
        getBranches(),
        listEquipment(branchId),
      ])
        .then(([branches, items]) => {
          if (!active) return;

          const selectedBranch = branches.find(
            (branch) => branch.id === branchId
          );

          setBranchName(
            selectedBranch?.name ?? 'Unknown branch'
          );

          setEquipment(items);
        })
        .catch(() => {
          if (!active) return;

          setEquipment([]);
          setError('Could not load branch equipment.');
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });

      // Ignore outdated loads when the screen loses focus.
      return () => {
        active = false;
      };
    }, [branchId])
  );

  // Group equipment by zone.
  const equipmentZones = useMemo<EquipmentZone[]>(() => {
    const groups = new Map<string, Equipment[]>();

    for (const item of equipment) {
      const existing = groups.get(item.zone);

      if (existing) {
        existing.push(item);
      } else {
        groups.set(item.zone, [item]);
      }
    }

    return Array.from(groups, ([name, items]) => ({
      name,
      items,
    }));
  }, [equipment]);

  // Generate category filters using existing equipment zones.
  const availableZones = useMemo(() => {
    const names = equipmentZones.map(
      (zone) => zone.name
    );

    return names.sort((a, b) => {
      const indexA = ZONE_ORDER.indexOf(a);
      const indexB = ZONE_ORDER.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return a.localeCompare(b);
    });
  }, [equipmentZones]);

  // Ensure the selected zone exists in this branch.
  const activeZone =
    selectedZone === 'All' ||
    availableZones.includes(selectedZone)
      ? selectedZone
      : 'All';

  // Apply search and category filters together.
  const filteredZones = useMemo<EquipmentZone[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    return equipmentZones
      .filter(
        (zone) =>
          activeZone === 'All' ||
          zone.name === activeZone
      )
      .map((zone) => ({
        name: zone.name,
        items: zone.items.filter((item) => {
          if (!query) return true;

          const searchableText = [
            item.name,
            item.station,
            item.zone,
            MUSCLE_LABEL[item.muscleGroup],
          ]
            .join(' ')
            .toLowerCase();

          return searchableText.includes(query);
        }),
      }))
      .filter((zone) => zone.items.length > 0);
  }, [equipmentZones, activeZone, searchQuery]);

  // Count equipment matching both filters.
  const visibleEquipmentCount = filteredZones.reduce(
    (total, zone) => total + zone.items.length,
    0
  );

  return {
    equipment,
    equipmentZones,
    filteredZones,
    availableZones,
    selectedZone: activeZone,
    setSelectedZone,
    searchQuery,
    setSearchQuery,
    visibleEquipmentCount,
    branchName,
    loading,
    error,
  };
}
