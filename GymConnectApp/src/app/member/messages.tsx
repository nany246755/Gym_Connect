import { useSavedProfile } from '@/hooks/use-saved-profile';
import { initials } from '@/logic/profile';
// Gym Connect - FR08 Messages
// Conversations List + Individual Chat
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { mockUser } from '@/data/mock-user';
import { firstName } from '@/logic/dashboard';

import {
  useMessaging,
} from '../../features/messaging/MessagingContext';

import type {
  ChatMessage,
  Conversation,
} from '../../features/messaging/types';

// ==========================================
// DESIGN SYSTEM
// ==========================================

const C = {
  midnight: '#14213D',
  marigold: '#FCA311',
  background: '#F5F6F8',
  white: '#FFFFFF',
  muted: '#788294',
  border: '#E7EAF0',
  softYellow: '#FFF4DA',
  softGray: '#EEF0F4',
};

const MEMBER_NAMES: Record<string, string> = {
  'user-andro': mockUser.fullName, // the signed-in member, same as My Profile
  'member-maya': 'Maya Brooks',
  'member-omar': 'Omar Hassan',
  'member-jordan': 'Jordan Lee',
  'member-sarah': 'Sarah Ahmed',
  'member-alex': 'Alex Rivera',
};
type DemoMemberId = 'user-andro' | 'member-maya';

interface ConversationItem {
  conversation: Conversation;
  partnerId: string;
  partnerName: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isConnected: boolean;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatTime(value?: string): string {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ==========================================
// MAIN SCREEN CONTENT
// ==========================================

function MessagesContent() {
  const profile = useSavedProfile();
  const memberName = useCallback((id: string) => id === profile.id ? profile.fullName : MEMBER_NAMES[id] ?? id, [profile.id, profile.fullName]);
  const { partnerId: requestedPartnerId } =
    useLocalSearchParams<{
      partnerId?: string;
    }>();

  const {
    conversations,
    messages,
    isConnected,
    getOrCreateConversation,
    getConversationMessages,
    getUnreadCount,
    getTotalUnreadCount,
    markMessagesAsRead,
    sendMessage,
  } = useMessaging();

  // Demo switch for testing both users.
  // We will remove this during integration.

  const [currentMemberId, setCurrentMemberId] =
    useState<DemoMemberId>('user-andro');

  const [search, setSearch] = useState('');

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [messageText, setMessageText] = useState('');

  const chatListRef = useRef<FlatList<ChatMessage>>(null);

  const handledPartnerRef = useRef<string | null>(null);

  // ==========================================
  // ==========================================
  // OPEN CHAT FROM WORKOUT PARTNERS
  // ==========================================

  useEffect(() => {
    if (
      !requestedPartnerId ||
      handledPartnerRef.current === requestedPartnerId
    ) {
      return;
    }

    // Find an existing conversation or create
    // an empty one if the members are connected.

    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const conversation = getOrCreateConversation(
        'user-andro',
        requestedPartnerId
      );

      if (!conversation) {
        return;
      }

      handledPartnerRef.current = requestedPartnerId;

      // Return to the signed-in member when opening a conversation
      // from their Workout Partners screen.

      setCurrentMemberId('user-andro');

      setSelectedConversationId(conversation.id);

      setMessageText('');
    });
    return () => {
      active = false;
    };
  }, [
    requestedPartnerId,
    getOrCreateConversation,
  ]);
  // BUILD CONVERSATION LIST
  // ==========================================

