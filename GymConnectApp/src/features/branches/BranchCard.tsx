
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BranchWithStatus } from '@/types/branch';

type BranchCardProps = {
  branch: BranchWithStatus;
  isSelected: boolean;
  onPress: () => void;
  onCheckIn: (branchId: string) => void;
  onCheckOut: () => void;
  activeCheckInBranchId: string | null;
  checkedInAt: string | null;
};

export default function BranchCard({
  branch,
  isSelected,
  onPress,
  onCheckIn,
  onCheckOut,
  activeCheckInBranchId,
  checkedInAt,
}: BranchCardProps) {
  const colors = useTheme();

  const isDark =
    colors.background === Colors.dark.background;

  const hasActiveCheckIn =
    activeCheckInBranchId !== null;

  const checkedInHere =
    activeCheckInBranchId === branch.id;

  const canCheckIn =
    branch.isOpen && !hasActiveCheckIn;

  const formattedCheckInTime =
    checkedInHere && checkedInAt
      ? new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'Africa/Cairo',
        }).format(new Date(checkedInAt))
      : null;

  // Availability message
  const availabilityMessage = checkedInHere
    ? 'You are checked in at this branch'
    : hasActiveCheckIn
      ? 'Check out of your current branch first'
      : branch.isOpen
        ? 'Ready for check-in'
        : 'Branch is currently closed';

  const availabilityColor = checkedInHere
    ? colors.success
    : hasActiveCheckIn
      ? colors.textSecondary
      : branch.isOpen
        ? colors.success
        : colors.error;

  // Button changes depending on attendance state
  const buttonLabel = checkedInHere
    ? 'Check Out'
    : canCheckIn
      ? 'Check In'
      : 'Check In Unavailable';

  const buttonBackground = checkedInHere
    ? colors.checkOutBackground
    : canCheckIn
      ? colors.primary
      : colors.backgroundSelected;

  const buttonTextColor = checkedInHere
    ? colors.checkOutText
    : canCheckIn
      ? colors.onPrimary
      : colors.textSecondary;

  const handleActionPress = () => {
    if (checkedInHere) {
      onCheckOut();
      return;
    }

    if (canCheckIn) {
      onCheckIn(branch.id);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: isSelected
            ? colors.selectedBorder
            : 'transparent',
        },

        isSelected && {
          shadowColor: isDark
            ? colors.marigold
            : colors.navy,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.65 : 0.18,
          shadowRadius: isDark ? 18 : 12,
          elevation: 8,
        },
      ]}
    >
      {/* Collapsible branch header */}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${branch.name}, ${
          isSelected ? 'collapse' : 'expand'
        } details`}
        accessibilityState={{
          expanded: isSelected,
        }}
        style={styles.cardHeader}
      >
        {branch.image ? (
          <Image
            source={branch.image}
            style={styles.branchImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              {
                backgroundColor:
                  colors.backgroundSelected,
              },
            ]}
          >
            <Ionicons
              name="image-outline"
              size={28}
              color={colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.branchInfo}>
          {/* Branch name and Preferred badge */}
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.branchName,
                { color: colors.text },
              ]}
            >
              {branch.name}
            </Text>

            {branch.isPreferred && (
              <View
                style={[
                  styles.preferredBadge,
                  {
                    backgroundColor:
                      colors.preferredBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.preferredText,
                    {
                      color: colors.preferredText,
                    },
                  ]}
                >
                  Preferred
                </Text>
              </View>
            )}
          </View>

          {/* Location */}
          <Text
            style={[
              styles.location,
              { color: colors.textSecondary },
            ]}
          >
            {branch.location}
          </Text>

          {/* Hours and availability */}
          <View style={styles.detailRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.textSecondary}
            />

            <Text
              style={[
                styles.detailText,
                { color: colors.textSecondary },
              ]}
            >
              {branch.operatingHours}
            </Text>

            <Text
              style={[
                styles.statusText,
                {
                  color: branch.isOpen
                    ? colors.success
                    : colors.error,
                },
              ]}
            >
              {branch.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>

          {/* Member count */}
          <View style={styles.detailRow}>
            <Ionicons
              name="people-outline"
              size={14}
              color={colors.textSecondary}
            />

            <Text
              style={[
                styles.detailText,
                { color: colors.textSecondary },
              ]}
            >
              {branch.checkedInCount} members checked in
            </Text>

            <Ionicons
              name={
                isSelected
                  ? 'chevron-up'
                  : 'chevron-down'
              }
              size={16}
              color={colors.textSecondary}
              style={styles.chevron}
            />
          </View>
        </View>
      </Pressable>

      {/* Expanded branch details */}
      {isSelected && (
        <View style={styles.expandedContent}>
          {/* Check-in information */}
          <View
            style={[
              styles.availabilityBox,
              {
                backgroundColor:
                  colors.backgroundSelected,
              },
            ]}
          >
            <Ionicons
              name={
                checkedInHere
                  ? 'checkmark-circle-outline'
                  : hasActiveCheckIn
                    ? 'information-circle-outline'
                    : branch.isOpen
                      ? 'checkmark-circle-outline'
                      : 'alert-circle-outline'
              }
              size={20}
              color={availabilityColor}
            />

            <View style={styles.availabilityInfo}>
              <Text
                style={[
                  styles.availabilityText,
                  { color: availabilityColor },
                ]}
              >
                {availabilityMessage}
              </Text>

              {/* Only visible at the active branch */}
              {formattedCheckInTime && (
                <Text
                  style={[
                    styles.checkInTime,
                    { color: colors.textSecondary },
                  ]}
                >
                  Checked in at {formattedCheckInTime}
                </Text>
              )}
            </View>
          </View>

          {/* One button for Check In and Check Out */}
          <Pressable
            onPress={handleActionPress}
            disabled={
              !checkedInHere && !canCheckIn
            }
            accessibilityRole="button"
            accessibilityLabel={buttonLabel}
            accessibilityState={{
              disabled:
                !checkedInHere && !canCheckIn,
            }}
            style={[
              styles.actionButton,
              {
                backgroundColor: buttonBackground,
              },
            ]}
          >
            <Ionicons
              name={
                checkedInHere
                  ? 'log-out-outline'
                  : canCheckIn
                    ? 'log-in-outline'
                    : 'lock-closed-outline'
              }
              size={20}
              color={buttonTextColor}
            />

            <Text
              style={[
                styles.actionButtonText,
                { color: buttonTextColor },
              ]}
            >
              {buttonLabel}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },

  branchImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
  },

  imagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  branchInfo: {
    flex: 1,
    gap: 6,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },

  branchName: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },

  preferredBadge: {
    borderRadius: 20,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },

  preferredText: {
    fontSize: 10,
    fontWeight: '600',
  },

  location: {
    fontSize: 12,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },

  detailText: {
    fontSize: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  chevron: {
    marginLeft: 'auto',
  },

  expandedContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },

  availabilityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },

  availabilityInfo: {
    flex: 1,
    gap: 5,
  },

  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
  },

  checkInTime: {
    fontSize: 12,
  },

  actionButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },

  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
