// Gym Connect
// FR08 - Messages
// Messaging Feature: Data Types

// ==========================================
// MESSAGE STATUS
// ==========================================

export type MessageStatus = 'sent' | 'read';


// ==========================================
// MESSAGE
// ==========================================

export interface ChatMessage {
  id: string;

  conversationId: string;

  senderId: string;

  receiverId: string;

  text: string;

  createdAt: string;

  status: MessageStatus;
}


// ==========================================
// CONVERSATION
// ==========================================

export interface Conversation {
  id: string;

  participantIds: [string, string];

  createdAt: string;

  updatedAt: string;
}


// ==========================================
// CONVERSATION PREVIEW
// ==========================================

export interface ConversationPreview {
  conversationId: string;

  partnerId: string;

  partnerName: string;

  partnerPhoto?: string;

  lastMessage?: ChatMessage;

  unreadCount: number;

  isConnected: boolean;
}


// ==========================================
// MESSAGE INPUT
// ==========================================

export interface SendMessageInput {
  conversationId: string;

  senderId: string;

  receiverId: string;

  text: string;
}