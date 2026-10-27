// Member profile stored at users/{userId}.

export const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type FitnessLevel = (typeof FITNESS_LEVELS)[number];

export const TRAINING_STYLES = ['Powerlifting', 'Bodybuilding', 'Calisthenics', 'CrossFit', 'Cardio'] as const;
export type TrainingStyle = (typeof TRAINING_STYLES)[number];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export type User = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  fitnessLevel: FitnessLevel;
  trainingStyles: TrainingStyle[];
  scheduleDays: WeekDay[];
  scheduleFrom: string; // "HH:mm", 24-hour
  scheduleTo: string; // "HH:mm", 24-hour
  homeBranchId: string; // branches/{branchId}
  visibleInSearch: boolean;
  createdAt: string; // ISO date
};
