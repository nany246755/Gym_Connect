import type { SpottingRequest } from '@/features/spotting/types';

export function canUseSpotting(attendanceReady: boolean, branchId?: string): boolean {
  return attendanceReady && !!branchId;
}

export function expireSpottingRequests(requests: SpottingRequest[], now: number): SpottingRequest[] {
  let changed = false;
  const next = requests.map(request => {
    if (request.status !== 'pending' || request.expiresAt > now) return request;
    changed = true;
    return {
      ...request,
      status: 'expired' as const
    };
  });
  return changed ? next : requests;
}
