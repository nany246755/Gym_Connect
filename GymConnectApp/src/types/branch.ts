import type { ImageSourcePropType } from 'react-native';

// One shared Branch model for Branch Selection, Profile and Equipment.
// All identifiers use the branch-001 ... branch-004 convention.
export type Branch = {
  id: string;
  name: string;
  location: string;

  // Full street address used by the Profile screen.
  address: string;

  operatingHours: string;
  openingTime: string;
  closingTime: string;

  // Distinct measures: present now vs registered member total.
  checkedInCount: number;
  memberCount: number;

  // Equipment inventory zones available at this branch.
  zones: string[];

  // Default preference in mock data. The actual preference is derived
  // from saved Profile state by the Branch Selection screen.
  isPreferred: boolean;
  image?: ImageSourcePropType;
};

// Includes calculated availability status.
export type BranchWithStatus = Branch & {
  isOpen: boolean;
};
