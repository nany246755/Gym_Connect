import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSharedSpottingRequests } from '../../../features/spotting/SpottingRequestsProvider';
import type { CancellationReason, SpottingRequest } from '../../../features/spotting/types';

const C = {
  midnight: '#14213D', marigold: '#FCA311', background: '#F4F6FA',
  white: '#FFFFFF', muted: '#6B7890', border: '#E1E6EE', soft: '#FFF3D9',
};

const CANCEL_REASONS: CancellationReason[] = [
  'No longer need assistance', 'Spotter unavailable', 'Leaving the gym', 'Other',
];

type Tab = 'active' | 'mine';

function initials(name: string) {
  return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
}

export default function SpottingScreen() {
  const { tab: requestedTab } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>('active');
  const [cancelId, setCancelId] = useState<string | null>(null);

  const {
    requests, now, currentUserId, setCurrentUserId,
    myActiveRequest, availableRequests, acceptRequest,
    completeRequest, cancelRequest,
  } = useSharedSpottingRequests();

  useEffect(() => {
    if (requestedTab === 'mine') setTab('mine');
  }, [requestedTab]);

  const myAcceptedSpotting = requests.find(request =>
    request.acceptedBy === currentUserId && request.status === 'accepted'
  );
  const latestClosedRequest = requests.find(request =>
    request.requesterId === currentUserId &&
    (request.status === 'expired' || request.status === 'cancelled' || request.status === 'completed')
  );

  function timeRemaining(expiresAt: number) {
    const seconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function confirmCancel(reason: CancellationReason) {
    if (cancelId) cancelRequest(cancelId, reason);
    setCancelId(null);
  }

  function requestCard(request: SpottingRequest) {
    return (
      <View key={request.id} style={styles.card}>
        <View style={styles.memberRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(request.requesterName)}</Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{request.requesterName}</Text>
            <Text style={styles.muted}>{request.exercise}</Text>
          </View>
        </View>
        <Text style={styles.detail}>{request.location}</Text>
        {request.weightKg !== undefined && (
          <Text style={styles.detail}>{request.weightKg} kg</Text>
        )}
        <Text style={styles.countdown}>◷  {timeRemaining(request.expiresAt)} remaining</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.softButton}
          onPress={() => acceptRequest(request.id)}
        >
          <Text style={styles.softButtonText}>Accept request</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}><Text style={styles.logoText}>G</Text></View>
          <Text style={styles.brandText}>GYM CONNECT</Text>
        </View>
        <View style={styles.branch}><Text style={styles.branchText}>Midtown</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>TRAIN SAFER, TOGETHER</Text>
        <Text style={styles.title}>Spotting requests</Text>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, tab === 'active' && styles.tabSelected]}
            onPress={() => setTab('active')}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === 'active' }}
          >
            <Text style={[styles.tabText, tab === 'active' && styles.tabTextSelected]}>Active requests</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'mine' && styles.tabSelected]}
            onPress={() => setTab('mine')}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === 'mine' }}
          >
            <Text style={[styles.tabText, tab === 'mine' && styles.tabTextSelected]}>My requests</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.spotMe}
          accessibilityRole="button"
          onPress={() => router.push('/member/spotting/create' as Href)}
        >
          <Text style={styles.spotMeText}>＋ Spot Me</Text>
        </Pressable>

        {tab === 'active' ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Available requests</Text>
              <Text style={styles.muted}>{availableRequests.length} available</Text>
            </View>
            <Text style={styles.helper}>From other members at your branch</Text>
            {availableRequests.length > 0 ? availableRequests.map(requestCard) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No nearby requests</Text>
                <Text style={styles.muted}>New requests from checked-in members at Midtown will appear here.</Text>
              </View>
            )}
            <Text style={styles.footerNote}>Unaccepted requests expire after 2 minutes.</Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>My current request</Text>
            {myActiveRequest ? (
              <View style={styles.card}>
                <View style={styles.sectionRow}>
                  <Text style={styles.cardTitle}>{myActiveRequest.exercise}</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{myActiveRequest.status === 'accepted' ? 'Matched' : 'Waiting'}</Text>
                  </View>
                </View>
                <Text style={styles.detail}>{myActiveRequest.location}</Text>
                {myActiveRequest.weightKg !== undefined && (
                  <Text style={styles.detail}>{myActiveRequest.weightKg} kg</Text>
                )}
                {myActiveRequest.status === 'pending' ? (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Waiting for a spotter</Text>
                    <Text style={styles.detail}>{timeRemaining(myActiveRequest.expiresAt)} until this request expires</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Help is on the way</Text>
                      <Text style={styles.detail}>Spotter: {myActiveRequest.acceptedBy === 'member-omar' ? 'Omar' : myActiveRequest.acceptedBy === 'member-2' ? 'AJ' : myActiveRequest.acceptedBy}</Text>
                    </View>
                    <Pressable style={styles.darkButton} onPress={() => completeRequest(myActiveRequest.id)}>
                      <Text style={styles.darkButtonText}>Mark request as finished</Text>
                    </Pressable>
                  </>
                )}
                <Pressable style={styles.outlineButton} onPress={() => setCancelId(myActiveRequest.id)}>
                  <Text style={styles.outlineText}>Cancel request</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No active request</Text>
                <Text style={styles.muted}>Tap Spot Me when you need someone to help with a set.</Text>
                {latestClosedRequest && (
                  <Text style={styles.previous}>Previous request: {latestClosedRequest.status}</Text>
                )}
              </View>
            )}

            {myAcceptedSpotting && (
              <>
                <Text style={styles.sectionTitle}>My spotting assignment</Text>
                <View style={styles.card}>
                  <View style={styles.sectionRow}>
                    <Text style={styles.cardTitle}>{myAcceptedSpotting.exercise}</Text>
                    <View style={styles.statusPill}><Text style={styles.statusText}>Accepted</Text></View>
                  </View>
                  <Text style={styles.detail}>Helping {myAcceptedSpotting.requesterName}</Text>
                  <Text style={styles.detail}>{myAcceptedSpotting.location}</Text>
                  {myAcceptedSpotting.weightKg !== undefined && (
                    <Text style={styles.detail}>{myAcceptedSpotting.weightKg} kg</Text>
                  )}
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>You're the spotter!</Text>
                    <Text style={styles.detail}>The requester will mark this assignment as completed.</Text>
                  </View>
                  <Pressable style={styles.outlineButton} onPress={() => setCancelId(myAcceptedSpotting.id)}>
                    <Text style={styles.outlineText}>Withdraw from spotting</Text>
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}

        {/* Kept for FR05/FR06 acceptance and completion tests. */}
        <View style={styles.testPanel}>
          <Text style={styles.testLabel}>TESTING MODE · CURRENT MEMBER</Text>
          <View style={styles.testRow}>
            {(['member-2', 'member-omar'] as const).map(id => (
              <Pressable
                key={id}
                style={[styles.testButton, currentUserId === id && styles.testSelected]}
                onPress={() => setCurrentUserId(id)}
              >
                <Text style={[styles.testText, currentUserId === id && styles.testSelectedText]}>
                  {id === 'member-2' ? 'AJ' : 'Omar'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={cancelId !== null} animationType="fade" onRequestClose={() => setCancelId(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.cardTitle}>Why are you cancelling?</Text>
            {CANCEL_REASONS.map(reason => (
              <Pressable key={reason} style={styles.modalChoice} onPress={() => confirmCancel(reason)}>
                <Text style={styles.modalChoiceText}>{reason}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.outlineButton} onPress={() => setCancelId(null)}>
              <Text style={styles.outlineText}>Keep request</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  header: { backgroundColor: C.midnight, paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.marigold, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: C.midnight, fontSize: 22, fontWeight: '800' },
  brandText: { color: C.white, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  branch: { borderWidth: 1, borderColor: '#45516C', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20 },
  branchText: { color: C.white, fontWeight: '700', fontSize: 12 },
  content: { padding: 18, paddingBottom: 46, gap: 12 },
  eyebrow: { fontWeight: '800', fontSize: 10, letterSpacing: 1.4, color: '#A96900', marginTop: 8 },
  title: { color: C.midnight, fontSize: 30, fontWeight: '800', marginBottom: 9 },
  tabs: { backgroundColor: '#E9EDF4', borderRadius: 14, padding: 4, flexDirection: 'row', gap: 4 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 11, alignItems: 'center' },
  tabSelected: { backgroundColor: C.white },
  tabText: { color: C.muted, fontSize: 14, fontWeight: '700' },
  tabTextSelected: { color: C.midnight },
  spotMe: { backgroundColor: C.marigold, paddingVertical: 15, alignItems: 'center', borderRadius: 14, marginTop: 3, marginBottom: 4 },
  spotMeText: { color: C.midnight, fontSize: 16, fontWeight: '800' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  sectionTitle: { color: C.midnight, fontSize: 18, fontWeight: '800', marginTop: 8 },
  helper: { color: C.muted, fontSize: 12, marginTop: -7 },
  card: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 17, gap: 9 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.midnight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.white, fontWeight: '800', fontSize: 14 },
  memberDetails: { flex: 1, gap: 4 },
  memberName: { color: C.midnight, fontWeight: '800', fontSize: 16 },
  muted: { color: C.muted, fontSize: 13 },
  detail: { color: C.muted, fontSize: 13, lineHeight: 19 },
  countdown: { color: '#A96900', fontSize: 13, fontWeight: '700', marginTop: 3 },
  softButton: { backgroundColor: C.soft, alignItems: 'center', paddingVertical: 13, borderRadius: 12, marginTop: 4 },
  softButtonText: { color: C.midnight, fontWeight: '800', fontSize: 14 },
  darkButton: { backgroundColor: C.midnight, borderRadius: 12, alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  darkButtonText: { color: C.white, fontWeight: '800', fontSize: 14 },
  outlineButton: { borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  outlineText: { color: C.midnight, fontWeight: '700', fontSize: 14 },
  cardTitle: { color: C.midnight, fontWeight: '800', fontSize: 17, flexShrink: 1 },
  statusPill: { backgroundColor: '#E6F5EC', borderRadius: 12, paddingHorizontal: 11, paddingVertical: 7 },
  statusText: { color: '#237747', fontWeight: '800', fontSize: 11 },
  infoBox: { backgroundColor: C.soft, borderRadius: 12, padding: 14, gap: 5, marginTop: 5 },
  infoTitle: { color: C.midnight, fontWeight: '800', fontSize: 15 },
  empty: { backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 27, alignItems: 'center', gap: 10 },
  emptyTitle: { color: C.midnight, fontWeight: '800', fontSize: 16 },
  previous: { color: C.muted, fontSize: 12, marginTop: 6, textTransform: 'capitalize' },
  footerNote: { textAlign: 'center', color: C.muted, fontSize: 12 },
  testPanel: { backgroundColor: '#E9EEF7', borderRadius: 15, padding: 12, marginTop: 12, gap: 9 },
  testLabel: { color: C.muted, fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },
  testRow: { flexDirection: 'row', gap: 8 },
  testButton: { flex: 1, paddingVertical: 11, backgroundColor: '#AFBCD0', alignItems: 'center', borderRadius: 10 },
  testSelected: { backgroundColor: C.midnight },
  testText: { color: C.white, fontWeight: '800', fontSize: 13 },
  testSelectedText: { color: C.white },
  overlay: { flex: 1, backgroundColor: 'rgba(20,33,61,0.5)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  modal: { backgroundColor: C.white, width: '100%', borderRadius: 20, padding: 18, gap: 11 },
  modalChoice: { backgroundColor: C.background, borderRadius: 11, padding: 15 },
  modalChoiceText: { color: C.midnight, fontWeight: '600' },
});