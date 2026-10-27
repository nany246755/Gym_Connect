
import { mockBranches } from '@/features/branches/mockBranches';
import type { Branch } from '@/types/branch';

export function getBranchName(id?: string): string {
  return mockBranches.find(branch => branch.id === id)?.name ?? '';
}

// Mock branches for Phase 1.
// Firebase integration can replace this implementation later.
export async function getBranches(): Promise<Branch[]> {
  return mockBranches;
}
