// branches/{branchId} — see CLAUDE.md §6.
export type Branch = {
  id: string;
  name: string;
  address: string;
  zones: string[];
  opensAt: string; // "HH:mm"
  closesAt: string; // "HH:mm"
  memberCount: number;
};
