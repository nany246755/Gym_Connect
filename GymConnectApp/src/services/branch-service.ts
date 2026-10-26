
import { mockBranches } from '@/features/branches/mockBranches';
import type { Branch } from '@/types/branch';

// Mock branches for Phase 1.
// Firebase integration can replace this implementation later.
export async function getBranches(): Promise<Branch[]> {
  return mockBranches;
}
