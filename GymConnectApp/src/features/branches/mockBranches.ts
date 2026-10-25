
import type { Branch } from '@/types/branch';

export const mockBranches: Branch[] = [
  {
    id: 'branch-001',
    name: 'New Cairo Branch',
    location: 'Fifth Settlement, New Cairo',

    operatingHours: '6:00 AM – 12:00 AM',
    openingTime: '06:00',
    closingTime: '00:00',

    checkedInCount: 24,
    isPreferred: true,

    image: require('../../../assets/images/New Cairo Branch.png'),
  },

  {
    id: 'branch-002',
    name: 'Nasr City Branch',
    location: 'Nasr City, Cairo',

    operatingHours: '6:00 AM – 11:00 PM',
    openingTime: '06:00',
    closingTime: '23:00',

    checkedInCount: 18,
    isPreferred: false,

    image: require('../../../assets/images/Nasr City Branch.png'),
  },

  {
    id: 'branch-003',
    name: 'Sheikh Zayed Branch',
    location: 'Sheikh Zayed, Giza',

    operatingHours: '7:00 AM – 10:00 PM',
    openingTime: '07:00',
    closingTime: '22:00',

    checkedInCount: 32,
    isPreferred: false,

    image: require('../../../assets/images/Sheikh Zayed Branch.png'),
  },

  {
    id: 'branch-004',
    name: 'Maadi Branch',
    location: 'Maadi, Cairo',

    operatingHours: '6:00 AM – 11:00 PM',
    openingTime: '06:00',
    closingTime: '23:00',

    checkedInCount: 15,
    isPreferred: false,

    image: require('../../../assets/images/Maadi Branch.png'),
  },
];
