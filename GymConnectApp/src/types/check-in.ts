// checkIns/{checkInId} — see CLAUDE.md §6.
export type CheckIn = {
  id: string;
  userId: string;
  branchId: string;
  checkedInAt: Date;
  checkedOutAt?: Date;
  isActive: boolean;
};
