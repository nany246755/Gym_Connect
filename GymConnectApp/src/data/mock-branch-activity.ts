import type { BranchActivity } from '@/types/branch-activity';

// UI-phase mock feed. Times are relative to app start so "Just now / 2 min ago" stay realistic.
const minutesAgo = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

export const mockBranchActivity: BranchActivity[] = [
  // New Cairo
  {
    id: 'a-nc-1',
    branchId: 'branch-001',
    kind: 'SpotRequest',
    text: '3 new spot requests',
    at: minutesAgo(0)
  },
  {
    id: 'a-nc-2',
    branchId: 'branch-001',
    kind: 'EquipmentFree',
    text: 'Bench Press (Rack 02) is now available',
    at: minutesAgo(2)
  },
  {
    id: 'a-nc-3',
    branchId: 'branch-001',
    kind: 'CheckIn',
    text: 'Omar H. checked in',
    at: minutesAgo(5)
  },

  // Nasr City
  {
    id: 'a-ns-1',
    branchId: 'branch-002',
    kind: 'CheckIn',
    text: 'Sara M. checked in',
    at: minutesAgo(1)
  },
  {
    id: 'a-ns-2',
    branchId: 'branch-002',
    kind: 'EquipmentFree',
    text: 'Seated Row (Station 03) is now available',
    at: minutesAgo(6)
  },
  {
    id: 'a-ns-3',
    branchId: 'branch-002',
    kind: 'SpotRequest',
    text: '1 new spot request',
    at: minutesAgo(9)
  },

  // Sheikh Zayed
  {
    id: 'a-sz-1',
    branchId: 'branch-003',
    kind: 'SpotRequest',
    text: '2 new spot requests',
    at: minutesAgo(0)
  },
  {
    id: 'a-sz-2',
    branchId: 'branch-003',
    kind: 'CheckIn',
    text: 'Ali K. checked in',
    at: minutesAgo(4)
  },
  {
    id: 'a-sz-3',
    branchId: 'branch-003',
    kind: 'EquipmentFree',
    text: 'Rowing Machine (Row C · 2) is now available',
    at: minutesAgo(12)
  },

  // Maadi
  {
    id: 'a-ma-1',
    branchId: 'branch-004',
    kind: 'EquipmentFree',
    text: 'Spin Bike (Row A · 2) is now available',
    at: minutesAgo(3)
  },
  {
    id: 'a-ma-2',
    branchId: 'branch-004',
    kind: 'CheckIn',
    text: 'Nour A. checked in',
    at: minutesAgo(8)
  },
];