  const conversationItems = useMemo<ConversationItem[]>(
    () =>
      conversations
        .filter((conversation) =>
          conversation.participantIds.includes(
            currentMemberId
          )
        )
        .map((conversation) => {
          const partnerId =
            conversation.participantIds.find(
              (id) => id !== currentMemberId
            ) ?? '';

          const conversationMessages = messages
            .filter(
              (message) =>
                message.conversationId ===
                conversation.id
            )
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );

          return {
            conversation,
            partnerId,
            partnerName: memberName(partnerId),
            lastMessage: conversationMessages[0],
            unreadCount: getUnreadCount(
              conversation.id,
              currentMemberId
            ),
            isConnected: isConnected(
              currentMemberId,
              partnerId
            ),
          };
        })
        .sort(
          (a, b) =>
            new Date(
              b.conversation.updatedAt
            ).getTime() -
            new Date(
              a.conversation.updatedAt
            ).getTime()
        ),
    [
      conversations,
      messages,
      currentMemberId,
      getUnreadCount,
      isConnected,
      memberName,
    ]
  );

  const filteredConversations = useMemo(
    () =>
      conversationItems.filter((item) =>
        item.partnerName
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      ),
    [conversationItems, search]
  );

  const selectedConversation = conversations.find(
    (item) => item.id === selectedConversationId
  );

  const partnerId =
    selectedConversation?.participantIds.find(
      (id) => id !== currentMemberId
    ) ?? '';

  const canSend = selectedConversation
    ? isConnected(currentMemberId, partnerId)
    : false;

  const chatMessages = selectedConversationId
    ? getConversationMessages(selectedConversationId)
    : [];

  const unreadInOpenChat = selectedConversationId
    ? getUnreadCount(
      selectedConversationId,
      currentMemberId
    )
    : 0;

  // ==========================================
  // AUTOMATIC READ STATUS
  // ==========================================

  useEffect(() => {
    if (
      selectedConversationId &&
      unreadInOpenChat > 0
    ) {
      markMessagesAsRead(
        selectedConversationId,
        currentMemberId
      );
    }
  }, [
    selectedConversationId,
    currentMemberId,
    unreadInOpenChat,
    markMessagesAsRead,
  ]);

  // ==========================================
  // SCREEN ACTIONS
  // ==========================================

  function openConversation(conversationId: string) {
    setMessageText('');
    setSelectedConversationId(conversationId);
  }

  function closeConversation() {
    setSelectedConversationId(null);
    setMessageText('');
  }

  function switchDemoMember() {
    closeConversation();

    setSearch('');

    setCurrentMemberId((previous) =>
      previous === 'user-andro'
        ? 'member-maya'
        : 'user-andro'
    );
  }

  function handleSendMessage() {
    if (
      !selectedConversationId ||
      !partnerId ||
      !canSend ||
      !messageText.trim()
    ) {
      return;
    }

    const success = sendMessage({
      conversationId: selectedConversationId,
      senderId: currentMemberId,
      receiverId: partnerId,
      text: messageText,
    });

    if (success) {
      setMessageText('');
    }
  }

  // ==========================================
  // CHAT MESSAGE BUBBLE
  // ==========================================

  function renderMessage({
    item,
  }: {
    item: ChatMessage;
  }) {
    const isMine = item.senderId === currentMemberId;

    return (
      <View
        style={[
          styles.messageRow,
          isMine
            ? styles.messageRowMine
            : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine
              ? styles.bubbleMine
              : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageBody,
              isMine
                ? styles.messageBodyMine
                : styles.messageBodyOther,
            ]}
          >
            {item.text}
          </Text>

          <View style={styles.messageMeta}>
            <Text
              style={[
                styles.messageTime,
                isMine && styles.messageTimeMine,
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>

            {isMine && (
              <Text style={styles.messageStatus}>
                {item.status === 'read'
                  ? '✓✓ Read'
                  : '✓ Sent'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ==========================================
  // INDIVIDUAL CHAT SCREEN
  // ==========================================

  if (selectedConversation) {
    return (
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          {/* CHAT HEADER */}

          <View style={styles.chatHeader}>
            <Pressable
              onPress={closeConversation}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back to conversations"
            >
              <Text style={styles.backButtonText}>
                ‹
              </Text>
            </Pressable>

            <View style={styles.chatHeaderAvatar}>
              <Text style={styles.chatHeaderAvatarText}>
                {initials(memberName(partnerId))}
              </Text>
            </View>

            <View style={styles.chatHeaderDetails}>
              <Text style={styles.chatHeaderName}>
                {memberName(partnerId)}
              </Text>

              <Text style={styles.chatHeaderSubtitle}>
                {canSend
                  ? 'Connected workout partner'
                  : 'Disconnected'}
              </Text>
            </View>
          </View>

          {/* DISCONNECTED NOTICE */}

          {!canSend && (
            <View style={styles.disconnectNotice}>
              <Text style={styles.disconnectNoticeText}>
                You are no longer connected. Your chat
                history is available, but you cannot
                send new messages.
              </Text>
            </View>
          )}

          {/* CHAT MESSAGES */}

          <FlatList
            ref={chatListRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.chatList}
            contentContainerStyle={
              styles.chatListContent
            }
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              chatListRef.current?.scrollToEnd({
                animated: false,
              })
            }
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatIcon}>
                  💬
                </Text>

                <Text style={styles.emptyChatTitle}>
                  Start the conversation
                </Text>

                <Text style={styles.emptyChatDescription}>
                  {canSend
                    ? `Say hello to ${memberName(
                      partnerId
                    )}!`
                    : 'No messages in this conversation.'}
                </Text>
              </View>
            }
          />

          {/* MESSAGE COMPOSER */}

          <View style={styles.composerContainer}>
            <TextInput
              style={[
                styles.messageInput,
                !canSend && styles.disabledInput,
              ]}
              value={messageText}
              onChangeText={setMessageText}
              placeholder={
                canSend
                  ? 'Type a message...'
                  : 'Messaging unavailable'
              }
              placeholderTextColor={C.muted}
              multiline
              maxLength={1000}
              editable={canSend}
            />

            <Pressable
              onPress={handleSendMessage}
              disabled={
                !canSend || !messageText.trim()
              }
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={[
                styles.sendButton,
                (!canSend || !messageText.trim()) &&
                styles.sendButtonDisabled,
              ]}
            >
              <Text style={styles.sendButtonText}>
                ➤
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // CONVERSATION CARD
  // ==========================================

  function renderConversation({
    item,
  }: {
    item: ConversationItem;
  }) {
    const isOwnLastMessage =
      item.lastMessage?.senderId === currentMemberId;

    return (
      <Pressable
        style={styles.conversationCard}
        onPress={() =>
          openConversation(item.conversation.id)
        }
        accessibilityRole="button"
        accessibilityLabel={`Open chat with ${item.partnerName}`}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials(item.partnerName)}
          </Text>
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationTop}>
            <Text
              style={styles.conversationName}
              numberOfLines={1}
            >
              {item.partnerName}
            </Text>

            <Text style={styles.listTime}>
              {formatTime(
                item.lastMessage?.createdAt
              )}
            </Text>
          </View>

          <View style={styles.conversationBottom}>
            <Text
              style={[
                styles.messagePreview,
                item.unreadCount > 0 &&
                styles.unreadPreview,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage
                ? `${isOwnLastMessage ? 'You: ' : ''
                }${item.lastMessage.text}`
                : 'Start a conversation'}
            </Text>

            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99
                    ? '99+'
                    : item.unreadCount}
                </Text>
              </View>
            )}
          </View>

          {!item.isConnected && (
            <View style={styles.disconnectedTag}>
              <Text style={styles.disconnectedTagText}>
                Disconnected
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  // ==========================================
  // CONVERSATION LIST SCREEN
  // ==========================================

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Messages
          </Text>

          <Text style={styles.headerSubtitle}>
            Connect. Train. Grow.
          </Text>
        </View>

        <View style={styles.headerRight}>
          {getTotalUnreadCount(currentMemberId) >
            0 && (
              <View style={styles.headerUnread}>
                <Text style={styles.headerUnreadText}>
                  {getTotalUnreadCount(
                    currentMemberId
                  )}
                </Text>
              </View>
            )}

          {/* TEMPORARY TEST CONTROL */}

          <Pressable
            onPress={switchDemoMember}
            style={styles.demoSwitch}
            accessibilityRole="button"
            accessibilityLabel="Switch demo member"
          >
            <Text style={styles.demoSwitchText}>
              {firstName(memberName(currentMemberId)).toUpperCase()} ⇄
            </Text>
          </Pressable>
        </View>
      </View>


      {/* CONVERSATION HEADING + SHORTCUT */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Your Conversations</Text>
        <Pressable
          onPress={() => router.push('/member/partners')}
          style={styles.partnersShortcut}
          accessibilityRole="button"
          accessibilityLabel="Back to Workout Partners"
        >
          <Text style={styles.partnersShortcutText}>← Workout Partners</Text>
        </Pressable>
      </View>

      {/* SEARCH */}

      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Text style={styles.searchSymbol}>
            ⌕
          </Text>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations"
            placeholderTextColor={C.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* CONVERSATIONS */}

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) =>
          item.conversation.id
        }
        renderItem={renderConversation}
        contentContainerStyle={
          styles.conversationListContent
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyChatIcon}>
              💬
            </Text>

            <Text style={styles.emptyChatTitle}>
              No conversations found
            </Text>

            <Text style={styles.emptyChatDescription}>
              {search
                ? 'Try another member name.'
                : 'Connect with a workout partner to start chatting.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ==========================================
// PROVIDER
// ==========================================

export default function MessagesScreen() {
  const { partnerId } = useLocalSearchParams<{ partnerId?: string }>();
  return <MessagesContent key={partnerId ?? 'inbox'} />;
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  partnersShortcut: {
    backgroundColor: C.marigold,
    paddingHorizontal: 14,
    minHeight: 42,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  partnersShortcutText: {
    color: C.midnight,
    fontSize: 13,
    fontWeight: '800',
  },
  flex: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: C.background,
  },

  header: {
    backgroundColor: C.midnight,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: C.white,
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    color: '#B8C1D1',
    fontSize: 13,
    marginTop: 5,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerUnread: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.marigold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },

  headerUnreadText: {
    color: C.midnight,
    fontWeight: '800',
    fontSize: 13,
  },

  demoSwitch: {
    backgroundColor: '#273753',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  demoSwitchText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 12,
  },

  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },

  searchBox: {
    height: 52,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  searchSymbol: {
    fontSize: 26,
    color: C.muted,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.midnight,
  },

  sectionHeading: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.midnight,
    flexShrink: 1,
  },

  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
  },

  conversationListContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    flexGrow: 1,
  },

  conversationCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 17,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: C.midnight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  avatarText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
  },

  conversationContent: {
    flex: 1,
  },

  conversationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  conversationName: {
    flex: 1,
    color: C.midnight,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },

  listTime: {
    color: C.muted,
    fontSize: 11,
  },

  conversationBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  messagePreview: {
    flex: 1,
    color: C.muted,
    fontSize: 13,
    marginRight: 8,
  },

  unreadPreview: {
    color: C.midnight,
    fontWeight: '700',
  },

  unreadBadge: {
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    paddingHorizontal: 5,
    backgroundColor: C.marigold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unreadBadgeText: {
    color: C.midnight,
    fontSize: 11,
    fontWeight: '800',
  },

  disconnectedTag: {
    alignSelf: 'flex-start',
    backgroundColor: C.softGray,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 8,
  },

  disconnectedTagText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
  },

  chatHeader: {
    backgroundColor: C.midnight,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backButtonText: {
    color: C.white,
    fontSize: 36,
    lineHeight: 40,
  },

  chatHeaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#31435E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  chatHeaderAvatarText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 14,
  },

  chatHeaderDetails: {
    flex: 1,
  },

  chatHeaderName: {
    color: C.white,
    fontSize: 18,
    fontWeight: '800',
  },

  chatHeaderSubtitle: {
    color: '#CAD2DD',
    fontSize: 12,
    marginTop: 4,
  },

  disconnectNotice: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: C.softYellow,
    borderRadius: 12,
    padding: 13,
  },

  disconnectNoticeText: {
    color: C.midnight,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  chatList: {
    flex: 1,
  },

  chatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 22,
    flexGrow: 1,
  },

  messageRow: {
    width: '100%',
    marginBottom: 13,
  },

  messageRowMine: {
    alignItems: 'flex-end',
  },

  messageRowOther: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
  },

  bubbleMine: {
    backgroundColor: C.midnight,
    borderBottomRightRadius: 5,
  },

  bubbleOther: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderBottomLeftRadius: 5,
  },

  messageBody: {
    fontSize: 14,
    lineHeight: 21,
  },

  messageBodyMine: {
    color: C.white,
  },

  messageBodyOther: {
    color: C.midnight,
  },

  messageMeta: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 7,
  },

  messageTime: {
    color: C.muted,
    fontSize: 10,
  },

  messageTimeMine: {
    color: '#C6CFDD',
  },

  messageStatus: {
    color: C.marigold,
    fontSize: 10,
    fontWeight: '700',
  },

  composerContainer: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },

  messageInput: {
    flex: 1,
    backgroundColor: C.background,
    borderRadius: 18,
    minHeight: 46,
    maxHeight: 115,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: C.midnight,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.border,
  },

  disabledInput: {
    opacity: 0.5,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.marigold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.4,
  },

  sendButtonText: {
    color: C.midnight,
    fontSize: 21,
    fontWeight: '800',
  },

  emptyList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 65,
  },

  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  emptyChatIcon: {
    fontSize: 40,
    marginBottom: 15,
  },

  emptyChatTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.midnight,
    textAlign: 'center',
  },

  emptyChatDescription: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    marginTop: 9,
    lineHeight: 20,
  },
});
