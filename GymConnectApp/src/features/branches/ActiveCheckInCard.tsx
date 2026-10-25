
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type ActiveCheckInCardProps = {
  branchName: string;
  checkedInAt: string;
  onRequestCheckOut?: () => void;
};

export default function ActiveCheckInCard({
  branchName,
  checkedInAt,
  onRequestCheckOut,
}: ActiveCheckInCardProps) {
  const colors = useTheme();

  // Display the original check-in time in Cairo.
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Cairo',
  }).format(new Date(checkedInAt));

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
        },
      ]}
    >
      {/* Header and Status */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: colors.text },
          ]}
        >
          Active Check-In
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: colors.backgroundSelected,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={colors.success}
          />

          <Text
            style={[
              styles.statusText,
              { color: colors.success },
            ]}
          >
            Checked In
          </Text>
        </View>
      </View>

      {/* Branch Name */}
      <View style={styles.infoRow}>
        <Ionicons
          name="location-outline"
          size={20}
          color={colors.textSecondary}
        />

        <Text
          style={[
            styles.branchName,
            { color: colors.text },
          ]}
        >
          {branchName}
        </Text>
      </View>

      {/* Original Check-In Time */}
      <View style={styles.infoRow}>
        <Ionicons
          name="time-outline"
          size={20}
          color={colors.textSecondary}
        />

        <Text
          style={[
            styles.timeText,
            { color: colors.textSecondary },
          ]}
        >
          Checked in at {formattedTime}
        </Text>
      </View>

      {/* Check Out — confirmation added later */}
      <Pressable
        onPress={onRequestCheckOut}
        disabled={!onRequestCheckOut}
        accessibilityRole="button"
        accessibilityLabel="Check out of active branch"
        accessibilityState={{
          disabled: !onRequestCheckOut,
        }}
        style={[
          styles.checkOutButton,
          {
            backgroundColor: colors.checkOutBackground,
          },
        ]}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={colors.checkOutText}
        />

        <Text
          style={[
            styles.checkOutText,
            { color: colors.checkOutText },
          ]}
        >
          Check Out
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    gap: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },

  branchName: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },

  timeText: {
    fontSize: 13,
  },

  checkOutButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },

  checkOutText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
