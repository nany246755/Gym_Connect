// Gym Connect
// FR08 - Messages
// Messaging Context Provider

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { conversationStore, messageStore } from '@/services/messaging-service';
import { useSessionStore } from '@/hooks/use-session-store';

import type {
  ChatMessage,
  Conversation,
  SendMessageInput,
} from './types';

// ==========================================
// TYPES
// ==========================================

type ConnectionPair = readonly [string, string];

interface MessagingContextType {
  conversations: Conversation[];

  messages: ChatMessage[];

  isConnected: (
    firstMemberId: string,
    secondMemberId: string
  ) => boolean;

  getConversation: (
    firstMemberId: string,
    secondMemberId: string
  ) => Conversation | undefined;

  getOrCreateConversation: (
    firstMemberId: string,
    secondMemberId: string
  ) => Conversation | undefined;

  getConversationMessages: (
    conversationId: string
  ) => ChatMessage[];

  sendMessage: (
    input: SendMessageInput
  ) => boolean;

  markMessagesAsRead: (
    conversationId: string,
    recipientId: string
  ) => void;

  getUnreadCount: (
    conversationId: string,
    recipientId: string
  ) => number;

  getTotalUnreadCount: (
    memberId: string
  ) => number;
}

interface MessagingProviderProps {
  children: ReactNode;

  connectedPairs?: readonly ConnectionPair[];
}

// ==========================================
// DEMO CONNECTIONS
// ==========================================

// For now, the signed-in member (user-andro) and Maya are connected.
//
// Later, we will replace this demo data with
// the accepted connections from FR07.
//
// Do not treat this list as the final
// connection database.

const DEMO_CONNECTED_PAIRS: readonly ConnectionPair[] = [];

// ==========================================
// CONTEXT
// ==========================================

const MessagingContext =
  createContext<MessagingContextType | undefined>(
    undefined
  );

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function membersMatch(
  firstPair: readonly string[],
  secondPair: readonly string[]
): boolean {
  return (
    (firstPair[0] === secondPair[0] &&
      firstPair[1] === secondPair[1]) ||
    (firstPair[0] === secondPair[1] &&
      firstPair[1] === secondPair[0])
  );
}

// ==========================================
// PROVIDER
// ==========================================

