// One line in a branch's live activity feed on the Member Dashboard.
// UI phase only: with Firebase these come from spotRequests, equipment and checkIns changes.
export const ACTIVITY_KINDS = ['SpotRequest', 'EquipmentFree', 'CheckIn'] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export type BranchActivity = {
  id: string;
  branchId: string; // branches/{branchId}
  kind: ActivityKind;
  text: string;
  at: string; // ISO date
};
