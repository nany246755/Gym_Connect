import { calculateCompatibility } from '@/logic/partner-matching';

import { useMemo, useState } from 'react';

import { useBranch } from '@/context/BranchContext';
import { getBranchName } from '@/services/branch-service';
import { useSavedProfile } from '@/hooks/use-saved-profile';
import { toPartnerMember } from '@/logic/partner-profile';
import { useSessionStore } from '@/hooks/use-session-store';
import { partnerConnections, listPartnerMembers } from '@/services/partner-service';

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

export function usePartners() {
  const profile = useSavedProfile();
  const { preferredBranchId } = useBranch();
  const branchName = getBranchName(preferredBranchId);
  const currentMember = useMemo(() => toPartnerMember(profile), [profile]);
  const CURRENT_MEMBER_ID = profile.id;
  const CURRENT_BRANCH_ID = profile.homeBranchId;
  const [filters, setFilters] =
    useState<PartnerFilters>(DEFAULT_FILTERS);

  const [connections, setConnections] = useSessionStore(partnerConnections);

  // Discover members at the correct branch.
  const discoverableMembers = useMemo(() => {
    return listPartnerMembers().filter(member =>
      member.id !== CURRENT_MEMBER_ID &&
      member.branchId === CURRENT_BRANCH_ID &&
      member.discoverable
    );
  }, [CURRENT_MEMBER_ID, CURRENT_BRANCH_ID]);

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
        compatibilityScore: calculateCompatibility(member, currentMember),
      }))
      .sort(
        (a, b) =>
          b.compatibilityScore - a.compatibilityScore
      );
  }, [discoverableMembers, filters, currentMember]);

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

    return listPartnerMembers().find(member => member.id === memberId);
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
    branchName,
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
