import { useEffect, useRef, useState } from 'react';

import { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  AppState,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

import { isBranchOpen } from '@/logic/branchAvailability';
import { useBranch } from '@/context/BranchContext';

import BranchCard from '@/features/branches/BranchCard';
import { mockBranches } from '@/features/branches/mockBranches';

import type { BranchWithStatus } from '@/types/branch';

export default function BranchScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const {
    activeCheckIn,
    preferredBranchId,
    startDemoCheckIn,
    endDemoCheckIn,
  } = useBranch();

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // All branches start collapsed
  const [selectedBranchId, setSelectedBranchId] =
    useState<string | null>(null);

  // Branch availability
  const [now, setNow] = useState(() => new Date());

  // Check Out confirmation popup
  const [
    isCheckOutModalVisible,
    setIsCheckOutModalVisible,
  ] = useState(false);

  const [isCheckingOut, setIsCheckingOut] =
    useState(false);

  // Refresh branch availability
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          setNow(new Date());
        }
      }
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  // Calculate Open/Closed status automatically
  const branchesWithStatus: BranchWithStatus[] =
    mockBranches.map((branch) => ({
      ...branch,
      // Preferred branch comes from the saved Profile selection.
      isPreferred: branch.id === preferredBranchId,
      isOpen: isBranchOpen(
        branch.openingTime,
        branch.closingTime,
        now
      ),
    }));

  // Identify the active branch
  const activeBranch = activeCheckIn
    ? branchesWithStatus.find(
        (branch) => branch.id === activeCheckIn.branchId
      )
    : null;

  // Search branches
  const normalizedSearch = searchQuery
    .trim()
    .toLowerCase();

  const filteredBranches = branchesWithStatus.filter(
    (branch) =>
      branch.name
        .toLowerCase()
        .includes(normalizedSearch) ||
      branch.location
        .toLowerCase()
        .includes(normalizedSearch)
  );

  // Expand or collapse branch cards
  const handleBranchPress = (branchId: string) => {
    setSelectedBranchId((currentId) =>
      currentId === branchId ? null : branchId
    );
  };

  // Check In
  const handleDemoCheckIn = async (branchId: string) => {
    const branch = branchesWithStatus.find(
      (item) => item.id === branchId
    );

    if (!branch || !branch.isOpen) {
      return;
    }

    if (activeCheckIn !== null) {
      return;
    }

    const success = await startDemoCheckIn(branchId);

    if (success) {
      // Back to the dashboard, which now shows this branch as checked in.
      router.dismissTo('/member/dashboard');
    } else {
      Alert.alert(
        'Check-in unavailable',
        'Your attendance could not be saved. Please try again.'
      );
    }
  };

  // Open Check Out confirmation
  const handleRequestCheckOut = () => {
    if (!activeCheckIn || isCheckingOut) {
      return;
    }

    setIsCheckingOut(false);
    setIsCheckOutModalVisible(true);
  };

  // Cancel Check Out
  const handleCancelCheckOut = () => {
    if (isCheckingOut) {
      return;
    }

    setIsCheckOutModalVisible(false);
  };

  // Confirm Check Out
  const handleConfirmCheckOut = async () => {
    if (!activeCheckIn || isCheckingOut) {
      return;
    }

    const branchName =
      activeBranch?.name ?? 'your branch';

    // Show loading state
    setIsCheckingOut(true);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });

    const success = await endDemoCheckIn();

    setIsCheckingOut(false);

    if (!success) {
      Alert.alert(
        'Check-out unavailable',
        'Your check-out could not be saved. Please try again.'
      );
      return;
    }

    setIsCheckOutModalVisible(false);
    showSuccessToast(
      `Successfully checked out of ${branchName}`
    );

    // Back to the dashboard, which now shows "not checked in".
    router.dismissTo('/member/dashboard');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Back arrow: return to the dashboard without changing the check-in. */}
          <Pressable
            onPress={() => router.dismissTo('/member/dashboard')}
            accessibilityRole="button"
            accessibilityLabel="Back to dashboard"
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.text}
            />
          </Pressable>

          <Image
            source={require(
              '../../../assets/images/logo(notext).jpeg'
            )}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
              ]}
            >
              Gym Connect
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary },
              ]}
            >
              Find your gym branch
            </Text>
          </View>

          {/* Profile icon: open teammate's Profile screen. */}
          <Pressable
            onPress={() => router.push('/member/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open my profile"
            style={[
              styles.profileIcon,
              {
                backgroundColor:
                  colors.backgroundElement,
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.hero,
            { backgroundColor: colors.navy },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextBlock}>
              <Text
                style={[
                  styles.brand,
                  { color: colors.marigold },
                ]}
              >
                GYM CONNECT
              </Text>

              <Text style={styles.heroTitle}>
                Branch Selection
              </Text>

              <Text style={styles.heroSubtitle}>
                Choose your branch and manage your
                gym check-in.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/member/profile')}
              accessibilityRole="button"
              accessibilityLabel="Open my profile"
              style={styles.profileIcon}
            >
              <Ionicons
                name="person-outline"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor:
                  colors.backgroundSelected,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={colors.textSecondary}
            />

            <TextInput
              style={[
                styles.searchInput,
                { color: colors.text },
              ]}
              placeholder="Search branches..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              returnKeyType="search"
            />

            {searchQuery.length > 0 && (
              <Pressable
                onPress={clearSearch}
                accessibilityRole="button"
                accessibilityLabel="Clear branch search"
                hitSlop={10}
              >
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            )}
          </View>

          {/* Available Branches */}
          <View style={styles.branchSection}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                Available Branches
              </Text>

              <Text
                style={[
                  styles.branchCount,
                  { color: colors.textSecondary },
                ]}
              >
                {filteredBranches.length}{' '}
                {filteredBranches.length === 1
                  ? 'branch'
                  : 'branches'}
              </Text>
            </View>

            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  isSelected={
                    selectedBranchId === branch.id
                  }
                  onPress={() =>
                    handleBranchPress(branch.id)
                  }
                  onCheckIn={handleDemoCheckIn}
                  onCheckOut={handleRequestCheckOut}
                  activeCheckInBranchId={
                    activeCheckIn?.branchId ?? null
                  }
                  checkedInAt={
                    activeCheckIn?.branchId === branch.id
                      ? activeCheckIn.checkedInAt
                      : null
                  }
                />
              ))
            ) : (
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor:
                      colors.backgroundElement,
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={32}
                  color={colors.textSecondary}
                />

                <Text
                  style={[
                    styles.emptyTitle,
                    { color: colors.text },
                  ]}
                >
                  No matching branches
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Try searching for another branch
                  name or location.
                </Text>

                <Pressable
                  onPress={clearSearch}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.clearText,
                      { color: colors.marigold },
                    ]}
                  >
                    Clear search
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Reminder Message */}
            <View
              style={[
                styles.reminderCard,
                {
                  backgroundColor:
                    colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.textSecondary}
              />

              <Text
                style={[
                  styles.reminderText,
                  { color: colors.textSecondary },
                ]}
              >
                Don&apos;t forget to check out when
                leaving the gym.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Success Notification */}
      {toastMessage !== null && (
        <View
          pointerEvents="none"
          style={[
            styles.toastPosition,
            {
              top: insets.top + 16,
            },
          ]}
        >
          <View
            style={[
              styles.toastBox,
              {
                backgroundColor:
                  colors.backgroundElement,
                borderColor: colors.success,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.success}
            />

            <Text
              style={[
                styles.toastText,
                { color: colors.text },
              ]}
            >
              {toastMessage}
            </Text>
          </View>
        </View>
      )}

      {/* Check Out Confirmation Modal */}
      <Modal
        visible={isCheckOutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelCheckOut}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  colors.backgroundElement,
              },
            ]}
          >
            <View
              style={[
                styles.modalIcon,
                {
                  backgroundColor:
                    colors.backgroundSelected,
                },
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={28}
                color={colors.marigold}
              />
            </View>

            <Text
              style={[
                styles.modalTitle,
                { color: colors.text },
              ]}
            >
              Confirm Check Out
            </Text>

            <Text
              style={[
                styles.modalDescription,
                { color: colors.textSecondary },
              ]}
            >
              {isCheckingOut
                ? 'Processing your check-out...'
                : `Are you sure you want to check out of ${
                    activeBranch?.name ??
                    'your current branch'
                  }?`}
            </Text>

            <View style={styles.modalActions}>
              {!isCheckingOut && (
                <Pressable
                  onPress={handleCancelCheckOut}
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor:
                        colors.backgroundSelected,
                    },
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.text },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={handleConfirmCheckOut}
                disabled={isCheckingOut}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: isCheckingOut
                      ? colors.checkOutBackground
                      : colors.marigold,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isCheckingOut,
                  busy: isCheckingOut,
                }}
              >
                {isCheckingOut ? (
                  <View style={styles.loadingContent}>
                    <ActivityIndicator
                      size="small"
                      color={colors.checkOutText}
                    />

                    <Text
                      style={[
                        styles.modalButtonText,
                        {
                          color: colors.checkOutText,
                        },
                      ]}
                    >
                      Checking Out...
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.onPrimary },
                    ]}
                  >
                    Check Out
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing.five,
  },

  hero: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },

  heroTextBlock: {
    flex: 1,
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Spacing.two,
  },

  logo: {
    width: 65,
    height: 50,
  },

  brand: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: Spacing.three,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.two,
  },

  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#C9D1DD',
    maxWidth: '90%',
  },

  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },

  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    height: 52,
    gap: Spacing.two,
    borderWidth: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },

  branchSection: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  branchCount: {
    fontSize: 12,
  },

  emptyState: {
    borderRadius: 20,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  emptyDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  clearText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.two,
  },

  reminderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
    marginTop: Spacing.one,
  },

  reminderText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },

  toastPosition: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    zIndex: 20,
    elevation: 20,
  },

  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: Spacing.two,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  // Check Out confirmation popup
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: Spacing.four,
  },

  modalCard: {
    borderRadius: 22,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
  },

  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  modalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.two,
  },

  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});