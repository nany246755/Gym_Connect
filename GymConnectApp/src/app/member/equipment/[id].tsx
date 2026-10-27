import { equipmentStatusColors as getStatusColors } from '@/constants/equipment-status-colors';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';


import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import {
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

import { useTheme } from '@/hooks/use-theme';

import {
  MUSCLE_LABEL,
  equipmentImage,
  STATUS_LABEL,
} from '@/logic/equipment';

import {
  MAX_EQUIPMENT_REPORT_NOTE_LENGTH,
  type ReportableEquipmentStatus,
} from '@/services/equipment-report-service';

import { useEquipmentDetails } from '@/logic/use-equipment-details';
import type { EquipmentAlternative } from '@/logic/equipment-alternatives';

import type {
  Equipment,
} from '@/types/equipment';

// Temporary descriptions for prototype equipment.
// These are display information only.
type EquipmentContent = {
  classification?: string;
  description: string;
};

const EQUIPMENT_CONTENT: Record<string, EquipmentContent> = {
  'bench press': {
    classification: 'Compound',
    description:
      'Bench press station for chest-focused strength training.',
  },

  'chest press': {
    classification: 'Compound',
    description:
      'Pressing machine used for chest-focused strength training.',
  },

  'lat pulldown': {
    classification: 'Compound',
    description:
      'Cable-based pulling machine used to train the back.',
  },

  'seated row': {
    classification: 'Compound',
    description:
      'Seated pulling machine for back-focused strength training.',
  },

  'squat rack': {
    classification: 'Compound',
    description:
      'Barbell rack commonly used for squats and other strength exercises.',
  },

  'shoulder press': {
    classification: 'Compound',
    description:
      'Overhead pressing equipment used for shoulder strength training.',
  },

  'leg press': {
    classification: 'Compound',
    description:
      'Lower-body pressing machine primarily used for leg training.',
  },

  'smith machine': {
    classification: 'Strength',
    description:
      'Guided barbell equipment used for a range of resistance exercises.',
  },

  'cable machine': {
    classification: 'Strength',
    description:
      'Adjustable cable station for a variety of resistance exercises.',
  },

  'dumbbell set': {
    classification: 'Free weights',
    description:
      'Free weights suitable for a wide range of strength exercises.',
  },

  treadmill: {
    classification: 'Cardio',
    description:
      'Cardio equipment used for walking and running workouts.',
  },

  'spin bike': {
    classification: 'Cardio',
    description:
      'Stationary cycling equipment used for cardiovascular exercise.',
  },
};

function getEquipmentContent(
  equipment: Equipment
): EquipmentContent {
  const key = equipment.name.trim().toLowerCase();

  return (
    EQUIPMENT_CONTENT[key] ?? {
      description:
        'Additional exercise information for this equipment is not yet available.',
    }
  );
}

// Only display an actual future availability estimate.
function getAvailabilityMessage(
  equipment: Equipment
): string | null {
  if (
    equipment.status !== 'Occupied' &&
    equipment.status !== 'AvailableSoon'
  ) {
    return null;
  }

  if (equipment.estimatedFreeAt) {
    const expectedTime = new Date(
      equipment.estimatedFreeAt
    ).getTime();

    const remaining = expectedTime - Date.now();

    if (
      Number.isFinite(expectedTime) &&
      remaining > 0
    ) {
      const minutes = Math.max(
        1,
        Math.ceil(remaining / 60000)
      );

      return `Available soon – approximately ${minutes} min`;
    }
  }

  if (equipment.status === 'AvailableSoon') {
    return 'Available soon';
  }

  return null;
}

// Member-reportable statuses.
const REPORTABLE_STATUSES: ReportableEquipmentStatus[] = [
  'Available',
  'Occupied',
  'AvailableSoon',
];

const REPORT_STATUS_LABELS: Record<
  ReportableEquipmentStatus,
  string
> = {
  Available: 'Available',
  Occupied: 'Occupied',
  AvailableSoon: 'Available soon',
};

function EquipmentStatusSelector({
  selectedStatus,
  onSelect,
}: {
  selectedStatus: ReportableEquipmentStatus | null;
  onSelect: (
    status: ReportableEquipmentStatus
  ) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.statusSection}>
      <ThemedText type="smallBold">
        Mark equipment status
      </ThemedText>

      <ThemedText
        type="small"
        themeColor="textSecondary"
      >
        Choose the availability status you observed.
      </ThemedText>

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Mark equipment status"
        style={[
          styles.statusOptions,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}
      >
        {REPORTABLE_STATUSES.map((status, index) => {
          const selected = selectedStatus === status;
          const colors = getStatusColors(theme, status);

          return (
            <Pressable
              key={status}
              accessibilityRole="radio"
              accessibilityLabel={REPORT_STATUS_LABELS[status]}
              accessibilityState={{
                checked: selected,
              }}
              onPress={() => onSelect(status)}
              style={[
                styles.statusOption,
                {
                  backgroundColor: selected
                    ? theme.backgroundSelected
                    : theme.backgroundElement,

                  borderBottomWidth:
                    index < REPORTABLE_STATUSES.length - 1
                      ? 1
                      : 0,

                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.optionStatusDot,
                  {
                    backgroundColor: colors.foreground,
                  },
                ]}
              />

              <ThemedText
                type="smallBold"
                style={styles.optionLabel}
              >
                {REPORT_STATUS_LABELS[status]}
              </ThemedText>

              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor: selected
                      ? theme.accent
                      : theme.textSecondary,
                  },
                ]}
              >
                {selected && (
                  <View
                    style={[
                      styles.radioInner,
                      {
                        backgroundColor: theme.accent,
                      },
                    ]}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// NEW: A card representing one available alternative.
function AlternativeEquipmentCard({
  alternative,
  onPress,
}: {
  alternative: EquipmentAlternative;
  onPress: () => void;
}) {
  const theme = useTheme();

  const item = alternative.equipment;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name} details`}
      accessibilityHint="Opens the alternative equipment details"
      onPress={onPress}
      style={({ pressed }) => [
        styles.alternativeCard,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.alternativeIcon,
          {
            backgroundColor: theme.successSoft,
          },
        ]}
      >
        <Ionicons
          name="barbell-outline"
          size={26}
          color={theme.success}
        />
      </View>

      <View style={styles.alternativeInfo}>
        <ThemedText type="smallBold">
          {item.name}
        </ThemedText>

        <ThemedText
          type="small"
          themeColor="textSecondary"
          numberOfLines={2}
        >
          {item.station} · {MUSCLE_LABEL[item.muscleGroup]}
        </ThemedText>

        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.alternativeReason}
        >
          {alternative.reason}
        </ThemedText>
      </View>

      <View style={styles.alternativeStatus}>
        <View
          style={[
            styles.alternativeStatusDot,
            {
              backgroundColor: theme.success,
            },
          ]}
        />

        <ThemedText
          style={[
            styles.alternativeStatusText,
            {
              color: theme.success,
            },
          ]}
        >
          Available
        </ThemedText>

        <Ionicons
          name="chevron-forward"
          size={15}
          color={theme.textSecondary}
        />
      </View>
    </Pressable>
  );
}

export default function EquipmentDetailsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { scrollRef, noteFocusedRef, equipment, loading, error, selectedStatus, note, submitting, submitError, reportSaved, alternatives, alternativesVisible, alternativesLoading, alternativesError, goBack, chooseStatus, changeNote, submitReport, findAlternatives, openAlternative } = useEquipmentDetails(id);

  const statusColors = equipment
    ? getStatusColors(theme, equipment.status)
    : null;

  const content = equipment
    ? getEquipmentContent(equipment)
    : null;

  const availabilityMessage = equipment
    ? getAvailabilityMessage(equipment)
    : null;

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Gym Connect header */}
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.hero,
                paddingTop:
                  insets.top + Spacing.three,
              },
            ]}
          >
            <View style={styles.heroInner}>
              <View style={styles.headerRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back to equipment"
                  onPress={goBack}
                  style={styles.backButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={22}
                    color={theme.heroText}
                  />
                </Pressable>

                <ThemedText
                  type="smallBold"
                  style={[
                    styles.brand,
                    {
                      color: theme.accent,
                    },
                  ]}
                >
                  GYM CONNECT
                </ThemedText>
              </View>

              <ThemedText
                type="subtitle"
                style={[
                  styles.heroTitle,
                  {
                    color: theme.heroText,
                  },
                ]}
              >
                Equipment details
              </ThemedText>

              <ThemedText
                type="small"
                style={{
                  color: theme.heroSubtext,
                }}
              >
                View equipment information and alternatives.
              </ThemedText>
            </View>
          </View>

          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme.accent}
              />
            ) : error ? (
              <View style={styles.messageContainer}>
                <ThemedText
                  style={{
                    color: theme.danger,
                  }}
                >
                  {error}
                </ThemedText>

                <Pressable
                  accessibilityRole="button"
                  onPress={goBack}
                >
                  <ThemedText
                    type="smallBold"
                    style={{
                      color: theme.accentText,
                    }}
                  >
                    Back to equipment
                  </ThemedText>
                </Pressable>
              </View>
            ) : equipment &&
              statusColors &&
              content ? (
              <>
                {/* Equipment image */}
                <View
                  style={[
                    styles.imageContainer,
                    {
                      backgroundColor:
                        theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {equipmentImage(equipment) !== undefined ? (
                    <Image
                      source={equipmentImage(equipment)}
                      style={styles.equipmentImage}
                      contentFit="contain"
                      accessibilityLabel={`${equipment.name} image`}
                    />
                  ) : (
                    <View
                      style={[
                        styles.imagePlaceholder,
                        {
                          backgroundColor:
                            theme.backgroundSelected,
                        },
                      ]}
                    >
                      <Ionicons
                        name="barbell-outline"
                        size={64}
                        color={theme.accent}
                      />

                      <ThemedText
                        type="small"
                        themeColor="textSecondary"
                      >
                        No equipment image available
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* Equipment summary */}
                <View style={styles.summarySection}>
                  <View style={styles.titleRow}>
                    <ThemedText
                      type="subtitle"
                      style={styles.equipmentName}
                    >
                      {equipment.name}
                    </ThemedText>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusColors.background,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              statusColors.foreground,
                          },
                        ]}
                      />

                      <ThemedText
                        type="smallBold"
                        style={{
                          color:
                            statusColors.foreground,
                        }}
                      >
                        {STATUS_LABEL[equipment.status]}
                      </ThemedText>
                    </View>
                  </View>

                  {availabilityMessage && (
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="time-outline"
                        size={17}
                        color={theme.accentText}
                      />

                      <ThemedText
                        type="small"
                        style={{
                          color: theme.accentText,
                        }}
                      >
                        {availabilityMessage}
                      </ThemedText>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <Ionicons
                      name="location-outline"
                      size={17}
                      color={theme.textSecondary}
                    />

                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                    >
                      {equipment.zone} zone ·{' '}
                      {equipment.station}
                    </ThemedText>
                  </View>

                  <View style={styles.tagRow}>
                    <View
                      style={[
                        styles.tag,
                        {
                          backgroundColor:
                            theme.backgroundSelected,
                        },
                      ]}
                    >
                      <ThemedText type="small">
                        {MUSCLE_LABEL[
                          equipment.muscleGroup
                        ]}
                      </ThemedText>
                    </View>

                    {content.classification && (
                      <View
                        style={[
                          styles.tag,
                          {
                            backgroundColor:
                              theme.backgroundSelected,
                          },
                        ]}
                      >
                        <ThemedText type="small">
                          {content.classification}
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.description}
                  >
                    {content.description}
                  </ThemedText>

                  <View
                    style={[
                      styles.divider,
                      {
                        backgroundColor: theme.border,
                      },
                    ]}
                  />
                </View>

                {/* Status reporting */}
                <EquipmentStatusSelector
                  selectedStatus={selectedStatus}
                  onSelect={chooseStatus}
                />

                {/* Optional note */}
                <View style={styles.noteSection}>
                  <View style={styles.noteHeading}>
                    <ThemedText type="smallBold">
                      Note (optional)
                    </ThemedText>

                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                    >
                      {note.length}/
                      {MAX_EQUIPMENT_REPORT_NOTE_LENGTH}
                    </ThemedText>
                  </View>

                  <TextInput
                    accessibilityLabel="Optional equipment report note"
                    placeholder="e.g. Finished my last set"
                    placeholderTextColor={
                      theme.textSecondary
                    }
                    value={note}
                    onChangeText={changeNote}
                    maxLength={
                      MAX_EQUIPMENT_REPORT_NOTE_LENGTH
                    }
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!submitting}
                    returnKeyType="default"
                    onFocus={() => {
                      noteFocusedRef.current = true;

                      scrollRef.current?.scrollToEnd({
                        animated: true,
                      });
                    }}
                    onBlur={() => {
                      noteFocusedRef.current = false;
                    }}
                    style={[
                      styles.noteInput,
                      {
                        color: theme.text,
                        backgroundColor:
                          theme.backgroundElement,
                        borderColor: theme.border,
                      },
                    ]}
                  />
                </View>

                {/* Submit status report */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Submit equipment status report"
                  accessibilityState={{
                    disabled:
                      !selectedStatus ||
                      submitting ||
                      reportSaved,
                  }}
                  disabled={
                    !selectedStatus ||
                    submitting ||
                    reportSaved
                  }
                  onPress={submitReport}
                  style={({ pressed }) => [
                    styles.submitButton,
                    {
                      backgroundColor:
                        theme.primary,

                      opacity:
                        !selectedStatus ||
                          submitting ||
                          reportSaved
                          ? 0.5
                          : pressed
                            ? 0.8
                            : 1,
                    },
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator
                      color={theme.onPrimary}
                    />
                  ) : (
                    <>
                      <Ionicons
                        name={
                          reportSaved
                            ? 'checkmark-circle-outline'
                            : 'send-outline'
                        }
                        size={19}
                        color={theme.onPrimary}
                      />

                      <ThemedText
                        type="smallBold"
                        style={{
                          color: theme.onPrimary,
                        }}
                      >
                        {reportSaved
                          ? 'Report saved'
                          : 'Submit report'}
                      </ThemedText>
                    </>
                  )}
                </Pressable>

                {submitError && (
                  <ThemedText
                    type="small"
                    style={{
                      color: theme.danger,
                    }}
                    accessibilityRole="alert"
                  >
                    {submitError}
                  </ThemedText>
                )}

                {reportSaved ? (
                  <View
                    style={[
                      styles.feedbackBox,
                      {
                        backgroundColor:
                          theme.successSoft,
                      },
                    ]}
                    accessibilityRole="alert"
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color={theme.success}
                    />

                    <ThemedText
                      type="small"
                      style={[
                        styles.flex,
                        {
                          color: theme.success,
                        },
                      ]}
                    >
                      Report saved for this session.
                      The equipment&apos;s official status
                      has not changed.
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.notice}
                  >
                    Demo reports reset when the app restarts
                    and do not update
                    the official equipment status.
                  </ThemedText>
                )}

                {/* NEW: Find Alternatives */}
                <View style={styles.alternativesSection}>
                  <View
                    style={[
                      styles.divider,
                      {
                        backgroundColor: theme.border,
                      },
                    ]}
                  />

                  <ThemedText type="smallBold">
                    Equipment alternatives
                  </ThemedText>

                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                  >
                    Find other available machines
                    for the same muscle group
                    at this branch.
                  </ThemedText>

                  {/* Marigold Find Alternatives Button */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Find alternative equipment"
                    accessibilityState={{
                      disabled: alternativesLoading,
                    }}
                    disabled={alternativesLoading}
                    onPress={findAlternatives}
                    style={({ pressed }) => [
                      styles.findButton,
                      {
                        backgroundColor:
                          theme.accent,

                        opacity:
                          alternativesLoading
                            ? 0.65
                            : pressed
                              ? 0.8
                              : 1,
                      },
                    ]}
                  >
                    {alternativesLoading ? (
                      <ActivityIndicator
                        color={theme.onAccent}
                      />
                    ) : (
                      <Ionicons
                        name="search-outline"
                        size={20}
                        color={theme.onAccent}
                      />
                    )}

                    <ThemedText
                      type="smallBold"
                      style={{
                        color: theme.onAccent,
                      }}
                    >
                      {alternativesLoading
                        ? 'Finding alternatives...'
                        : 'Find alternatives'}
                    </ThemedText>
                  </Pressable>

                  {/* Results appear after button is tapped */}
                  {alternativesVisible && (
                    <View style={styles.resultsSection}>
                      {alternativesLoading ? (
                        <ThemedText
                          type="small"
                          themeColor="textSecondary"
                        >
                          Checking equipment availability...
                        </ThemedText>
                      ) : alternativesError ? (
                        <View
                          style={[
                            styles.resultsMessage,
                            {
                              backgroundColor:
                                theme.backgroundElement,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Ionicons
                            name="alert-circle-outline"
                            size={21}
                            color={theme.danger}
                          />

                          <ThemedText
                            type="small"
                            style={[
                              styles.flex,
                              {
                                color: theme.danger,
                              },
                            ]}
                          >
                            {alternativesError}
                          </ThemedText>
                        </View>
                      ) : alternatives.length === 0 ? (
                        <View
                          style={[
                            styles.resultsMessage,
                            {
                              backgroundColor:
                                theme.backgroundElement,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Ionicons
                            name="information-circle-outline"
                            size={21}
                            color={theme.textSecondary}
                          />

                          <ThemedText
                            type="small"
                            themeColor="textSecondary"
                            style={styles.flex}
                          >
                            No available equipment
                            targeting the same muscle
                            group was found at this branch.
                          </ThemedText>
                        </View>
                      ) : (
                        <>
                          <View style={styles.resultsHeader}>
                            <ThemedText type="smallBold">
                              Available alternatives
                            </ThemedText>

                            <ThemedText
                              type="small"
                              themeColor="textSecondary"
                            >
                              {alternatives.length}{' '}
                              {alternatives.length === 1
                                ? 'machine'
                                : 'machines'}
                            </ThemedText>
                          </View>

                          {alternatives.map((alternative) => (
                            <AlternativeEquipmentCard
                              key={alternative.equipment.id}
                              alternative={alternative}
                              onPress={() =>
                                openAlternative(
                                  alternative.equipment.id
                                )
                              }
                            />
                          ))}
                        </>
                      )}
                    </View>
                  )}
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scroll: {
    paddingBottom: Spacing.five,
  },

  // Gym Connect header
  hero: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
  },

  heroInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.two,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brand: {
    letterSpacing: 3,
  },

  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
  },

  // Equipment image and content
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },

  imageContainer: {
    width: '100%',
    height: 210,
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  equipmentImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },

  // Equipment summary
  summarySection: {
    gap: Spacing.two,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },

  equipmentName: {
    flex: 1,
    fontSize: 22,
    lineHeight: 30,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Spacing.three,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },

  tag: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: Spacing.one,
  },

  divider: {
    height: 1,
    width: '100%',
    marginTop: Spacing.two,
  },

  // Status selection
  statusSection: {
    gap: Spacing.two,
  },

  statusOptions: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },

  statusOption: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },

  optionStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  optionLabel: {
    flex: 1,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Optional note
  noteSection: {
    gap: Spacing.two,
  },

  noteHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  noteInput: {
    minHeight: 92,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },

  // Report submission
  submitButton: {
    minHeight: 52,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },

  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },

  notice: {
    fontSize: 12,
    lineHeight: 18,
  },

  // NEW: Alternatives section
  alternativesSection: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },

  findButton: {
    minHeight: 52,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },

  resultsSection: {
    gap: Spacing.two,
  },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },

  resultsMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },

  alternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },

  alternativeIcon: {
    width: 46,
    height: 46,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },

  alternativeInfo: {
    flex: 1,
    gap: Spacing.one,
  },

  alternativeReason: {
    fontSize: 11,
    lineHeight: 15,
  },

  alternativeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  alternativeStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  alternativeStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Loading and error states
  messageContainer: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
});
