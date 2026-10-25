import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { countByStatus, filterEquipment, resetToAvailable, type StatusFilter } from '@/logic/equipment';
import { getBranches } from '@/services/branch-service';
import { listEquipment, removeEquipment, saveEquipment } from '@/services/equipment-service';
import type { Branch } from '@/types/branch';
import type { Equipment } from '@/types/equipment';

// ViewModel for Admin Equipment Management — inventory (FR-10).
export function useEquipmentInventory() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [items, setItems] = useState<Equipment[]>([]);
  const [status, setStatus] = useState<StatusFilter>('All');
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBranches()
      .then((list) => {
        setBranches(list);
        setBranchId(list[0]?.id ?? null);
      })
      .catch(() => setError('Could not load branches.'));
  }, []);

  const reload = useCallback(async () => {
    if (!branchId) return;
    try {
      setItems(await listEquipment(branchId));
      setNow(new Date());
      setError(null);
    } catch {
      setError('Could not load equipment.');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // Reload on branch change and whenever the screen comes back into view (after add / edit).
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const run = async (action: () => Promise<void>, failure: string) => {
    try {
      await action();
      await reload();
    } catch {
      setError(failure);
    }
  };

  return {
    data: {
      branches,
      branch: branches.find((b) => b.id === branchId),
      items: filterEquipment(items, status, query, now),
      total: items.length,
      counts: countByStatus(items),
      status,
      query,
      now,
    },
    loading,
    error,
    setBranch: (id: string) => {
      setBranchId(id);
      setStatus('All');
      setQuery('');
    },
    setStatus,
    setQuery,
    reset: (item: Equipment) => run(() => saveEquipment(resetToAvailable(item)), 'Could not reset the status.'),
    remove: (item: Equipment) => run(() => removeEquipment(item.id), 'Could not remove the equipment.'),
  };
}
