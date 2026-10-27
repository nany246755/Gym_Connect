
import { mockUser } from '@/data/mock-user';
import { initials } from '@/logic/profile';
import type { WeekDay } from '@/types/user';

import type { GymMember, TrainingDay, TrainingStyle, TrainingTime } from './types';

// The id stays 'member-aj' because the Messages mock data is keyed by it.
export const CURRENT_MEMBER_ID = 'member-aj';
export const CURRENT_BRANCH_ID = mockUser.homeBranchId;

const DAY_NAMES: Record<WeekDay, TrainingDay> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

// Profile styles Partners has no name for count as Functional.
const PARTNER_STYLES: TrainingStyle[] = ['Strength', 'Bodybuilding', 'Powerlifting', 'Cardio', 'Functional'];
const profileStyles = mockUser.trainingStyles.map((style) =>
  PARTNER_STYLES.includes(style as TrainingStyle) ? (style as TrainingStyle) : 'Functional',
);

// Morning before 12:00, Afternoon before 17:00, otherwise Evening.
function timeOfDay(from: string): TrainingTime {
  const hour = Number(from.slice(0, 2));
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

// The signed-in member, read from the same mock user as My Profile.
export const currentMember: GymMember = {
  id: CURRENT_MEMBER_ID,
  name: mockUser.fullName,
  initials: initials(mockUser.fullName),
  branchId: CURRENT_BRANCH_ID,
  fitnessLevel: mockUser.fitnessLevel,
  trainingStyles: [...new Set(profileStyles)],
  schedule: {
    days: mockUser.scheduleDays.map((day) => DAY_NAMES[day]),
    preferredTime: timeOfDay(mockUser.scheduleFrom),
  },
  bio: 'Looking for consistent training partners.',
  discoverable: mockUser.visibleInSearch,
};

export const mockMembers: GymMember[] = [
  {
    id: 'member-jordan',
    name: 'Jordan Lee',
    initials: 'JL',
    branchId: 'branch-001', // New Cairo
    fitnessLevel: 'Advanced',
    trainingStyles: ['Strength'],
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      preferredTime: 'Evening',
    },
    bio: 'Focused on strength, good form, and helping each other progress.',
    discoverable: true,
  },
  {
    id: 'member-maya',
    name: 'Maya Brooks',
    initials: 'MB',
    branchId: 'branch-001', // New Cairo
    fitnessLevel: 'Intermediate',
    trainingStyles: ['Bodybuilding'],
    schedule: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      preferredTime: 'Morning',
    },
    bio: 'Enjoys hypertrophy training and consistent gym routines.',
    discoverable: true,
  },
  {
    id: 'member-omar',
    name: 'Omar Hassan',
    initials: 'OH',
    branchId: 'branch-001', // New Cairo
    fitnessLevel: 'Intermediate',
    trainingStyles: ['Strength', 'Bodybuilding'],
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      preferredTime: 'Evening',
    },
    bio: 'Looking for a reliable workout partner for strength sessions.',
    discoverable: true,
  },
  {
    id: 'member-sarah',
    name: 'Sarah Ahmed',
    initials: 'SA',
    branchId: 'branch-001', // New Cairo
    fitnessLevel: 'Beginner',
    trainingStyles: ['Functional', 'Cardio'],
    schedule: {
      days: ['Sunday', 'Tuesday', 'Thursday'],
      preferredTime: 'Evening',
    },
    bio: 'Building a healthy routine and looking for motivation.',
    discoverable: true,
  },
  {
    id: 'member-alex',
    name: 'Alex Rivera',
    initials: 'AR',
    branchId: 'branch-001', // New Cairo
    fitnessLevel: 'Advanced',
    trainingStyles: ['Powerlifting', 'Strength'],
    schedule: {
      days: ['Saturday', 'Monday', 'Wednesday'],
      preferredTime: 'Afternoon',
    },
    bio: 'Powerlifting enthusiast who enjoys structured workouts.',
    discoverable: true,
  },
  {
    id: 'member-nour',
    name: 'Nour Ibrahim',
    initials: 'NI',
    branchId: 'branch-004', // Maadi
    fitnessLevel: 'Intermediate',
    trainingStyles: ['Cardio', 'Functional'],
    schedule: {
      days: ['Sunday', 'Tuesday', 'Thursday'],
      preferredTime: 'Morning',
    },
    bio: 'Enjoys group workouts and functional training.',
    discoverable: true,
  },
  {
    id: 'member-lina',
    name: 'Lina Samir',
    initials: 'LS',
    branchId: 'branch-001', // New Cairo
    fitnessLevel: 'Beginner',
    trainingStyles: ['Cardio'],
    schedule: {
      days: ['Monday', 'Wednesday'],
      preferredTime: 'Morning',
    },
    bio: 'Prefers to train privately.',
    discoverable: false,
  },
];
