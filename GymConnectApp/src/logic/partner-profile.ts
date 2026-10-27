import { initials } from '@/logic/profile';
import type { User, WeekDay } from '@/types/user';
import type { GymMember, TrainingDay, TrainingStyle, TrainingTime } from '@/features/partners/types';

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

// Morning before 12:00, Afternoon before 17:00, otherwise Evening.
function timeOfDay(from: string): TrainingTime {
  const hour = Number(from.slice(0, 2));
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

// The signed-in member, read from the same mock user as My Profile.
export function toPartnerMember(user: User): GymMember {
  const profileStyles = user.trainingStyles.map(style => PARTNER_STYLES.includes(style as TrainingStyle) ? style as TrainingStyle : 'Functional');
  return {
    id: user.id,
    name: user.fullName,
    initials: initials(user.fullName),
    branchId: user.homeBranchId,
    fitnessLevel: user.fitnessLevel,
    trainingStyles: [...new Set(profileStyles)],
    schedule: {
      days: user.scheduleDays.map((day) => DAY_NAMES[day]),
      preferredTime: timeOfDay(user.scheduleFrom),
    },
    bio: 'Looking for consistent training partners.',
    discoverable: user.visibleInSearch,
  };
}
