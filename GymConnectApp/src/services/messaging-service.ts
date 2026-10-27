import { mockConversations, mockMessages } from '@/features/messaging/mockMessages';
import { createSessionStore } from '@/services/session-store';

export const conversationStore = createSessionStore(() => [...mockConversations]);
export const messageStore = createSessionStore(() => [...mockMessages]);
