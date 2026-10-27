import { mockUser } from '@/data/mock-user';
import type { SpottingRequest } from '@/features/spotting/types';
import { createSessionStore } from '@/services/session-store';

export const REQUEST_DURATION = 2 * 60 * 1000;
export const spottingRequests = createSessionStore<SpottingRequest[]>(() => {
  const CURRENT_BRANCH_ID = mockUser.homeBranchId;

  const createdAt = Date.now();

  return [{
    id: 'demo-omar-request',
    requesterId: 'member-omar',
    requesterName: 'Omar',
    branchId: CURRENT_BRANCH_ID,
    exercise: 'Bench Press',
    equipmentId: 'bench-03',
    location: 'Bench 03 · Strength Floor',
    weightKg: 80,
    createdAt,
    expiresAt: createdAt + REQUEST_DURATION,
    status: 'pending',
  }];

});
