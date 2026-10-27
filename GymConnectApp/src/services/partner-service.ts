import { mockMembers } from '@/features/partners/mockMembers';

import { mockUser } from '@/data/mock-user';
import type { PartnerConnection } from '@/features/partners/types';
import { createSessionStore } from '@/services/session-store';

// Mock repository boundary. Replace this implementation when a backend is added.
export function listPartnerMembers() {
  return mockMembers;
}

export const partnerConnections = createSessionStore<PartnerConnection[]>(() => {
  const CURRENT_MEMBER_ID = mockUser.id;

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
