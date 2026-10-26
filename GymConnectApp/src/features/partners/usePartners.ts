
import { useMemo, useState } from 'react';

import {
  CURRENT_BRANCH_ID,
  CURRENT_MEMBER_ID,
  currentMember,
  mockMembers,
} from './mockMembers';

import type {
  GymMember,
  MemberMatch,
  PartnerConnection,
  PartnerFilters,
} from './types';

// Default filters: show everyone at the selected branch.
const DEFAULT_FILTERS: PartnerFilters = {
  trainingStyle: 'All',
  fitnessLevel: 'All',
  trainingDay: 'All',
  trainingTime: 'All',
  searchQuery: '',
};

// Calculate compatibility between two members.
export function calculateCompatibility(
  member: GymMember
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

export function usePartners() {
  const [filters, setFilters] =
    useState<PartnerFilters>(DEFAULT_FILTERS);

  // Temporary connections for testing the three tabs.
  const [connections, setConnections] =
    useState<PartnerConnection[]>(() => {
      const now = Date.now();

      return [
        {
          id: 'connection-jordan',
          senderId: 'member-jordan',
          receiverId: CURRENT_MEMBER_ID,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'connection-alex',
          senderId: CURRENT_MEMBER_ID,
          receiverId: 'member-alex',
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'connection-maya',
          senderId: CURRENT_MEMBER_ID,
          receiverId: 'member-maya',
          status: 'accepted',
          createdAt: now,
          updatedAt: now,
        },
      ];
    });

  // Discover members at the correct branch.
  const discoverableMembers = useMemo(() => {
    return mockMembers.filter(member =>
      member.id !== CURRENT_MEMBER_ID &&
      member.branchId === CURRENT_BRANCH_ID &&
      member.discoverable
    );
  }, []);

  // Apply filters and sort by compatibility.
  const matchedMembers = useMemo<MemberMatch[]>(() => {
    const filtered = discoverableMembers.filter(member => {
      const matchesName = member.name
        .toLowerCase()
        .includes(filters.searchQuery.trim().toLowerCase());

      const matchesStyle =
        filters.trainingStyle === 'All' ||
        member.trainingStyles.includes(filters.trainingStyle);

      const matchesLevel =
        filters.fitnessLevel === 'All' ||
        member.fitnessLevel === filters.fitnessLevel;

      const matchesDay =
        filters.trainingDay === 'All' ||
        member.schedule.days.includes(filters.trainingDay);

      const matchesTime =
        filters.trainingTime === 'All' ||
        member.schedule.preferredTime === filters.trainingTime;

      return (
        matchesName &&
        matchesStyle &&
        matchesLevel &&
        matchesDay &&
        matchesTime
      );
    });

    return filtered
      .map(member => ({
        member,
        compatibilityScore: calculateCompatibility(member),
      }))
      .sort(
        (a, b) =>
          b.compatibilityScore - a.compatibilityScore
      );
  }, [discoverableMembers, filters]);

  // Requests received from other members.
  const incomingRequests = connections.filter(
    connection =>
      connection.receiverId === CURRENT_MEMBER_ID &&
      connection.status === 'pending'
  );

  // Requests sent to other members.
  const outgoingRequests = connections.filter(
    connection =>
      connection.senderId === CURRENT_MEMBER_ID &&
      connection.status === 'pending'
  );

  // Accepted workout-partner connections.
  const connectedPartners = connections.filter(
    connection =>
      connection.status === 'accepted' &&
      (
        connection.senderId === CURRENT_MEMBER_ID ||
        connection.receiverId === CURRENT_MEMBER_ID
      )
  );

  // Find a member using their ID.
  function getMember(memberId: string): GymMember | undefined {
    if (memberId === CURRENT_MEMBER_ID) {
      return currentMember;
    }

    return mockMembers.find(member => member.id === memberId);
  }

  // Find the connection between AJ and another member.
  function getConnection(memberId: string) {
    return connections.find(connection =>
      (
        connection.senderId === CURRENT_MEMBER_ID &&
        connection.receiverId === memberId
      ) ||
      (
        connection.receiverId === CURRENT_MEMBER_ID &&
        connection.senderId === memberId
      )
    );
  }

  function sendRequest(memberId: string): boolean {
    const member = getMember(memberId);

    if (
      !member ||
      memberId === CURRENT_MEMBER_ID ||
      !member.discoverable ||
      member.branchId !== CURRENT_BRANCH_ID ||
      getConnection(memberId)
    ) {
      return false;
    }

    const now = Date.now();

    const newConnection: PartnerConnection = {
      id: `connection-${now}-${Math.random()}`,
      senderId: CURRENT_MEMBER_ID,
      receiverId: memberId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    setConnections(previous => [...previous, newConnection]);

    return true;
  }

  function acceptRequest(connectionId: string) {
    setConnections(previous =>
      previous.map(connection =>
        connection.id === connectionId &&
        connection.receiverId === CURRENT_MEMBER_ID &&
        connection.status === 'pending'
          ? {
              ...connection,
              status: 'accepted',
              updatedAt: Date.now(),
            }
          : connection
      )
    );
  }

  // Declined requests disappear from the active list.
  function declineRequest(connectionId: string) {
    setConnections(previous =>
      previous.filter(connection =>
        !(
          connection.id === connectionId &&
          connection.receiverId === CURRENT_MEMBER_ID &&
          connection.status === 'pending'
        )
      )
    );
  }

  function cancelRequest(connectionId: string) {
    setConnections(previous =>
      previous.filter(connection =>
        !(
          connection.id === connectionId &&
          connection.senderId === CURRENT_MEMBER_ID &&
          connection.status === 'pending'
        )
      )
    );
  }

  function disconnectPartner(connectionId: string) {
    setConnections(previous =>
      previous.filter(connection =>
        !(
          connection.id === connectionId &&
          connection.status === 'accepted' &&
          (
            connection.senderId === CURRENT_MEMBER_ID ||
            connection.receiverId === CURRENT_MEMBER_ID
          )
        )
      )
    );
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  return {
    currentMember,
    filters,
    setFilters,
    resetFilters,

    matchedMembers,
    incomingRequests,
    outgoingRequests,
    connectedPartners,

    getMember,
    getConnection,

    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    disconnectPartner,
  };
}
