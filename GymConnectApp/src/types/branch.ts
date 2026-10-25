
import type { ImageSourcePropType } from 'react-native';

export type Branch = {
  id: string;
  name: string;
  location: string;

  operatingHours: string;
  openingTime: string;
  closingTime: string;

  checkedInCount: number;
  isPreferred: boolean;
  image?: ImageSourcePropType;
};

// Includes the calculated availability status.
export type BranchWithStatus = Branch & {
  isOpen: boolean;
};
