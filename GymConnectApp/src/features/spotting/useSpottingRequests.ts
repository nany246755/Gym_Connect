
import { useEffect, useState } from 'react';

import { mockUser } from '@/data/mock-user';
import { useBranch } from '@/context/BranchContext';
import { getBranchName } from '@/services/branch-service';
import { spottingRequests, REQUEST_DURATION } from '@/services/spotting-service';
import { useSessionStore } from '@/hooks/use-session-store';
import { useSavedProfile } from '@/hooks/use-saved-profile';
import { firstName } from '@/logic/dashboard';
import { canUseSpotting, expireSpottingRequests } from '@/logic/spotting';

import type {
  CancellationReason,
  SpottingRequest,
} from './types';


// 'user-andro' is the signed-in member (shown by their first name); Omar is the test member.
export const DEMO_MEMBERS = {
  'user-andro': firstName(mockUser.fullName),
  'member-omar': 'Omar',
};

type DemoMemberId = keyof typeof DEMO_MEMBERS;

export function useSpottingRequests() {
  const profile = useSavedProfile();
  const { activeCheckIn, attendanceReady } = useBranch();
  const branchId = activeCheckIn?.branchId;
  const canRequestSpot = canUseSpotting(attendanceReady, branchId);
  const branchName = getBranchName(branchId);
  const [currentUserId, setCurrentUserId] =
    useState<DemoMemberId>('user-andro');

  const [requests, setRequests] = useSessionStore(spottingRequests);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();

      setNow(currentTime);

      setRequests(previous => expireSpottingRequests(previous, currentTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [setRequests]);

  const myActiveRequest = requests.find(
    request =>
      request.requesterId === currentUserId &&
      (
        request.status === 'pending' ||
        request.status === 'accepted'
      )
  );

  const availableRequests = requests.filter(
    request =>
      request.requesterId !== currentUserId &&
      canRequestSpot && request.branchId === branchId &&
      request.status === 'pending' &&
      request.expiresAt > now
  );

  function createRequest(
    exercise: string,
    location: string,
    weightKg?: number,
    equipmentId?: string
  ): boolean {
    if (!canRequestSpot || !branchId) return false;
    const alreadyActive = requests.some(
      request =>
        request.requesterId === currentUserId &&
        (
          request.status === 'pending' ||
          request.status === 'accepted'
        )
    );

    if (alreadyActive) return false;

    const createdAt = Date.now();

    const newRequest: SpottingRequest = {
      id: `${createdAt}-${Math.random()}`,
      requesterId: currentUserId,
      requesterName: currentUserId === profile.id ? firstName(profile.fullName) : DEMO_MEMBERS[currentUserId],
      branchId,
      exercise: exercise.trim(),
      equipmentId: equipmentId ?? location.trim(),
      location: location.trim(),
      weightKg,
      createdAt,
      expiresAt: createdAt + REQUEST_DURATION,
      status: 'pending',
    };

    setRequests(previous => [newRequest, ...previous]);

    return true;
  }

  function acceptRequest(id: string) {
    if (!canRequestSpot) return;
    const currentTime = Date.now();

    setRequests(previous =>
      previous.map(request =>
        request.id === id &&
          request.status === 'pending' &&
          request.expiresAt > currentTime &&
          request.branchId === branchId &&
          request.requesterId !== currentUserId
          ? {
            ...request,
            status: 'accepted',
            acceptedBy: currentUserId,
            acceptedAt: currentTime,
          }
          : request
      )
    );
  }

  function completeRequest(id: string) {
    const currentTime = Date.now();

    setRequests(previous =>
      previous.map(request =>
        request.id === id &&
          request.status === 'accepted' &&
          request.requesterId === currentUserId
          ? {
            ...request,
            status: 'completed',
            completedAt: currentTime,
          }
          : request
      )
    );
  }

  function cancelRequest(
    id: string,
    reason: CancellationReason
  ) {
    setRequests(previous =>
      previous.map(request =>
        request.id === id &&
          (
            request.status === 'pending' ||
            request.status === 'accepted'
          ) &&
          (
            request.requesterId === currentUserId ||
            request.acceptedBy === currentUserId
          )
          ? {
            ...request,
            status: 'cancelled',
            cancelledBy: currentUserId,
            cancellationReason: reason,
          }
          : request
      )
    );
  }

  return {
    canRequestSpot,
    attendanceReady,
    branchName,
    requests,
    now,
    currentUserId,
    setCurrentUserId,
    myActiveRequest,
    availableRequests,
    createRequest,
    acceptRequest,
    completeRequest,
    cancelRequest,
  };
}
