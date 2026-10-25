import type { Branch } from '@/types/branch';

// Mock data for the UI phase (no database yet). Same 4 branches as the Branch Selection screen —
// reuse this list there instead of making another one.
export const mockBranches: Branch[] = [
  {
    id: 'new-cairo',
    name: 'New Cairo',
    address: '90th Street, Fifth Settlement, New Cairo',
    zones: ['Strength', 'Cardio', 'Free weights'],
    opensAt: '06:00',
    closesAt: '00:00',
    memberCount: 520,
  },
  {
    id: 'nasr-city',
    name: 'Nasr City',
    address: 'Abbas El Akkad St, Nasr City, Cairo',
    zones: ['Strength', 'Cardio', 'Free weights'],
    opensAt: '06:00',
    closesAt: '23:00',
    memberCount: 420,
  },
  {
    id: 'sheikh-zayed',
    name: 'Sheikh Zayed',
    address: 'Central Axis, Sheikh Zayed, Giza',
    zones: ['Strength', 'Cardio', 'Functional'],
    opensAt: '07:00',
    closesAt: '22:00',
    memberCount: 610,
  },
  {
    id: 'maadi',
    name: 'Maadi',
    address: 'Road 9, Maadi, Cairo',
    zones: ['Strength', 'Cardio'],
    opensAt: '06:00',
    closesAt: '23:00',
    memberCount: 380,
  },
];
