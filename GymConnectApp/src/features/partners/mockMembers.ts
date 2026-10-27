
import type { GymMember } from './types';

export const CURRENT_MEMBER_ID = 'member-aj';
export const CURRENT_BRANCH_ID = 'midtown';

export const currentMember: GymMember = {
  id: CURRENT_MEMBER_ID,
  name: 'Alex Johnson',
  initials: 'AJ',
  branchId: CURRENT_BRANCH_ID,
  fitnessLevel: 'Intermediate',
  trainingStyles: ['Strength', 'Bodybuilding'],
  schedule: {
    days: ['Monday', 'Wednesday', 'Friday'],
    preferredTime: 'Evening',
  },
  bio: 'Looking for consistent training partners.',
  discoverable: true,
};

export const mockMembers: GymMember[] = [
  {
    id: 'member-jordan',
    name: 'Jordan Lee',
    initials: 'JL',
    branchId: 'midtown',
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
    branchId: 'midtown',
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
    branchId: 'midtown',
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
    branchId: 'midtown',
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
    branchId: 'midtown',
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
    branchId: 'downtown',
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
    branchId: 'midtown',
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
