import { mockBranches } from '@/features/branches/mockBranches';
import type { User } from '@/types/user';

// Mock signed-in member for the UI phase (no database or sign-in yet).
export const mockUser: User = {
  id: 'user-andro',
  fullName: 'Andro Wageh',
  email: 'andro242576@bue.edu.eg',
  fitnessLevel: 'Intermediate',
  trainingStyles: ['Bodybuilding', 'Powerlifting'],
  scheduleDays: ['Mon', 'Wed', 'Fri'],
  scheduleFrom: '18:00',
  scheduleTo: '20:00',
  homeBranchId: 'branch-001',
  visibleInSearch: true,
  createdAt: '2026-10-01T00:00:00.000Z',
};

// Short name of the mock member's home branch, e.g. "New Cairo". Partners and Spotting show it.
export const mockUserBranchName =
  mockBranches.find((b) => b.id === mockUser.homeBranchId)?.name.replace(/ Branch$/, '') ?? '';
