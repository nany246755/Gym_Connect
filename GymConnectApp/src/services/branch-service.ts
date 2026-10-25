import { mockBranches } from '@/data/mock-branches';
import type { Branch } from '@/types/branch';

// shortcut: mock branches for the UI phase; becomes a Firestore read of `branches` with Firebase.
export async function getBranches(): Promise<Branch[]> {
  return mockBranches;
}
