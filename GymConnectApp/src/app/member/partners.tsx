import { initials } from '@/logic/profile';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MEMBER_TAB_BAR_SPACE } from '@/components/member-tab-bar';
import { MemberPageHeader } from '@/components/member-page-header';

import { useTheme } from '@/hooks/use-theme';

import { useSharedPartners } from '../../features/partners/PartnersProvider';
import type {
  GymMember,
  PartnerFilters,
} from '../../features/partners/types';

type Tab = 'discover' | 'requests' | 'connected';
type FilterField = 'trainingStyle' | 'fitnessLevel' | 'trainingDay' | 'trainingTime';

const FILTERS: {
  key: FilterField;
  title: string;
  values: string[];
}[] = [
    {
      key: 'trainingStyle',
      title: 'Training style',
      values: ['All', 'Strength', 'Bodybuilding', 'Powerlifting', 'Cardio', 'Functional']
    },
    {
      key: 'fitnessLevel',
      title: 'Fitness level',
      values: ['All', 'Beginner', 'Intermediate', 'Advanced']
    },
    {
      key: 'trainingDay',
      title: 'Training day',
      values: ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    {
      key: 'trainingTime',
      title: 'Training time',
      values: ['All', 'Morning', 'Afternoon', 'Evening']
    },
  ];

function Avatar({
  member,
  size = 50,
  styles,
}: {
  member: GymMember;
  size?: number;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={[styles.avatar, {
      width: size,
      height: size,
      borderRadius: size / 2
    }]}>
      <Text style={[styles.avatarText, {
        fontSize: size * 0.3
      }]}>
        {member.initials || initials(member.name)}
      </Text>
    </View>
  );
}

export default function PartnersScreen() {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
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
  } = useSharedPartners();

  const [tab, setTab] = useState<Tab>('discover');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [filterField, setFilterField] = useState<FilterField | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<{
    connectionId: string;
    memberName: string;
  } | null>(null);

  const selectedMember = selectedMemberId ? getMember(selectedMemberId) : undefined;

  function updateFilter(key: FilterField, value: string) {
    setFilters(previous => ({
      ...previous,
      [key]: value
    } as PartnerFilters));
    setFilterField(null);
  }

  function requestPartner(memberId: string) {
    const sent = sendRequest(memberId);
    if (!sent) {
      Alert.alert('Request unavailable', 'You may already have a connection or pending request with this member.');
    }
  }

  function confirmDisconnect(connectionId: string, memberName: string) {
    setDisconnectTarget({
      connectionId,
      memberName
    });
  }

  function disconnectConfirmed() {
    if (!disconnectTarget) return;
    disconnectPartner(disconnectTarget.connectionId);
    setDisconnectTarget(null);
  }

  function openMessages(memberId: string) {
    router.push({
      pathname: '/member/messages',
      params: {
        partnerId: memberId,
      },
    });
  }

  function openConversationList() {
    router.push('/member/messages');
  }

  function connectionAction(member: GymMember) {
    const connection = getConnection(member.id);
    if (!connection) {
      return <Pressable style={styles.primaryButton} onPress={() => requestPartner(member.id)}>
        <Text style={styles.primaryText}>Send partner request</Text>
      </Pressable>;
    }

    if (connection.status === 'accepted') {
      return <View style={styles.actionColumn}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => openMessages(member.id)}
        >
          <Text style={styles.primaryText}>Message partner</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => confirmDisconnect(connection.id, member.name)}>
          <Text style={styles.secondaryText}>Disconnect</Text>
        </Pressable>
      </View>;
    }

    if (connection.senderId === currentMember.id) {
      return <Pressable style={styles.secondaryButton} onPress={() => cancelRequest(connection.id)}>
        <Text style={styles.secondaryText}>Pending · Cancel request</Text>
      </Pressable>;
    }

    return <View style={styles.actionRow}>
      <Pressable style={[styles.secondaryButton, styles.actionFlex]} onPress={() => declineRequest(connection.id)}>
        <Text style={styles.secondaryText}>Decline</Text>
      </Pressable>
      <Pressable style={[styles.primaryButton, styles.actionFlex]} onPress={() => acceptRequest(connection.id)}>
        <Text style={styles.primaryText}>Accept</Text>
      </Pressable>
    </View>;
  }

  const activeFilter = FILTERS.find(item => item.key === filterField);

  return (
    <SafeAreaView style={styles.screen} edges={[]}>
      <MemberPageHeader title="Training partners" subtitle="Find members who share your workout goals." />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {selectedMember ? (
          <View style={styles.profileView}>
            <Pressable onPress={() => setSelectedMemberId(null)} style={styles.backButton}>
              <Text style={styles.backText}>← Back to {tab}</Text>
            </Pressable>
            <View style={styles.card}>
              <View style={styles.profileIdentity}>
                <Avatar member={selectedMember} size={78} styles={styles} />
                <Text style={styles.profileName}>{selectedMember.name}</Text>
                <Text style={styles.subtle}>{selectedMember.fitnessLevel} · {selectedMember.trainingStyles.join(', ')}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>
                    {matchedMembers.find(item => item.member.id === selectedMember.id)?.compatibilityScore ?? '—'}% match
                  </Text>
                </View>
              </View>
              <View style={styles.factGrid}>
                <View style={styles.fact}><Text style={styles.factLabel}>Preferred schedule</Text><Text style={styles.factValue}>{selectedMember.schedule.preferredTime}</Text></View>
                <View style={styles.fact}><Text style={styles.factLabel}>Home branch</Text><Text style={styles.factValue}>{branchName}</Text></View>
                <View style={styles.fact}><Text style={styles.factLabel}>Training days</Text><Text style={styles.factValue}>{selectedMember.schedule.days.map(day => day.slice(0, 3)).join(', ')}</Text></View>
                <View style={styles.fact}><Text style={styles.factLabel}>Fitness level</Text><Text style={styles.factValue}>{selectedMember.fitnessLevel}</Text></View>
              </View>
              <View style={styles.about}><Text style={styles.sectionEyebrow}>ABOUT</Text><Text style={styles.aboutText}>{selectedMember.bio}</Text></View>
              {connectionAction(selectedMember)}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.intro}>
              <View style={{
                flex: 1
              }}>
                <Text style={styles.eyebrow}>BETTER WORKOUTS, SHARED</Text>
                <Text style={styles.pageTitle}>Find a partner</Text>
              </View>
              <Pressable
                onPress={openConversationList}
                style={styles.messageNavigationButton}
                accessibilityRole="button"
                accessibilityLabel="Open all messages"
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.onPrimary} />
                <Text style={styles.messageNavigationText}>Messages</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <View style={styles.segmented}>
                {(['discover', 'requests', 'connected'] as Tab[]).map(value => (
                  <Pressable
                    key={value}
                    onPress={() => setTab(value)}
                    style={[styles.segment, tab === value && styles.segmentActive]}
                  >
                    <Text style={[styles.segmentText, tab === value && styles.segmentTextActive]}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                      {value === 'requests' && incomingRequests.length > 0 ? ` (${incomingRequests.length})` : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {tab === 'discover' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionEyebrow}>DISCOVER MEMBERS</Text>
                  <Text style={styles.sectionTitle}>People who match your style</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by member name..."
                    placeholderTextColor={colors.textSecondary}
                    value={filters.searchQuery}
                    onChangeText={value => setFilters(previous => ({
                      ...previous,
                      searchQuery: value
                    }))}
                    autoCapitalize="none"
                  />
                  <View style={styles.filterWrap}>
                    {FILTERS.map(item => (
                      <Pressable key={item.key} style={styles.filterChip} onPress={() => setFilterField(item.key)}>
                        <Text style={styles.filterText}>
                          {item.title}: {filters[item.key]} ▾
                        </Text>
                      </Pressable>
                    ))}
                    <Pressable style={styles.clearButton} onPress={resetFilters}>
                      <Text style={styles.clearText}>Clear</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.resultCount}>{matchedMembers.length} members at {branchName}</Text>

                  {matchedMembers.length === 0 && (
                    <View style={styles.empty}><Text style={styles.emptyTitle}>No matching members</Text><Text style={styles.emptyDetail}>Try another training style or schedule.</Text></View>
                  )}

                  {matchedMembers.map(({ member, compatibilityScore }) => (
                    <View key={member.id} style={styles.memberCard}>
                      <View style={styles.memberRow}>
                        <Avatar member={member} styles={styles} />
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          <Text style={styles.subtle}>{member.fitnessLevel} · {member.trainingStyles.join(', ')}</Text>
                        </View>
                        <View style={styles.matchBadge}><Text style={styles.matchText}>{compatibilityScore}%</Text></View>
                      </View>
                      <Text style={styles.scheduleText}>
                        {member.schedule.days.map(day => day.slice(0, 3)).join(', ')} · {member.schedule.preferredTime}
                      </Text>
                      <Pressable style={styles.secondaryButton} onPress={() => setSelectedMemberId(member.id)}>
                        <Text style={styles.secondaryText}>View profile</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {tab === 'requests' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionEyebrow}>INCOMING REQUESTS</Text>
                  <Text style={styles.sectionTitle}>Members who want to connect</Text>
                  {incomingRequests.length === 0 && <Text style={styles.emptyDetail}>No incoming requests.</Text>}
                  {incomingRequests.map(connection => {
                    const member = getMember(connection.senderId);
                    if (!member) return null;
                    return <View key={connection.id} style={styles.memberCard}>
                      <View style={styles.memberRow}><Avatar member={member} size={42} styles={styles} /><View style={styles.memberInfo}><Text style={styles.memberName}>{member.name}</Text><Text style={styles.subtle}>{member.fitnessLevel} · {member.trainingStyles.join(', ')}</Text></View></View>
                      <View style={styles.actionRow}>
                        <Pressable style={[styles.secondaryButton, styles.actionFlex]} onPress={() => declineRequest(connection.id)}><Text style={styles.secondaryText}>Decline</Text></Pressable>
                        <Pressable style={[styles.primaryButton, styles.actionFlex]} onPress={() => acceptRequest(connection.id)}><Text style={styles.primaryText}>Accept</Text></Pressable>
                      </View>
                    </View>;
                  })}

                  <Text style={[styles.sectionEyebrow, styles.sectionGap]}>OUTGOING REQUESTS</Text>
                  <Text style={styles.sectionTitle}>Requests you have sent</Text>
                  {outgoingRequests.length === 0 && <Text style={styles.emptyDetail}>No pending outgoing requests.</Text>}
                  {outgoingRequests.map(connection => {
                    const member = getMember(connection.receiverId);
                    if (!member) return null;
                    return <View key={connection.id} style={styles.memberCard}>
                      <View style={styles.memberRow}><Avatar member={member} size={42} styles={styles} /><View style={styles.memberInfo}><Text style={styles.memberName}>{member.name}</Text><Text style={styles.subtle}>Awaiting response</Text></View></View>
                      <Pressable onPress={() => cancelRequest(connection.id)}><Text style={styles.dangerText}>Cancel request</Text></Pressable>
                    </View>;
                  })}
                </View>
              )}

              {tab === 'connected' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionEyebrow}>CONNECTED PARTNERS</Text>
                  <View style={styles.headingRow}>
                    <Text style={styles.sectionTitle}>Your training circle</Text>
                    <View style={styles.countPill}><Text style={styles.countText}>{connectedPartners.length} total</Text></View>
                  </View>
                  {connectedPartners.length === 0 && <View style={styles.empty}><Text style={styles.emptyTitle}>No connections yet</Text><Text style={styles.emptyDetail}>Explore compatible gym members and send a request.</Text></View>}
                  {connectedPartners.map(connection => {
                    const partnerId = connection.senderId === currentMember.id ? connection.receiverId : connection.senderId;
                    const member = getMember(partnerId);
                    if (!member) return null;
                    return <View key={connection.id} style={styles.memberCard}>
                      <View style={styles.memberRow}><Avatar member={member} size={42} styles={styles} /><View style={styles.memberInfo}><Text style={styles.memberName}>{member.name}</Text><Text style={styles.subtle}>{member.trainingStyles.join(', ')} · {member.schedule.preferredTime}</Text></View></View>
                      <View style={styles.actionRow}>
                        <Pressable style={[styles.secondaryButton, styles.actionFlex]} onPress={() => setSelectedMemberId(member.id)}><Text style={styles.secondaryText}>Profile</Text></Pressable>
                        <Pressable
                          style={[styles.primaryButton, styles.actionFlex]}
                          onPress={() => openMessages(member.id)}
                        >
                          <Text style={styles.primaryText}>Message</Text>
                        </Pressable>
                      </View>
                    </View>;
                  })}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={filterField !== null} transparent animationType="fade" onRequestClose={() => setFilterField(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{activeFilter?.title}</Text>
            <ScrollView style={{
              maxHeight: 360
            }}>
              {activeFilter?.values.map(value => (
                <Pressable key={value} style={styles.modalOption} onPress={() => updateFilter(activeFilter.key, value)}>
                  <Text style={[styles.modalOptionText, filters[activeFilter.key] === value && styles.modalSelected]}>{value}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.modalClose} onPress={() => setFilterField(null)}><Text style={styles.subtle}>Close</Text></Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={disconnectTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDisconnectTarget(null)}
      >
        <View style={styles.disconnectOverlay}>
          <View style={styles.disconnectModal}>
            <View style={styles.disconnectIconCircle}>
              <Ionicons name="person-remove-outline" size={27} color={colors.text} />
            </View>

            <Text style={styles.disconnectTitle}>Disconnect partner?</Text>
            <Text style={styles.disconnectDescription}>
              Remove {disconnectTarget?.memberName} from your workout partners?
            </Text>
            <Text style={styles.disconnectNote}>
              Your previous messages will stay available, but you won&apos;t be able to send new ones unless you reconnect.
            </Text>

            <Pressable
              style={styles.keepConnectionButton}
              onPress={() => setDisconnectTarget(null)}
              accessibilityRole="button"
            >
              <Text style={styles.keepConnectionText}>Keep connection</Text>
            </Pressable>

            <Pressable
              style={styles.confirmDisconnectButton}
              onPress={disconnectConfirmed}
              accessibilityRole="button"
            >
              <Text style={styles.confirmDisconnectText}>Disconnect partner</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) => StyleSheet.create({
  disconnectOverlay: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    paddingHorizontal: 25
  },
  disconnectModal: {
    backgroundColor: colors.backgroundElement,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center'
  },
  disconnectIconCircle: {
    backgroundColor: colors.accentSoft,
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 17
  },
  disconnectTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 21,
    textAlign: 'center',
    marginBottom: 11
  },
  disconnectDescription: {
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12
  },
  disconnectNote: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 23
  },
  keepConnectionButton: {
    width: '100%',
    minHeight: 49,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  keepConnectionText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '800'
  },
  confirmDisconnectButton: {
    width: '100%',
    minHeight: 49,
    borderRadius: 13,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  confirmDisconnectText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  messageNavigationButton: {
    flexDirection: 'row',
    gap: 7,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 11,
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageNavigationText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '800'
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },

  content: {
    padding: 18,
    paddingBottom: MEMBER_TAB_BAR_SPACE
  }, // clears the nav bar
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 15
  },
  eyebrow: {
    color: colors.accentText,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.6,
    marginBottom: 11
  },
  pageTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1
  },
  avatar: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: colors.onPrimary,
    fontWeight: '800'
  },
  card: {
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 21,
    padding: 17
  },
  segmented: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: colors.backgroundSelected,
    borderRadius: 12,
    gap: 2
  },
  segment: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 3,
    alignItems: 'center',
    borderRadius: 10
  },
  segmentActive: {
    backgroundColor: colors.backgroundElement,
    shadowColor: colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary
  },
  segmentTextActive: {
    color: colors.text
  },
  tabContent: {
    paddingTop: 26,
    gap: 13
  },
  sectionEyebrow: {
    color: colors.accentText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700'
  },
  searchInput: {
    backgroundColor: colors.backgroundElement,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 14,
    marginTop: 5
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingVertical: 9,
    paddingHorizontal: 11,
    backgroundColor: colors.backgroundElement
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text
  },
  clearButton: {
    justifyContent: 'center',
    paddingHorizontal: 5
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentText
  },
  resultCount: {
    color: colors.textSecondary,
    fontSize: 12
  },
  memberCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 15,
    gap: 13,
    backgroundColor: colors.backgroundElement
  },
  memberRow: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center'
  },
  memberInfo: {
    flex: 1,
    gap: 3
  },
  memberName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  subtle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18
  },
  scheduleText: {
    color: colors.textSecondary,
    fontSize: 12
  },
  matchBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'flex-start'
  },
  matchText: {
    color: colors.accentText,
    fontSize: 11,
    fontWeight: '800'
  },
  secondaryButton: {
    backgroundColor: colors.backgroundSelected,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  secondaryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700'
  },
  primaryButton: {
    backgroundColor: colors.primary,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  primaryText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '800'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 9
  },
  actionColumn: {
    gap: 10
  },
  actionFlex: {
    flex: 1
  },
  dangerText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 4
  },
  sectionGap: {
    marginTop: 22
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6
  },
  countPill: {
    backgroundColor: colors.navy,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  countText: {
    color: colors.heroText,
    fontSize: 11,
    fontWeight: '700'
  },
  empty: {
    alignItems: 'center',
    padding: 32,
    gap: 8
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16
  },
  emptyDetail: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19
  },
  profileView: {
    paddingTop: 4,
    gap: 16
  },
  backButton: {
    paddingVertical: 9
  },
  backText: {
    color: colors.accentText,
    fontWeight: '700',
    fontSize: 13
  },
  profileIdentity: {
    alignItems: 'center',
    gap: 9,
    marginVertical: 12
  },
  profileName: {
    fontSize: 23,
    fontWeight: '700',
    color: colors.text
  },
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginVertical: 15
  },
  fact: {
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 5,
    minHeight: 73
  },
  factLabel: {
    color: colors.textSecondary,
    fontSize: 11
  },
  factValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700'
  },
  about: {
    backgroundColor: colors.accentSoft,
    borderRadius: 13,
    padding: 14,
    gap: 8,
    marginBottom: 17
  },
  aboutText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    padding: 24
  },
  modalCard: {
    backgroundColor: colors.backgroundElement,
    borderRadius: 19,
    padding: 20
  },
  modalTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  modalOptionText: {
    color: colors.text,
    fontSize: 14
  },
  modalSelected: {
    color: colors.accentText,
    fontWeight: '800'
  },
  modalClose: {
    alignItems: 'center',
    padding: 14
  },
});
