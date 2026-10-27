import type {
  ChatMessage,
  Conversation,
} from './types';

import { mockUser } from '@/data/mock-user';
import { firstName } from '@/logic/dashboard';

// 'member-aj' is the signed-in member from the mock user.
const me = firstName(mockUser.fullName);

// Member IDs must match
// src/features/partners/mockMembers.ts

export const mockConversations: Conversation[] = [
  {
    id: 'chat-aj-maya',
    participantIds: ['member-aj', 'member-maya'],
    createdAt: '2026-10-22T09:00:00.000Z',
    updatedAt: '2026-10-25T14:30:00.000Z',
  },
  {
    id: 'chat-aj-omar',
    participantIds: ['member-aj', 'member-omar'],
    createdAt: '2026-10-23T11:00:00.000Z',
    updatedAt: '2026-10-24T17:15:00.000Z',
  },
];

export const mockMessages: ChatMessage[] = [
  {
    id: 'msg-001',
    conversationId: 'chat-aj-maya',
    senderId: 'member-maya',
    receiverId: 'member-aj',
    text: `Hey ${me}! Are you training today?`,
    createdAt: '2026-10-25T13:00:00.000Z',
    status: 'read',
  },
  {
    id: 'msg-002',
    conversationId: 'chat-aj-maya',
    senderId: 'member-aj',
    receiverId: 'member-maya',
    text: 'Yes! Planning to train around 6 PM.',
    createdAt: '2026-10-25T13:05:00.000Z',
    status: 'read',
  },
  {
    id: 'msg-003',
    conversationId: 'chat-aj-maya',
    senderId: 'member-maya',
    receiverId: 'member-aj',
    text: 'Perfect! I have an upper-body session today.',
    createdAt: '2026-10-25T13:10:00.000Z',
    status: 'read',
  },
  {
    id: 'msg-004',
    conversationId: 'chat-aj-maya',
    senderId: 'member-maya',
    receiverId: 'member-aj',
    text: 'Want to train together?',
    createdAt: '2026-10-25T14:30:00.000Z',
    status: 'sent',
  },
  {
    id: 'msg-005',
    conversationId: 'chat-aj-omar',
    senderId: 'member-aj',
    receiverId: 'member-omar',
    text: 'Hey Omar, great workout yesterday!',
    createdAt: '2026-10-24T17:00:00.000Z',
    status: 'read',
  },
  {
    id: 'msg-006',
    conversationId: 'chat-aj-omar',
    senderId: 'member-omar',
    receiverId: 'member-aj',
    text: `Thanks ${me}! Let us train again soon.`,
    createdAt: '2026-10-24T17:15:00.000Z',
    status: 'sent',
  },
];