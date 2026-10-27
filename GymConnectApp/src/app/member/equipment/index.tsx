import { equipmentStatusColors } from '@/constants/equipment-status-colors';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MemberPageHeader } from '@/components/member-page-header';

import {
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

import { useBranch } from '@/context/BranchContext';

import EquipmentFloorGrid from '@/features/equipment/EquipmentFloorGrid';

import { useTheme } from '@/hooks/use-theme';

import { equipmentImage, STATUS_LABEL } from '@/logic/equipment';

import { useMemberEquipment } from '@/logic/use-member-equipment';

import {
  EQUIPMENT_STATUSES,
  type Equipment,
  type EquipmentStatus,
} from '@/types/equipment';

// Equipment card used inside the floor layout
// and the regular equipment grid.
function EquipmentTile({
  item,
  compact = false,
}: {
  item: Equipment;
  compact?: boolean;
}) {
  const theme = useTheme();
  const image = equipmentImage(item);

  const colors =
    equipmentStatusColors(theme, item.status);

  // NEW: Open the selected equipment's details page.
  const openDetails = () => {
    router.push({
      pathname: '/member/equipment/[id]',
      params: {
        id: item.id,
      },
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View details for ${item.name}`}
      accessibilityHint="Opens equipment information and availability"
      onPress={openDetails}
      style={({ pressed }) => [
        styles.tile,
        compact && styles.compactTile,
        {
          backgroundColor: colors.background,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {/* Equipment Icon */}
      <Ionicons
        name="barbell-outline"
        size={compact ? 20 : 25}
        color={colors.foreground}
      />

      {image !== undefined && (
        <Image source={image} contentFit="cover" accessibilityLabel={item.name}
          style={{
            width: '100%',
            height: compact ? 24 : 100,
            borderRadius: Spacing.two
          }} />
      )}
      {/* Equipment Name */}
      <ThemedText
        type="smallBold"
        style={[
          styles.tileName,
          compact && styles.compactTileName,
          {
            color: theme.text,
          },
        ]}
        numberOfLines={2}
      >
        {item.name}
      </ThemedText>

      {/* Equipment Station */}
      <ThemedText
        type="small"
        style={[
          styles.tileStation,
          compact && styles.compactTileStation,
          {
            color: theme.textSecondary,
          },
        ]}
        numberOfLines={compact ? 1 : 2}
      >
        {item.station}
      </ThemedText>

      {/* Equipment Availability */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            compact && styles.compactStatusDot,
            {
              backgroundColor: colors.foreground,
            },
          ]}
        />

        <ThemedText
          style={[
            styles.statusText,
            compact && styles.compactStatusText,
            {
              color: colors.foreground,
            },
          ]}
          numberOfLines={1}
        >
          {STATUS_LABEL[item.status]}
        </ThemedText>
      </View>
    </Pressable>
  );
}

// Availability legend.
// Keeps all four existing statuses.
function AvailabilityLegend() {
  const theme = useTheme();

  const statusStyles =
    Object.fromEntries(EQUIPMENT_STATUSES.map(status => [status, equipmentStatusColors(theme, status)])) as Record<EquipmentStatus, ReturnType<typeof equipmentStatusColors>>;

  return (
    <View style={styles.legendContainer}>
      {EQUIPMENT_STATUSES.map((status) => (
        <View
          key={status}
          style={styles.legendItem}
          accessible
          accessibilityLabel={`${STATUS_LABEL[status]} equipment`}
        >
          <View
            style={[
              styles.legendDot,
              {
                backgroundColor:
                  statusStyles[status].foreground,
              },
            ]}
          />

          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.legendText}
          >
            {STATUS_LABEL[status]}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// Member Equipment Availability Screen.
export default function EquipmentAvailabilityScreen() {
  const theme = useTheme();


  // Shared branch information.
  const {
    activeCheckIn,
    preferredBranchId,
    attendanceReady,
  } = useBranch();

  // Checked-in branch takes priority.
  const branchId = attendanceReady
    ? activeCheckIn?.branchId ?? preferredBranchId
    : null;

  // Shared Equipment ViewModel.
  const {
    equipment,
    filteredZones,
    availableZones,
    selectedZone,
    setSelectedZone,
    searchQuery,
    setSearchQuery,
    visibleEquipmentCount,
    branchName,
    loading,
    error,
  } = useMemberEquipment(branchId);

  const filters = [
    'All',
    ...availableZones,
  ];

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <MemberPageHeader title="Equipment" subtitle="Find available equipment at your gym." />

        {/* Equipment Content */}
        <View style={styles.content}>
          {/* Search Bar */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor:
                  theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={21}
              color={theme.textSecondary}
            />

            <TextInput
              style={[
                styles.searchInput,
                {
                  color: theme.text,
                },
              ]}
              placeholder="Search equipment or exercise..."
              placeholderTextColor={
                theme.textSecondary
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search equipment"
            />

            {/* Clear Search */}
            {searchQuery.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() =>
                  setSearchQuery('')
                }
                hitSlop={10}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={21}
                  color={theme.textSecondary}
                />
              </Pressable>
            )}
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.filters
            }
            style={styles.filterScroll}
            keyboardShouldPersistTaps="handled"
          >
            {filters.map((filter) => {
              const isSelected =
                selectedZone === filter;

              return (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${filter} equipment`}
                  accessibilityState={{
                    selected: isSelected,
                  }}
                  onPress={() =>
                    setSelectedZone(filter)
                  }
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: isSelected
                        ? theme.accent
                        : theme.backgroundElement,

                      borderColor: isSelected
                        ? theme.accent
                        : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={{
                      color: isSelected
                        ? theme.onAccent
                        : theme.text,
                    }}
                  >
                    {filter}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Availability Legend */}
          <AvailabilityLegend />

          {/* Branch Heading */}
          <ThemedText
            type="smallBold"
            style={styles.floorHeading}
          >
            Gym floor – {branchName || 'Selected branch'}
          </ThemedText>

          {/* Equipment Content */}
          {!attendanceReady || loading ? (
            <ActivityIndicator
              size="large"
              color={theme.accent}
            />

          ) : error ? (
            <ThemedText
              style={{
                color: theme.danger,
              }}
            >
              {error}
            </ThemedText>

          ) : equipment.length === 0 ? (
            <ThemedText type="small">
              No equipment found at this branch.
            </ThemedText>

          ) : visibleEquipmentCount === 0 ? (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor:
                    theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={29}
                color={theme.textSecondary}
              />

              <ThemedText type="smallBold">
                No matching equipment
              </ThemedText>

              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.emptyDescription}
              >
                Try a different search or
                select another category.
              </ThemedText>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear equipment filters"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedZone('All');
                }}
                style={[
                  styles.clearFiltersButton,
                  {
                    backgroundColor: theme.accent,
                  },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={{
                    color: theme.onAccent,
                  }}
                >
                  Clear filters
                </ThemedText>
              </Pressable>
            </View>

          ) : (
            /* The same floor component as before.
               Its equipment cards are now tappable. */
            <EquipmentFloorGrid
              items={filteredZones.flatMap(
                (zone) => zone.items
              )}
              renderTile={(item, mode) => (
                <EquipmentTile
                  item={item}
                  compact={mode === 'floor'}
                />
              )}
            />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    paddingBottom: Spacing.five,
  },

  // Profile-style header

  // Equipment content
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: 16,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 13,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    minHeight: 46,
    paddingVertical: 0,
  },

  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },

  // Category filters
  filterScroll: {
    flexGrow: 0,
    marginHorizontal: -Spacing.three,
  },

  filters: {
    paddingHorizontal: Spacing.three,
    gap: 8,
    alignItems: 'center',
  },

  filterButton: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 17,
    paddingVertical: 10,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Availability legend
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 14,
    rowGap: 10,
    paddingVertical: 2,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  legendText: {
    fontSize: 12,
  },

  // Selected branch heading
  floorHeading: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  // Equipment tiles
  tile: {
    width: '100%',
    minHeight: 136,
    borderWidth: 1,
    borderRadius: 12,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },

  compactTile: {
    height: '100%',
    minHeight: 0,
    padding: 5,
    gap: 5,
    justifyContent: 'center',
    borderRadius: 10,
  },

  tileName: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 15,
  },

  compactTileName: {
    fontSize: 10,
    lineHeight: 13,
  },

  tileStation: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 14,
  },

  compactTileStation: {
    fontSize: 9,
    lineHeight: 12,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  compactStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '600',
    flexShrink: 1,
  },

  compactStatusText: {
    fontSize: 8,
    lineHeight: 11,
  },

  // Empty state
  emptyState: {
    padding: 24,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    gap: 12,
  },

  emptyDescription: {
    textAlign: 'center',
  },

  clearFiltersButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
});

