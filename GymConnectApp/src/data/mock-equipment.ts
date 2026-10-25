import type { Equipment } from '@/types/equipment';

// Mock data for the UI phase (no database yet). Occupied times are relative to app start so the
// "stuck" warning always has something to show.
const minutesAgo = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

export const mockEquipment: Equipment[] = [
  // New Cairo
  { id: 'nc-bench-1', branchId: 'new-cairo', name: 'Bench Press', zone: 'Strength', station: 'Rack 02', muscleGroup: 'Chest', units: 1, status: 'Occupied', occupiedBy: 'user-omar', occupiedAt: minutesAgo(138) },
  { id: 'nc-lat-1', branchId: 'new-cairo', name: 'Lat Pulldown', zone: 'Strength', station: 'Station 05', muscleGroup: 'Back', units: 1, status: 'Available' },
  { id: 'nc-squat-1', branchId: 'new-cairo', name: 'Squat Rack', zone: 'Strength', station: 'Rack 01', muscleGroup: 'Legs', units: 1, status: 'Occupied', occupiedBy: 'user-sara', occupiedAt: minutesAgo(25) },
  { id: 'nc-cable-1', branchId: 'new-cairo', name: 'Cable Machine', zone: 'Strength', station: 'Cable 01', muscleGroup: 'Back', units: 1, status: 'AvailableSoon', occupiedAt: minutesAgo(40), estimatedFreeAt: minutesAgo(-5) },
  { id: 'nc-legpress-1', branchId: 'new-cairo', name: 'Leg Press', zone: 'Strength', station: 'Station 04', muscleGroup: 'Legs', units: 1, status: 'Available' },
  { id: 'nc-smith-1', branchId: 'new-cairo', name: 'Smith Machine', zone: 'Strength', station: 'Rack 05', muscleGroup: 'FullBody', units: 1, status: 'Maintenance' },
  { id: 'nc-db-1', branchId: 'new-cairo', name: 'Dumbbell Set', zone: 'Free weights', station: 'Rack 08', muscleGroup: 'Arms', units: 2, status: 'Available' },
  { id: 'nc-shoulder-1', branchId: 'new-cairo', name: 'Shoulder Press', zone: 'Strength', station: 'Station 07', muscleGroup: 'Shoulders', units: 1, status: 'Available' },
  { id: 'nc-tread-1', branchId: 'new-cairo', name: 'Treadmill', zone: 'Cardio', station: 'Row A · 3', muscleGroup: 'FullBody', units: 1, status: 'Occupied', occupiedBy: 'user-ali', occupiedAt: minutesAgo(12) },
  { id: 'nc-bike-1', branchId: 'new-cairo', name: 'Spin Bike', zone: 'Cardio', station: 'Row B · 1', muscleGroup: 'Legs', units: 1, status: 'AvailableSoon', occupiedAt: minutesAgo(30), estimatedFreeAt: minutesAgo(-3) },

  // Nasr City
  { id: 'ns-bench-1', branchId: 'nasr-city', name: 'Bench Press', zone: 'Strength', station: 'Rack 01', muscleGroup: 'Chest', units: 1, status: 'Available' },
  { id: 'ns-row-1', branchId: 'nasr-city', name: 'Seated Row', zone: 'Strength', station: 'Station 03', muscleGroup: 'Back', units: 1, status: 'Occupied', occupiedBy: 'user-omar', occupiedAt: minutesAgo(18) },
  { id: 'ns-db-1', branchId: 'nasr-city', name: 'Dumbbell Set', zone: 'Free weights', station: 'Rack 04', muscleGroup: 'Arms', units: 2, status: 'Available' },
  { id: 'ns-tread-1', branchId: 'nasr-city', name: 'Treadmill', zone: 'Cardio', station: 'Row A · 1', muscleGroup: 'FullBody', units: 1, status: 'Maintenance' },

  // Sheikh Zayed
  { id: 'sz-squat-1', branchId: 'sheikh-zayed', name: 'Squat Rack', zone: 'Strength', station: 'Rack 02', muscleGroup: 'Legs', units: 1, status: 'Available' },
  { id: 'sz-kettle-1', branchId: 'sheikh-zayed', name: 'Kettlebells', zone: 'Functional', station: 'Area 1', muscleGroup: 'FullBody', units: 1, status: 'Available' },
  { id: 'sz-cable-1', branchId: 'sheikh-zayed', name: 'Cable Crossover', zone: 'Strength', station: 'Cable 02', muscleGroup: 'Chest', units: 1, status: 'Occupied', occupiedBy: 'user-sara', occupiedAt: minutesAgo(150) },
  { id: 'sz-rower-1', branchId: 'sheikh-zayed', name: 'Rowing Machine', zone: 'Cardio', station: 'Row C · 2', muscleGroup: 'Back', units: 1, status: 'Available' },

  // Maadi
  { id: 'ma-bench-1', branchId: 'maadi', name: 'Incline Bench', zone: 'Strength', station: 'Rack 03', muscleGroup: 'Chest', units: 1, status: 'Available' },
  { id: 'ma-curl-1', branchId: 'maadi', name: 'Preacher Curl', zone: 'Strength', station: 'Station 02', muscleGroup: 'Arms', units: 1, status: 'AvailableSoon', occupiedAt: minutesAgo(20), estimatedFreeAt: minutesAgo(-4) },
  { id: 'ma-bike-1', branchId: 'maadi', name: 'Spin Bike', zone: 'Cardio', station: 'Row A · 2', muscleGroup: 'Legs', units: 1, status: 'Available' },
];
