import type { Branch } from '@/types/branch';
import { isBranchOpen } from '@/logic/branchAvailability';

// Reuse the Branch Selection availability calculation (Africa/Cairo timezone).
// Both Profile and Branch Selection now agree about Open / Closed status.
export function isOpenNow(
  branch: Pick<Branch, 'openingTime' | 'closingTime'>,
  now: Date,
): boolean {
  return isBranchOpen(branch.openingTime, branch.closingTime, now);
}
