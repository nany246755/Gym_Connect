import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useBranch } from '@/context/BranchContext';
import { clockTime, firstName, greeting, scheduleLine, timeAgo } from '@/logic/dashboard';
import { countByStatus } from '@/logic/equipment';
import { initials } from '@/logic/profile';
import { getBranchActivity } from '@/services/activity-service';
import { getBranches } from '@/services/branch-service';
import { listEquipment } from '@/services/equipment-service';
import { getProfile } from '@/services/profile-service';
import type { Branch } from '@/types/branch';
import type { BranchActivity } from '@/types/branch-activity';
import type { EquipmentStatus } from '@/types/equipment';
import type { User } from '@/types/user';

// ViewModel for the Member Dashboard: greeting, check-in status, equipment counts and branch
// activity. Checking in and out happens on the Branch Selection screen.
export function useMemberDashboard() {
  const { activeCheckIn, attendanceReady, preferredBranchId } = useBranch();
  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [counts, setCounts] = useState<Record<EquipmentStatus, number> | null>(null);
  const [activity, setActivity] = useState<BranchActivity[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [error, setError] = useState<string | null>(null);

  // The checked-in branch, otherwise the member's preferred one.
  const branchId = activeCheckIn?.branchId ?? preferredBranchId;

  useEffect(() => {
    Promise.all([getProfile(), getBranches()])
      .then(([profile, list]) => {
        setUser(profile);
        setBranches(list);
      })
      .catch(() => setError('Could not load your dashboard.'));
  }, []);

  // Reload counts and activity on branch change and whenever the screen comes back into view.
  const reload = useCallback(async () => {
    try {
      const [equipment, feed] = await Promise.all([listEquipment(branchId), getBranchActivity(branchId)]);
      setCounts(countByStatus(equipment));
      setActivity(feed);
      setNow(new Date());
    } catch {
      setError('Could not load branch details.');
    }
  }, [branchId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  // Keep "2 min ago" and the greeting current while the screen stays open.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const branch = branches.find((b) => b.id === branchId);

  return {
    data: {
      greeting: user ? `${greeting(now)}, ${firstName(user.fullName)}` : '',
      schedule: user ? scheduleLine(user, now) : '',
      initials: user ? initials(user.fullName) : '',
      branch,
      checkedIn: activeCheckIn !== null,
      checkedInSince: activeCheckIn ? clockTime(activeCheckIn.checkedInAt) : null,
      counts,
      activity: activity.map((a) => ({ ...a, ago: timeAgo(a.at, now) })),
    },
    loading: !user || !branch || !counts || !attendanceReady,
    error,
  };
}
