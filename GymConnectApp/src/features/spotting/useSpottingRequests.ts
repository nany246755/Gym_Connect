
import { useEffect, useState } from 'react';

import { mockUser } from '@/data/mock-user';
import { firstName } from '@/logic/dashboard';

import type {
  CancellationReason,
  SpottingRequest,
} from './types';

const REQUEST_DURATION = 2 * 60 * 1000;
// The signed-in member's home branch, from the same mock user as My Profile.
const CURRENT_BRANCH_ID = mockUser.homeBranchId;

// 'member-2' is the signed-in member (shown by their first name); Omar is the test member.
export const DEMO_MEMBERS = {
  'member-2': firstName(mockUser.fullName),
  'member-omar': 'Omar',
};

type DemoMemberId = keyof typeof DEMO_MEMBERS;

export function useSpottingRequests() {
  const [currentUserId, setCurrentUserId] =
    useState<DemoMemberId>('member-2');

  // One temporary request from Omar.
  const [requests, setRequests] = useState<SpottingRequest[]>(() => {
    const createdAt = Date.now();

    return [{
      id: 'demo-omar-request',
      requesterId: 'member-omar',
      requesterName: 'Omar',
      branchId: CURRENT_BRANCH_ID,
      exercise: 'Bench Press',
      equipmentId: 'bench-03',
      location: 'Bench 03 · Strength Floor',
      weightKg: 80,
      createdAt,
      expiresAt: createdAt + REQUEST_DURATION,
      status: 'pending',
    }];
  });

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();

      setNow(currentTime);

      setRequests(previous =>
        previous.map(request =>
          request.status === 'pending' &&
          request.expiresAt <= currentTime
            ? { ...request, status: 'expired' }
            : request
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      request.branchId === CURRENT_BRANCH_ID &&
      request.status === 'pending' &&
      request.expiresAt > now
  );

  function createRequest(
    exercise: string,
    location: string,
    weightKg?: number,
    equipmentId?: string
  ): boolean {
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
      requesterName: DEMO_MEMBERS[currentUserId],
      branchId: CURRENT_BRANCH_ID,
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
    const currentTime = Date.now();

    setRequests(previous =>
      previous.map(request =>
        request.id === id &&
        request.status === 'pending' &&
        request.expiresAt > currentTime &&
        request.branchId === CURRENT_BRANCH_ID &&
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
