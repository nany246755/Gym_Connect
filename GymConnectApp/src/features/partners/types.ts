
export type FitnessLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced';

export type TrainingStyle =
  | 'Strength'
  | 'Bodybuilding'
  | 'Powerlifting'
  | 'Cardio'
  | 'Functional';

export type TrainingDay =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type TrainingTime =
  | 'Morning'
  | 'Afternoon'
  | 'Evening';

export interface TrainingSchedule {
  days: TrainingDay[];
  preferredTime: TrainingTime;
}

export interface GymMember {
  id: string;
  name: string;
  initials: string;
  photoUrl?: string;

  branchId: string;
  fitnessLevel: FitnessLevel;
  trainingStyles: TrainingStyle[];
  schedule: TrainingSchedule;

  bio: string;
  discoverable: boolean;
}

export type ConnectionStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled';

export interface PartnerConnection {
  id: string;

  senderId: string;
  receiverId: string;

  status: ConnectionStatus;

  createdAt: number;
  updatedAt: number;
}

export interface PartnerFilters {
  trainingStyle: TrainingStyle | 'All';
  fitnessLevel: FitnessLevel | 'All';
  trainingDay: TrainingDay | 'All';
  trainingTime: TrainingTime | 'All';
  searchQuery: string;
}

export interface MemberMatch {
  member: GymMember;
  compatibilityScore: number;
}
