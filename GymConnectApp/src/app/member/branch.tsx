import { useBranchSelection } from '@/logic/use-branch-selection';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

import BranchCard from '@/features/branches/BranchCard';

export default function BranchScreen() {
  const colors = useTheme();

  const { activeCheckIn, searchQuery, selectedBranchId, isCheckOutModalVisible, isCheckingOut, activeBranch, filteredBranches, handleBranchPress, handleDemoCheckIn, handleRequestCheckOut, handleCancelCheckOut, handleConfirmCheckOut, clearSearch, setSearchQuery } = useBranchSelection();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Branch Header */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.navy
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <Pressable
              onPress={() => router.replace('/member/dashboard')}
              accessibilityRole="button"
              accessibilityLabel="Back to dashboard"
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
            </Pressable>

            <View style={styles.heroTextBlock}>
              <Text
                style={[
                  styles.brand,
                  {
                    color: colors.marigold
                  },
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
                {
                  color: colors.text
                },
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
                  {
                    color: colors.text
                  },
                ]}
              >
                Available Branches
              </Text>

              <Text
                style={[
                  styles.branchCount,
                  {
                    color: colors.textSecondary
                  },
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
                    {
                      color: colors.text
                    },
                  ]}
                >
                  No matching branches
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    {
                      color: colors.textSecondary
                    },
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
                      {
                        color: colors.marigold
                      },
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
                  {
                    color: colors.textSecondary
                  },
                ]}
              >
                Don&apos;t forget to check out when
                leaving the gym.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

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
                {
                  color: colors.text
                },
              ]}
            >
              Confirm Check Out
            </Text>

            <Text
              style={[
                styles.modalDescription,
                {
                  color: colors.textSecondary
                },
              ]}
            >
              {isCheckingOut
                ? 'Processing your check-out...'
                : `Are you sure you want to check out of ${activeBranch?.name ??
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
                      {
                        color: colors.text
                      },
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
                      {
                        color: colors.onPrimary
                      },
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
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Spacing.two,
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
