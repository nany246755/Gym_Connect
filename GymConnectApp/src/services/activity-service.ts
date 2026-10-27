import { mockBranchActivity } from '@/data/mock-branch-activity';
import type { BranchActivity } from '@/types/branch-activity';

// shortcut: UI phase has no database, so the feed is mock data kept in memory.
// With Firebase this becomes a live listener on the branch's recent activity.
export async function getBranchActivity(branchId: string): Promise<BranchActivity[]> {
  return mockBranchActivity
    .filter((a) => a.branchId === branchId)
    .sort((a, b) => b.at.localeCompare(a.at));
}
