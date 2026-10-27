import type { GymMember } from '@/features/partners/types';

// Calculate compatibility between two members.
export function calculateCompatibility(
  member: GymMember,
  currentMember: GymMember
): number {
  let score = 0;

  // Training style: maximum 35 points.
  const sharedStyles = member.trainingStyles.filter(style =>
    currentMember.trainingStyles.includes(style)
  );

  if (sharedStyles.length > 0) {
    score += 35;
  }

  // Training time: maximum 20 points.
  if (
    member.schedule.preferredTime ===
    currentMember.schedule.preferredTime
  ) {
    score += 20;
  }

  // Training days: maximum 20 points.
  const sharedDays = member.schedule.days.filter(day =>
    currentMember.schedule.days.includes(day)
  );

  const totalDays = new Set([
    ...member.schedule.days,
    ...currentMember.schedule.days,
  ]).size;

  if (totalDays > 0) {
    score += Math.round((sharedDays.length / totalDays) * 20);
  }

  // Fitness level: maximum 25 points.
  if (member.fitnessLevel === currentMember.fitnessLevel) {
    score += 25;
  } else {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    const memberLevel = levels.indexOf(member.fitnessLevel);
    const currentLevel = levels.indexOf(currentMember.fitnessLevel);

    if (Math.abs(memberLevel - currentLevel) === 1) {
      score += 15;
    }
  }

  return Math.min(score, 100);
}