export function MessagingProvider({
  children,
  connectedPairs = DEMO_CONNECTED_PAIRS,
}: MessagingProviderProps) {

  const [conversations, setConversations] = useSessionStore(conversationStore);
  const [messages, setMessages] = useSessionStore(messageStore);

  // ----------------------------------------
  // CHECK CONNECTION STATUS
  // ----------------------------------------

  const isConnected = useCallback(
    (
      firstMemberId: string,
      secondMemberId: string
    ): boolean => {

      if (firstMemberId === secondMemberId) {
        return false;
      }

      return connectedPairs.some((pair) =>
        membersMatch(
          pair,
          [firstMemberId, secondMemberId]
        )
      );
    },
    [connectedPairs]
  );

  // ----------------------------------------
  // FIND EXISTING CONVERSATION
  // ----------------------------------------

  const getConversation = useCallback(
    (
      firstMemberId: string,
      secondMemberId: string
    ): Conversation | undefined => {

      return conversations.find((conversation) =>
        membersMatch(
          conversation.participantIds,
          [firstMemberId, secondMemberId]
        )
      );
    },
    [conversations]
  );

  // ----------------------------------------
  // GET OR CREATE CONVERSATION
  // ----------------------------------------

  const getOrCreateConversation = useCallback(
    (
      firstMemberId: string,
      secondMemberId: string
    ): Conversation | undefined => {

      const existingConversation =
        getConversation(
          firstMemberId,
          secondMemberId
        );

      // Preserve existing history even if
      // the members are disconnected.

      if (existingConversation) {
        return existingConversation;
      }

      // New conversations require an
      // accepted workout partner connection.

      if (
        !isConnected(
          firstMemberId,
          secondMemberId
        )
      ) {
        return undefined;
      }

      const now = new Date().toISOString();

      const newConversation: Conversation = {
        id: `chat-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,

        participantIds: [
          firstMemberId,
          secondMemberId,
        ],

        createdAt: now,
        updatedAt: now,
      };

      setConversations((previous) => [
        ...previous,
        newConversation,
      ]);

      return newConversation;
    },
    [getConversation, isConnected, setConversations]
  );

  // ----------------------------------------
  // GET CONVERSATION MESSAGES
  // ----------------------------------------

  const getConversationMessages = useCallback(
    (conversationId: string): ChatMessage[] => {

      return messages
        .filter(
          (message) =>
            message.conversationId === conversationId
        )
        .sort(
          (first, second) =>
            new Date(first.createdAt).getTime() -
            new Date(second.createdAt).getTime()
        );
    },
    [messages]
  );

  // ----------------------------------------
  // SEND MESSAGE
  // ----------------------------------------

  const sendMessage = useCallback(
    (input: SendMessageInput): boolean => {

      const text = input.text.trim();

      // Empty messages are not allowed.

      if (!text) {
        return false;
      }

      const conversation = conversations.find(
        (item) =>
          item.id === input.conversationId
      );

      if (!conversation) {
        return false;
      }

      // Verify that the sender and receiver
      // belong to this conversation.

      if (
        !membersMatch(
          conversation.participantIds,
          [input.senderId, input.receiverId]
        )
      ) {
        return false;
      }

      // Messaging is only allowed between
      // currently connected members.

      if (
        !isConnected(
          input.senderId,
          input.receiverId
        )
      ) {
        return false;
      }

      const now = new Date().toISOString();

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,

        conversationId: input.conversationId,

        senderId: input.senderId,

        receiverId: input.receiverId,

        text,

        createdAt: now,

        status: 'sent',
      };

      setMessages((previous) => [
        ...previous,
        newMessage,
      ]);

      setConversations((previous) =>
        previous.map((item) =>
          item.id === input.conversationId
            ? {
              ...item,
              updatedAt: now,
            }
            : item
        )
      );

      return true;
    },
    [conversations, isConnected, setMessages, setConversations]
  );

  // ----------------------------------------
  // MARK MESSAGES AS READ
  // ----------------------------------------

  const markMessagesAsRead = useCallback(
    (
      conversationId: string,
      recipientId: string
    ): void => {

      const conversation = conversations.find(
        (item) => item.id === conversationId
      );

      if (
        !conversation ||
        !conversation.participantIds.includes(
          recipientId
        )
      ) {
        return;
      }

      setMessages((previous) =>
        previous.map((message) => {

          if (
            message.conversationId === conversationId &&
            message.receiverId === recipientId &&
            message.status === 'sent'
          ) {
            return {
              ...message,
              status: 'read',
            };
          }

          return message;
        })
      );
    },
    [conversations, setMessages]
  );

  // ----------------------------------------
  // CONVERSATION UNREAD COUNT
  // ----------------------------------------

  const getUnreadCount = useCallback(
    (
      conversationId: string,
      recipientId: string
    ): number => {

      return messages.filter(
        (message) =>
          message.conversationId === conversationId &&
          message.receiverId === recipientId &&
          message.status === 'sent'
      ).length;
    },
    [messages]
  );

  // ----------------------------------------
  // TOTAL UNREAD COUNT
  // ----------------------------------------

  const getTotalUnreadCount = useCallback(
    (memberId: string): number => {

      return messages.filter(
        (message) =>
          message.receiverId === memberId &&
          message.status === 'sent'
      ).length;
    },
    [messages]
  );

  // ----------------------------------------
  // CONTEXT VALUE
  // ----------------------------------------

  const value = useMemo<MessagingContextType>(
    () => ({
      conversations,
      messages,
      isConnected,
      getConversation,
      getOrCreateConversation,
      getConversationMessages,
      sendMessage,
      markMessagesAsRead,
      getUnreadCount,
      getTotalUnreadCount,
    }),
    [
      conversations,
      messages,
      isConnected,
      getConversation,
      getOrCreateConversation,
      getConversationMessages,
      sendMessage,
      markMessagesAsRead,
      getUnreadCount,
      getTotalUnreadCount,
    ]
  );

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useMessaging(): MessagingContextType {

  const context = useContext(MessagingContext);

  if (!context) {
    throw new Error(
      'useMessaging must be used inside MessagingProvider'
    );
  }

  return context;
}
